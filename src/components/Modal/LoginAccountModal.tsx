import { Modal } from 'react-bootstrap'
import imageModalSuccess from '../../img/modal/successfully.png'
import { useMemo, MouseEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@solana/wallet-adapter-react';


interface LoginAccountModalProps {
    isOpen: boolean;
    handleClose: (event: MouseEvent ) => void
}

const LoginAccountModal = (props: LoginAccountModalProps) => {
    const [formatWallet, setFormatWallet] = useState<string>()
    const navigate = useNavigate();
    const { publicKey } = useWallet();
    const handleClickLogin = (event: MouseEvent) => {
        props.handleClose(event)
        navigate('/account/link-account')
    }

    const handleClickSignIn = (event: MouseEvent) => {
        props.handleClose(event)
        navigate('/account/sign-in')
    }
    return (
        <Modal show={props.isOpen} className="modal modal-alert" role="dialog" centered size='lg'>
                <Modal.Body>
                    <a href="#" onClick={props.handleClose} className="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </a>
                    <div className="text-center mb-3">
                        <div className="box-image">
                            <img src={imageModalSuccess} width="180" alt="" />
                        </div>
                    <h5 style={{ fontWeight: '600'}} className='mt-4'>Wallet { publicKey?.toBase58().slice(0,8) + '...' +  publicKey?.toBase58().slice(-8) } is now connected.</h5>
                    <h5 style={{ fontWeight: '600'}} className='mt-1'>Link to your in-game account to get started.</h5>
                    </div>
                <div className="row mt-4">
                    <div className='col text-center'>
                        <button style={{padding: '0 40px', borderRadius: '10px'}} onClick={handleClickLogin} className="btn btn-warning text-primary btn-big">Link to an existing GOGA app account</button>
                    </div>
                </div>
                <div className="row mt-4">
                    <div className='col text-center'>
                        <button style={{padding: '0 40px', borderRadius: '10px', minWidth: '486.38px', background:'none', border: '2px solid white', color: 'white'}} onClick={handleClickSignIn} className="btn btn-warning btn-big">Create new GOGA app account</button>
                    </div>
                </div>
                </Modal.Body>
        </Modal>
    )
}

export default LoginAccountModal;