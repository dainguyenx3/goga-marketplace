import { Modal, Row, Col, Card } from 'react-bootstrap';
import imageCoin from '../../img/price/coin.png';
import { CurrencyBalance } from '../../api';
import { useConfig } from '../../hooks/useConfig';
import { useCurrencyBalance } from '../../hooks/useCurrencyBalance';
import { REGEX_NUMBER } from '../../constant'

interface TransferModalProps {
    isOpen: boolean;
    handleClose: () => void;
    handleTransfer: () => void;
    type?: 'to_inventory' | 'to_wallet';
    transfer?: 'transfer_nft' | 'transfer_token';
    balance?: number | undefined;
    amount?: number | undefined;
    handleChangeAmount?: (value: number | undefined) => void;
    loading?: boolean;
    message?: string; 
    setMessage?: (value: string) => void
}

const TransferModal = ({isOpen, handleClose, transfer='transfer_nft', handleTransfer, type='to_inventory', balance=0, amount, handleChangeAmount, loading, message, setMessage} : TransferModalProps) => {
    const currency_info = useCurrencyBalance();
    const config = useConfig();

    return (
        <Modal show={isOpen} className="modal modal-alert" role="dialog" centered size='lg' >
            <Modal.Title style={{ textAlign: 'center', fontSize: '40px',fontWeight: 600 }}>{transfer === 'transfer_token' ? 'Transfer': 'Confirm transfer'}</Modal.Title>
            <a href="#" onClick={(e) => {
                e.preventDefault()
                handleClose()
            }} className="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </a>
            <Modal.Body>
                {transfer === 'transfer_token' ? (
                    <div className="mb-3">
                        <Col className='text-center' style={{fontWeight: 600}}>
                            {`Transfer GOGA Token from ${type === 'to_wallet' ? 'Ingame Account' : 'wallet'} to ${type !== 'to_wallet' ? 'Ingame Account' : 'wallet'}`}
                        </Col>
                        <Col className='mt-4' style={{border: '2px solid', }}></Col>
                        <Col className='text-center mt-4' style={{color: '#FAD64A', fontSize: '20px', fontWeight: 700}}>
                            {`${type === 'to_wallet' ? 'Ingame currency' : 'Your Wallet'}: ${amount && amount >= 0 ? Number((balance - amount).toFixed(9)) : Number(balance.toString())} ${currency_info?.name}`}
                        </Col>
                        <Col className='text-center mt-4' style={{fontSize: '20px', fontWeight: 700}}>
                            Amount
                        </Col>
                        <Col className='text-center mt-4'>
                            <input onChange={(e: any) => {
                                        e.target.value = e.target.value.replace(REGEX_NUMBER, '')
                                        if(e.target.value && handleChangeAmount && (Number(e.target.value) <= balance)) {
                                            handleChangeAmount(e.target.value)
                                        }else if(handleChangeAmount && !e.target.value) {
                                            handleChangeAmount(undefined)
                                        } else if((setMessage && (Number(e.target.value) > balance || (type === 'to_inventory' && Number(e.target.value) > balance) ))) {
                                            setMessage('Not enough GGT')
                                        }
                                    }
                                } 
                                style={{position: 'relative'}} 
                                type="text"
                                step='0.1'
                                className="form-control"
                                value={amount ? amount : ''}
                            />
                             
                            <div className="input-group mb-2 mr-sm-2">
                                <div style={{position: 'absolute', top: '-53px', right: 0}} className="input-group-prepend">
                                    <div style={{background: 'none', border: '0', fontWeight: 700, fontSize: '20px'}} className="input-group-text">
                                        {currency_info.name} <img width='40px' height='46px' src={imageCoin} />
                                    </div>
                                </div>
                            </div>
                        </Col>
                        {message &&  transfer === 'transfer_token' && (<div className='col text-center mb-2' style={{color: 'rgb(250, 214, 74)'}}>{message}</div>)}
                        {type === 'to_wallet' && (
                            <Col className='mt-4'>
                                <Row style={{fontWeight: 600}}>
                                    <Col>Charge fee:</Col>
                                    <Col className='text-right'>{Number(currency_info?.withdrawFee) + ' ' + currency_info?.name}</Col>
                                </Row>
                            </Col>
                        )}
                        <Col className='text-center mt-4 mb-4' style={{fontWeight: 600}}>
                        {`You will transfer ${amount && Number(amount) > 0 ? parseFloat(Number((Number(amount) - (transfer === 'transfer_token' ? ( type === 'to_wallet' ? Number(currency_info?.withdrawFee) : 0) : (Number(config.nftWithdrawFee)))).toString()).toFixed(9)) : '0'} ${currency_info.name} to ${type === 'to_wallet' ? 'Wallet': 'Ingame'} Account`}
                        </Col>

                    </div>
                ) : (
                <div className="mb-2" style={{fontSize: '24px', fontWeight: 600}}>
                    <Card body style={{borderRadius: '10px', color: 'black'}}>
                        <div className="row mb-2">
                        <div className="col-8" style={{color: '#7B7B7B'}}>From</div>
                            <div className="col-4 text-right" style={{color: '#7B7B7B'}} >To</div>
                        </div>
                        <div className="row">
                            <div className="col-8">{ type === 'to_inventory' ? 'Wallet' : 'Inventory'}</div>
                            <div className="col-4 text-right" >{ type === 'to_inventory' ? 'Inventory' : 'Wallet'}</div>
                        </div>
                    </Card> 
                    {type === 'to_wallet' && (
                        <div className="row mt-4">
                        <div className="col-8">Fee</div>
                        <div className="col-4 text-right" >{config.nftWithdrawFee} {currency_info?.name}</div>
                    </div>
                    )}
                    <div className="row mt-4">
                        <div className="col-8">You will transfer</div>
                        <div className="col-4 text-right" >1 NFT</div>
                    </div>
                </div>
                )}
                {message &&  transfer === 'transfer_nft' && (<div className='col text-center mb-2' style={{color: 'rgb(250, 214, 74)'}}>{message}</div>)}
                <Row className='mt-2'>
                    <Col className='text-center'>
                        <button disabled={loading || ( transfer === 'transfer_token' && (!amount || amount < 0 || (type === 'to_wallet' && Number(Number(amount) - Number(currency_info.withdrawFee)) < 0)) ? true : false )} style={{padding: '10px 60px', borderRadius: '10px'}} onClick={handleTransfer} className="btn btn-success">{transfer === 'transfer_token' ? 'Confirm': 'Transfer'}</button>
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    )
}
export default TransferModal