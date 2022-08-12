import Back from "./Back";
import Sidebar from "./Sidebar";
import api from "../../utils/axios-config";
import { useContext, useState, MouseEvent, useRef, useEffect } from "react";
import { ConfigContext } from '../../App';
import { Row, Col } from 'react-bootstrap';
import { validateEmail } from '../../utils/validate';
import { useProfile } from '../../hooks/useProfile';
import {sendCode, linkAccount, getProfile} from '../../api';
import { useNavigate } from 'react-router-dom';

const ERROR_MESSAGE: any = {
    INTERNAL_ERROR: "Sorry, something went wrong there. Try again.",
    INVALID_LINKED: "! This account is already connected linked to another wallet",
    INVALID_EMAIL: "Couldn't find your ingame account with this email",
    INVALID_CODE: "Incorrect or expired verification code. Your email verification will be locked after entering incorrect code 5 times",
    TOO_MANY_REQUEST: "An incorrect code was entered too many times, so we blocked wallet address.Try again in 24h",
    EXPIRED: "Expired verification code"
}

export interface UserProfile {
    id: string;
    linked: boolean;
    status: number;
    version: number;
    customer: any;
}

const LinkAccount = () => {
    const [email, setEmail] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [expiredCode, setExpiredCode] = useState<number>(0);
    const [code, setCode] = useState<string>();
    const config = useContext(ConfigContext);
    const {profile, setProfile} = useProfile();
    const navigate = useNavigate();
    const [buttonText, setButtonText] = useState<string>('Send code')
    useEffect(() => {
        getProfile().then((res) => {
            const {data} = res
            setProfile(data)
        })
    }, [])

    const handleSendCode = async (e: MouseEvent) => {
        e.preventDefault()
        if(email) {
            if(!validateEmail(email)) {
                setErrorMessage('! Invalid email format')
            }else {
                const response = await sendCode(email);
                if(response.result === 'SUCCESS') {
                    setExpiredCode(300)
                } else {
                    if(response.result in ERROR_MESSAGE) {
                        setErrorMessage(ERROR_MESSAGE[response.result])
                    } else {
                        setErrorMessage(response.result)
                    }
                }
            }
        } else {
            setErrorMessage('! Email not entered')
        }
    }

    useEffect(() => {
        if(expiredCode > 0) {
            setButtonText('Resend')
            const interval = setInterval(_ => {
                setExpiredCode(expiredCode - 1)
            }, 1000);
            return () => {
                clearInterval(interval)
            };
        }
    }, [expiredCode]);

    const handleLinkAccount = async () => {
        if(email) {
            if(!validateEmail(email)) {
                setErrorMessage('! Invalid email format')
            }else {
                if(!code) {
                    setErrorMessage('Verification code not entered');
                } else {
                    const response = await linkAccount(email!, code!);
                    if(response.result === 'SUCCESS') {
                        setProfile(response.customer.profile)
                    } else {
                        if(response.result in ERROR_MESSAGE) {
                            setErrorMessage(ERROR_MESSAGE[response.result])
                        } else {
                            setErrorMessage(response.result)
                        }
                    }
                }
            }
        } else {
            setErrorMessage('! Email not entered')
        }
    }

    return (
        <section className="container">
            <Back />
            <div className="row pb-5">
                <Sidebar />
                <div className="col-lg-9">
                    <div className="wrap_form-login py-5">
                        {
                            (profile && profile?.linked) ? (
                                <Row>
                                    <Col md={{ span: 6, offset: 3 }} style={{padding: '70px', background: '#715AFF', borderRadius: '10px', fontWeight: 600}}>
                                        {`Your email: ${profile?.email}`}
                                    </Col>
                                </Row>
                            ) : (
                            <form action="" className="form-login">
                                <h3 className="text-pink mb-4">Link to your GOGA in-game account</h3>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input type="email" onChange={(e) => setEmail(e.target.value.trim())} value={email || ''} className="form-control rounded-pill" />
                                </div>
                                <p>Click <a href="#" className="link-light">Send code</a> to get verification code</p>

                                <div className="mb-3 verify-email">
                                    <input onChange={(e) => setCode(e.target.value)} type="number" value={code}  className="form-control rounded-pill" placeholder="Email verification code" />
                                    {expiredCode > 0 ? (<span className="link-warning btn-send_code" 
                                        style={{
                                            borderRadius: '50%', 
                                            border: '1px solid #919191', 
                                            padding: '8px 5px 5px 5px', 
                                            top: '5px', 
                                            minWidth: '42.33px', 
                                            right: '4px', 
                                            minHeight: '40.8px', 
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontWeight: '600',
                                            fontSize: '15px'
                                        }}
                                    >{expiredCode + 's'}</span>) : (<a href="#" onClick={handleSendCode} className="link-warning btn-send_code">{buttonText}</a>)}
                                </div>

                                <div className="py-3 mb-3 message message-warning">
                                    {
                                        errorMessage ? (errorMessage) : ''
                                    }
                                </div>

                                <div className="mb-3">
                                    <button  onClick={handleLinkAccount} className="btn btn-warning fluid" type="button">Link Account</button>
                                </div>
                                <div style={{fontWeight: 600}}>
                                    Don't have an account yet? <a href="#" onClick={(e) => {
                                        e.preventDefault()
                                        navigate('/account/sign-in')
                                    }} style={{color: '#FFAB0F'}}>Sign up</a>
                                </div>
                            </form>
                            )
                        }
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LinkAccount;
