
import warningImage from '../../img/warning.png';
import { useEffect } from 'react';
import {TIME_HIDDEN_WARNING} from '../../constant';
import CSS from 'csstype';

interface TransactionCancelProps {
    isShow: boolean;
    handCloseWarning: () => void;
    message?: string | undefined;
    width?: number  | undefined
}
const TransactionCancel = ({ isShow, handCloseWarning, message, width }: TransactionCancelProps) => {
    useEffect(() => {
        if (isShow) {
            const timeId = setTimeout(() => {
                handCloseWarning()
            }, TIME_HIDDEN_WARNING)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [isShow])

    const styleMessage: CSS.Properties = !message ? { position: "fixed", top: "20px" } : (width ? {position: "fixed", top: "20px", width: width + 'px', left: `calc(50% - ${width/2}px)` } : { position: "fixed", top: "20px", width: '900px', left: 'calc(50% - 450px)' })

    return (
        <div className={`alert alert-light alert-popup icon-left ${isShow ? 'show': ''}`} role="alert" style={styleMessage}>
            <a href="#" onClick={(e) => {
                e.preventDefault()
                handCloseWarning()
            }} className="close" data-dismiss="alert-popup" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </a>
                <img className="icon" src={warningImage} alt="warning" />
                <span>{message ? message: 'You have rejected the transaction'}</span>
        </div>
    )
}

export default TransactionCancel;