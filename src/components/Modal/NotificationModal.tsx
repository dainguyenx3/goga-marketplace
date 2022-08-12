import { useEffect } from 'react';
import warningImage from '../..//img/warning.png';
const TIME_HIDDEN = 5000;
interface NotificationModalProps {
    message: string;
    isOpen: boolean;
    handCloseWarning: () => void
}

const NotificationModal = ({ message, isOpen, handCloseWarning }: NotificationModalProps) => {
    
    useEffect(() => {
        if (isOpen) {
            const timeId = setTimeout(() => {
                handCloseWarning()
            }, TIME_HIDDEN)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [isOpen])

    return (
        <>
            {isOpen ? (<div className="alert alert-light alert-popup icon-left show" role="alert" style={{position: "absolute", top: "20px"}}>
            <a href="#" onClick={handCloseWarning} className="close" data-dismiss="alert-popup" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </a>
            <img className="icon" src={warningImage} alt="warning" /> {message}
            </div>
            ) : ('')
        }
        </>
    );
}

export default NotificationModal;