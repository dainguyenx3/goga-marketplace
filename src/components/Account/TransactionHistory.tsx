import Pagination from "../Pagination";
import { convertTime } from '../../utils/convert-time';
import { CurrencyBalance } from '../../api'

export interface TransactionHistoryProps {
    history: any;
    page: number;
    max: number;
    handleChangePage: (page: number) => void;
    currencyBalance: CurrencyBalance
}

export const SIDE_TRANSFER: any = {
    '1': 'Transfer-in',
    '-1': 'Transfer-out'
}

export const STATUS_TRANSFER : any = {
    1: 'Pending',
    2: 'Success',
    3: 'Failure',
    11: 'Rejected',
    12: 'Cancelled',
    13: 'Processing'
}

const TransactionHistory = ({ history, page, max,handleChangePage, currencyBalance } : TransactionHistoryProps) => {
    return (
        <div className="tab-panel">
            <div className="panel" id="box-history"></div>    

            <div className="panel " id="goga-nfts-history"></div>    
                                       
            <div className="panel active" id="transaction-history">
                <div className="table-data table-responsive">
                    {
                        history && history.length > 0 ? (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Type/Status</th>
                                        <th>Amount/Time</th>
                                        <th className="text-right">Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { history.map((item: any) => {
                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <p><strong>{ (item.side?.toString() in SIDE_TRANSFER)  ? SIDE_TRANSFER[item.side?.toString()] : item.side}</strong></p>
                                                    <p className="text-success">{ (item.status in STATUS_TRANSFER) ? STATUS_TRANSFER[item.status] : item.status }</p>
                                                </td>
                                                <td >
                                                    <p><strong>{parseFloat(item.amount) + ' ' + currencyBalance?.name }</strong></p>
                                                    <p className="fst-italic">{item.requestTime && convertTime(parseFloat(item.requestTime))}</p>
                                                </td>
                                                <td className="text-right">
                                                    <p><strong>{item.side === 1 ? 'Undefined' : (parseFloat(item.commission) + ' ' + currencyBalance?.name)}</strong></p>
                                                </td>
                                            </tr>
                                        )
                                    })
                                    }                            
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center py-5 fs-3 fw-bold text-secondary">You don’t have any transactions </p>
                        )
                    }
                    
                </div>

                <Pagination max={max} handleChangePage={handleChangePage} page={page} />    
            </div>
        </div>
    )
}

export default TransactionHistory;