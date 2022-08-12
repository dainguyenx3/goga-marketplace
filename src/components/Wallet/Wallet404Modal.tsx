import { Modal } from 'react-bootstrap'
import { FC, useCallback, useEffect, useState } from 'react'
import { WalletMultiButton } from './WalletMultiButton';
import image404 from '../../img/wallet-404.png'
import { useNavigate } from 'react-router-dom';

interface Wallet404ModalProps {
    connected: boolean;
    wallet: any;
}

const Wallet404Modal: FC<Wallet404ModalProps> = ({ wallet, connected }) => {

    const [isShow, setIsShow] = useState(false);
    const router = useNavigate();
    useEffect(() => {
        if (connected) {
            setIsShow(false)
            router(-1)
        } else {
            setIsShow(true)
        }
    }, [wallet?.name, connected])
    return (
        <Modal show={isShow} id="alert-connect-walllet" className="modal modal-overlay-full modal-alert" role="dialog" centered >
            <Modal.Body>
                <a href="#" onClick={() => setIsShow(false)} className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </a>
                <div className="text-center mb-3">
                    <div className="box-image">
                        <img src={image404} width="" alt="" />
                    </div>
                    <h3>{ wallet?.name?.toLocaleUpperCase() } NOT FOUND</h3>
                    <p>You need to setup MetaMask wallet to continue</p>
                    </div>
                <div className="text-center" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                    <WalletMultiButton className='btn btn-warning btn-lg btn-download text-primary'>{ wallet ? `Download ${wallet?.name}` : 'Connect wallet' }</WalletMultiButton>
                    {/* <button type="button" className="btn btn-warning btn-lg btn-download text-primary">Download metamask</button> */}
                </div>
                </Modal.Body>
        </Modal>
    )
}

export default Wallet404Modal