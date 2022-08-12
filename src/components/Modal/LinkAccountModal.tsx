import { Modal } from 'react-bootstrap'
import imageModalSuccess from '../../img/modal/successfully.png'
import { MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react';
import { validateEmail } from '../../utils/validate';
import { sendCode, linkAccount } from '../../api'
import { useProfile } from '../../hooks/useProfile';

interface LinkAccountModalProps {
    isOpen: boolean;
    email: string;
    handleClose: () => void;
    expiredCode: number;
    setExpiredCode: (value: number) => void
}

const ERROR_MESSAGE: any = {
    INVALID_CODE: "Incorrect or expired verification code. Your email verification will be locked after entering incorrect code 5 times",
    EXPIRED: "Incorrect or expired verification code. Your email verification will be locked after entering incorrect code 5 times",
    TOO_MANY_REQUEST: "An incorrect code was entered too many times, so we blocked wallet address.Try again in 24h",
    INTERNAL_ERROR: "Sorry, something went wrong there. Try again."
}

const LinkAccountModal = ({isOpen, email, handleClose, expiredCode, setExpiredCode} : LinkAccountModalProps) => {
    const [errorMessage, setErrorMessage] = useState<string>();
    const { profile, setProfile } = useProfile();
    const [code, setCode] = useState<string>();

    useEffect(() => {
        if(expiredCode > 0) {
            const interval = setInterval(_ => {
                setExpiredCode(expiredCode - 1)
            }, 1000);
            return () => {
                clearInterval(interval)
            };
        }
    }, [expiredCode]);

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
                        handleClose()
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
        <Modal show={isOpen} className="modal modal-alert" role="dialog" centered size='lg'>
                <Modal.Body>
                    <a href="#" onClick={handleClose} className="close" style={{right: '5px', top: '-5px'}} aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </a>
                    <div className="text-center mb-3">
                        <div className="box-image">
                            <img src={imageModalSuccess} width="180" alt="" />
                        </div>
                    <h5 style={{ fontWeight: '600'}} className='mt-4 text-center'>Your account has been created successully.</h5>
                    <h5 style={{ fontWeight: '600'}} className='text-center'>An email has been sent to {email} <br /> to verify your account.</h5>
                    </div>
                    <form action="" className="form-login mt-4">
                        <div className="mb-3 verify-email">
                            <input onChange={(e) => setCode(e.target.value)} type="number" value={code}  className="form-control rounded-pill" placeholder="Enter the code we sent to your email" />
                            {expiredCode > 0 ? 
                                (<span 
                                    className="link-warning btn-send_code" 
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
                                    }}>
                                        {expiredCode}
                                </span>) 
                                : (<a href="#" onClick={handleSendCode} className="link-warning btn-send_code">Resend</a>)
                            }
                        </div>

                        <div className="py-3 mb-3 message message-warning">
                                    {errorMessage ? (errorMessage) : ''}
                        </div>
                        <div className="row mt-4">
                            <div className='col text-center'>
                                <button type='button' style={{padding: '0 40px', borderRadius: '10px'}} onClick={handleLinkAccount} className="btn btn-warning text-primary btn-big">Link Account</button>
                            </div>
                        </div>
                    </form>
                </Modal.Body>
        </Modal>
    )
}

export default LinkAccountModal