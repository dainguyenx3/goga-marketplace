import Back from "./Back";
import Sidebar from "./Sidebar";
import api from "../../utils/axios-config";
import { useContext, useState, MouseEvent, useRef, useEffect } from "react";
import { ConfigContext } from '../../App';
import { Row, Col } from 'react-bootstrap';
import { validateEmail } from '../../utils/validate';
import { useProfile } from '../../hooks/useProfile';
import {signInAccount} from '../../api';
import imageLogo from '../../img/logo-goga.png'
import { FaEyeSlash, FaEye } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom';
import LinkAccountModal from '../Modal/LinkAccountModal';
import useLocation from "../../hooks/useLocation";

const ERROR_MESSAGE: any = {
    INVALID_LINKED: "! This account is already connected linked to another wallet",
    INVALID_CODE: "Couldn't find your ingame account with this email",
    EXPIRED: "Incorrect or expired verification code. Your email verification will be locked after entering incorrect code 5 times",
    TOO_MANY_REQUEST: "An incorrect code was entered too many times, so we blocked wallet address.Try again in 24h",
    INTERNAL_ERROR: "Sorry, something went wrong there. Try again."
}

export interface UserProfile {
    id: string;
    linked: boolean;
    status: number;
    version: number;
    customer: any;
}

const SignIn = () => {
    const [email, setEmail] = useState<string>();
    const [name, setName] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [expiredCode, setExpiredCode] = useState<number>(0);
    const [code, setCode] = useState<string>();
    const [isShowPassword, setIsShowPassword] = useState<boolean>(false)
    const config = useContext(ConfigContext);
    const {profile, setProfile} = useProfile();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const {language, country} = useLocation({});
    const handleClickCreateAccount = async () => {
        setLoading(true);
        if(!name) {
            setErrorMessage('! Name not entered');
        } else if(!email) {
            setErrorMessage('! Email not entered');
        } else if(!password) {
            setErrorMessage('! Password not entered')
        } else if(!validateEmail(email)) {
            setErrorMessage('! Invalid email format');
        } else {
            const response = await signInAccount({email, name, password, country, language});
            if(response.data.result === 'SUCCESS') {
                setIsOpen(true)
                setExpiredCode(300);
            } else {
                if(response.data.result in ERROR_MESSAGE) {
                    setErrorMessage(ERROR_MESSAGE[response.data.result])
                } else {
                    setErrorMessage(response.data.result)
                }
            }
        }
        setLoading(false);
    }

    return (
        <>
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
                                <div className="wrap_form-signup row justify-content-center">
                                    <div className="col-lg-6 text-center py-4">
                                        <div className="box-image mb-4">
                                            <img src={imageLogo} alt="" />
                                        </div>
                                        <p className="mb-5">To create an account, please fill the required fields </p>
                                        <form action="" className="form-signup">
                                            <div className={`mb-3 field ${errorMessage && !name ? 'error' : ''}`}>
                                                <label className="form-label">Name</label>
                                                <input onChange={(e) => setName(e.target.value.trim())} type="text" className="form-control rounded-pill" id="inputName" />
                                            </div>
    
                                            <div className={`mb-3 field ${(errorMessage && !email) || (email && !validateEmail(email!)) ? 'error' : ''}`}>
                                                <label className="form-label">Email</label>
                                                <input onChange={(e) => setEmail(e.target.value.trim())} type="email" className="form-control rounded-pill" id="inputEmail" placeholder="VD: mainguyen@gmail.com" />
                                            </div>
    
                                            <div className="mb-5 field field-password">
                                                <label className="form-label">Password</label>
                                                <div className={`input-group ${errorMessage && !password ? 'error-password' : ''}`} style={{ borderRadius: '50rem'}}>
                                                    <input onChange={(e) => setPassword(e.target.value.trim())} style={{borderTopLeftRadius: '50rem', borderBottomLeftRadius: '50rem' }} type={isShowPassword ? "text" : "password"} className="form-control" id="inputPassword" />
                                                    <button type="button" onClick={() => setIsShowPassword(!isShowPassword)} style={{borderTopRightRadius: '50rem', borderBottomRightRadius: '50rem' }}>{isShowPassword ? <FaEye /> :<FaEyeSlash />}</button>
                                                </div>
                                            </div>
                                            {errorMessage && (
                                                <div className="py-3 mb-3 message message-warning">
                                                    {errorMessage}
                                                </div>
                                            )}
        
                                            <div className="mb-3">
                                                <button disabled={loading} onClick={handleClickCreateAccount} className="btn btn-signup fluid" type="button">Create an account</button>
                                            </div>
                                        </form>
                                        <p><strong>Already have an account ?&nbsp;
                                            <a className="link-light" href="#"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                navigate('/account/link-account')
                                            }}
                                             style={{textDecoration: 'underline'}} >Link Account</a></strong></p>
                                        <p className="text-small">When you click subscribe, it means you agree with 
                                            <a href="#" className="link-light"><strong>our terms</strong></a></p>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </section>
        {email && validateEmail(email) && 
        <LinkAccountModal 
            expiredCode={expiredCode} 
            setExpiredCode={(value: number) => setExpiredCode(value)} 
            isOpen={isOpen} 
            email={email} 
            handleClose={() => setIsOpen(false)} />}
        </>
    )
}

export default SignIn;
