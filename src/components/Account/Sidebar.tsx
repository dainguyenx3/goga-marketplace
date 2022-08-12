import imageAccount from '../../img/account/carbon_user-avatar-filled.png';
import imageCopy from '../../img/copy.png';
import { useNavigate, useParams } from 'react-router-dom';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';

const Sidebar = () => {
    const navigate = useNavigate();
    const { type } = useParams();
    const { publicKey } = useWallet();
    const [show, setShow] = useState<boolean>(false);

    const handleCopy = (e: any) => {
        e.preventDefault()
        navigator.clipboard.writeText(publicKey?.toBase58()!)
        setShow(!show);
    }

    useEffect(() => {
        if (show) {
            const timeId = setTimeout(() => {
                setShow(false)
            }, 3000)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [show])

    const popover = (
        <Popover>
          <Popover.Body style={{padding: '5px 15px'}}>
            Copied
          </Popover.Body>
        </Popover>
    );

    return (
        <div className="col-lg-3 sidebar">
            <div className="col-inner">
                <div className="box-image user_avatar">
                    <img src={imageAccount} alt="avatar" />
                </div>
            <div className="user_key py-3 mb-3">
                {publicKey && <span>{publicKey?.toBase58().slice(0, 8) + '...' + publicKey?.toBase58().slice(-8)}</span>} 
                <OverlayTrigger show={show} trigger="click" placement="bottom" overlay={popover}>
                    <a href="#" onClick={handleCopy} className="copy_text" data-bs-toggle="tooltip" data-bs-placement="top" title="Copied"><img src={imageCopy} alt="copy" /></a>
                </OverlayTrigger>
            </div>
                                
                <div className="menu">
                    <a onClick={() => navigate('/account/wallet')} className={`btn btn-secondary icon fluid mb-4 ${type === 'wallet' ? 'current' : ''}`}><span className="icon icon-wallet"></span> Wallet</a>
                    <a onClick={() => navigate('/account/history')} className={`btn btn-secondary icon fluid mb-4 ${type === 'history' ? 'current' : ''}`}><span className="icon icon-history"></span> History</a>
                    <a onClick={() => navigate('/account/link-account')} className={`btn btn-secondary icon fluid mb-4 ${type === 'link-account' || type === 'sign-in'  ? 'current' : ''}`}><span className="icon icon-account"></span> Account</a>
                </div>
            </div>
        </div> 
    )
}

export default Sidebar;