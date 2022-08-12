import Pagination from "../Pagination";
import imageCopy from '../../img/copy.png';
import { TransactionHistoryProps, STATUS_TRANSFER, SIDE_TRANSFER} from './TransactionHistory';
import { convertTime } from '../../utils/convert-time';
import { useState, useEffect } from "react";
import { Popover, OverlayTrigger } from 'react-bootstrap'

const BoxHistory = ({ history, page, max, handleChangePage, currencyBalance } : TransactionHistoryProps) => {

    const [showHash, setShowHash] = useState<string | undefined>();

    const handleCopy = (e: any, txHash: string) => {
        e.preventDefault()
        navigator.clipboard.writeText(txHash)
        setShowHash(txHash);
    }

    useEffect(() => {
        if (showHash) {
            const timeId = setTimeout(() => {
                setShowHash(undefined)
            }, 3000)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [showHash]);

    const popover = (
        <Popover>
          <Popover.Body style={{padding: '5px 15px'}}>
            Copied
          </Popover.Body>
        </Popover>
    );
    return (
        <div className="tab-panel">
            <div className="panel active" id="box-history">
                <div className="table-data table-responsive">
                    {
                        history && history.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Type/Status</th>
                                        <th>Fee/Time</th>
                                        <th>Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item: any) => {
                                        return (
                                            <tr>
                                                <td>
                                                    <p><strong>{item.quality + ' ' + item?.name?.split('#')[0]}</strong></p>
                                                    <p>{'#' + item.tokenId}</p>
                                                </td>
                                                <td>
                                                    <p><strong>{ (item.side?.toString() in SIDE_TRANSFER)  ? SIDE_TRANSFER[item.side?.toString()] : item.side}</strong></p>
                                                    <p className="text-success">{ (item.status in STATUS_TRANSFER) ? STATUS_TRANSFER[item.status] : item.status }</p>
                                                </td>
                                                <td>
                                                    <p><strong>{item.side === 1 ? 'Undefined' :  (parseFloat(item.commission) + ' ' + currencyBalance?.name)}</strong></p>
                                                    <p className="fst-italic">{item.requestTime && convertTime(parseFloat(item.requestTime))}</p>
                                                </td>
                                                <td>
                                                    <OverlayTrigger show={showHash && showHash === item.txHash ? true : false} trigger="click" placement="bottom" overlay={popover}>
                                                        <p><span>{item.txHash?.slice(0, 5) + '...' + item.txHash?.slice(-5)}</span> <a href="#" onClick={(e) => handleCopy(e, item.txHash)} className="copy_text" data-bs-toggle="tooltip" data-bs-placement="top" title="Copied"><img src={imageCopy} alt="copy" /></a></p>
                                                    </OverlayTrigger>
                                                </td>
                                            </tr>
                                        )
                                    })
                                }                        
                                </tbody>
                            </table>
                        ): (
                            <p className="text-center py-5 fs-3 fw-bold text-secondary">You don’t have any transactions </p>
                        )
                    }
                </div>
                <Pagination max={max} handleChangePage={handleChangePage} page={page} />
            </div>    


        </div>
    )
}

export default BoxHistory;