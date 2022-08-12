import React, { useCallback, useState, useEffect, MouseEvent } from 'react';
import { BN, web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { SingleTokenInfo, getTokenMetadataByMintAddress, NftMetadata, CandyShop } from '@liqnft/candy-shop-sdk';

import { Modal } from 'react-bootstrap';
import { Processing } from '../Processing';
import { handleError, ErrorType, ErrorMsgMap } from '../../utils/ErrorHandler';
import { notification, NotificationType } from '../../utils/rc-notification';
import { TransactionState } from '../../model';
import { CandyShop as CandyShopResponse, Nft } from '@liqnft/candy-shop-types';
import { TIMEOUT_EXTRA_LOADING, ROYALTY_FEE, PLATFORM_FEE } from '../../constant';
import { useUnmountTimeout } from '../../hooks/useUnmountTimeout';
import { Card } from 'react-bootstrap';
import './style.less';
import TransactionCancel from '../Transaction/TransactionCancel';
import { useNavigate } from 'react-router-dom';
import { useAlter } from '../../hooks/useAlter'
import { MESSAGE_SUCCESS, TIME_HIDDEN_LOADING, MESSAGE_TRANSACTION_FAILD } from '../../constant';

export interface SellModalProps {
  onClose: () => void;
  nft: Nft;
  wallet: AnchorWallet;
  shop: CandyShopResponse;
  candyShop: CandyShop;
  isOpen: boolean;
  tokenAddress: string
}

export const SellModal: React.FC<SellModalProps> = ({ nft, wallet, shop, candyShop, isOpen, onClose, tokenAddress }) => {
  const [formState, setFormState] = useState<{ price: number | undefined }>({
    price: undefined
  });
  const [state, setState] = useState(TransactionState.DISPLAY);
  const [loading, setLoading] = useState<boolean>(true);
  const [royalties, setRoyalties] = useState<number>();
  const [isShowError, setIsShowError] = useState<boolean>(false);
  const setMessageAlter = useAlter()
  const timeoutRef = useUnmountTimeout();
  const navigate  = useNavigate();
  // List for sale and move to next step
  const sell = async () => {
    setState(TransactionState.PROCESSING);

    if (!wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }

    if (!formState.price) {
      notification('Please input sell price', NotificationType.Error);
      setState(TransactionState.DISPLAY);
      return;
    }

    const price = formState.price * candyShop.baseUnitsPerCurrency;

    return candyShop
      .sell({
        tokenAccount: new web3.PublicKey(tokenAddress),
        tokenMint: new web3.PublicKey(nft.mint),
        price: new BN(price),
        wallet
      })
      .then((txHash) => {
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.DISPLAY);
          setIsShowError(true)
          onClose()
          navigate('/inventory')
          setMessageAlter(MESSAGE_SUCCESS)
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err) => {
        // handleError({ error: err });
        setIsShowError(true)
        setState(TransactionState.DISPLAY);
      }).finally(() => {
        console.log('finally')
      });
  };

  // Check active button submit
  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setFormState((f) => ({ ...f, price: undefined }));
      return;
    }

    const regex3Decimals = new RegExp('^[0-9]{1,11}(?:.[0-9]{1,3})?$');
    if (regex3Decimals.test(e.target.value)) {
      setFormState((f) => ({ ...f, price: +(Number(e.target.value).toFixed(2)) }));
    }
  };

  useEffect(() => {
    if(state === TransactionState.PROCESSING) {
      const timeId = setTimeout(() => {
        onClose();
        navigate('/inventory')
        setMessageAlter(MESSAGE_TRANSACTION_FAILD);
      }, TIME_HIDDEN_LOADING)

      return () => {
          clearTimeout(timeId)
      }
    }
  }, [state])

  useEffect(() => {
    if(nft?.mint) {
      setLoading(true);
      getTokenMetadataByMintAddress(nft?.mint, candyShop.connection())
        .then((data: NftMetadata) => {
          setRoyalties(data.sellerFeeBasisPoints / 100);
        })
        .catch((err) => {
          console.log('ERROR getTokenMetadataByMintAddress', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [nft?.mint, candyShop]);
  
  const handleClose = (e: MouseEvent) => {
    e.preventDefault();
    onClose()
  }

  const disableListedBtn = formState.price === undefined || loading;

  return (
    <>
      <Modal show={isOpen} className="modal modal-alert" role="dialog" centered size='lg' >
        {state === TransactionState.DISPLAY && (
          <>
            <Modal.Title style={{ fontSize: '40px' }}>
              <div className="candy-title" style={{ color: 'white', paddingLeft: '1rem', fontWeight: 600 }} >Sell</div>
            </Modal.Title>
            <div className='mb-4' style={{paddingLeft: '1rem', fontWeight: 600}}>You are about to Sell {nft?.name.split('#')[0]?.toUpperCase()} </div>
            <a href='#' onClick={handleClose}  className="close" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </a>
            <Modal.Body>
              <div className="mb-3">
                <Card body style={{background: '#F6E8FF', borderRadius: '10px', color: 'black'}}>
                <div className="row mb-4">
                  <div className="col-8">{ nft?.name.split('#')[0]?.toUpperCase() }</div>
                  <div className="col-4 text-center" >{ '#' + (nft?.name.split('#')[1] ? nft?.name.split('#')[1] : '') }</div>
                </div>
                <div className="row mb-4">
                  <div className="col-8" style={{marginTop: "6px"}}>Price</div>
                  <div className="col-4" >
                    <div className='row'>
                      <div className='col-8'>
                        <input
                          className='form-control'
                          style={{width: '100%', borderRadius: '15px', border: "1px solid white", textAlign: 'center'}}
                          placeholder="0"
                          min={0}
                          onChange={onChangeInput}
                          type="number"
                          value={formState.price === undefined ? '' : formState.price}
                        />
                      </div>
                      <div className='col-4' style={{fontWeight: 'bold', padding: 0, marginTop: "6px"}}>{candyShop?.currencySymbol}</div>
                    </div>
                  </div>
                </div>
                <div className="row mb-4">
                  <div className="col-8">Royalty fee{'(' + ROYALTY_FEE +'%)'}</div>
                  <div className="col-4 text-center" >{formState.price ? '-' + (formState.price * ROYALTY_FEE / 100) : ''}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-8">Platform fee{'(' + PLATFORM_FEE +'%)'}</div>
                  <div className="col-4 text-center" >{formState.price ? '-' + (formState.price * PLATFORM_FEE / 100) : ''}</div>
                </div>
                <div className="row mb-4">
                  <div className="col-8" style={{color: '#BD00FF'}}>Received to wallet</div>
                  <div className="col-4 text-center" style={{color: '#BD00FF'}} >{formState.price ? (formState.price - (formState.price * PLATFORM_FEE / 100) - (formState.price * ROYALTY_FEE / 100)) : 0}</div>
                </div>
              </Card>
              </div>
            </Modal.Body>
            <div className="row">
                <div className="col text-center">
                  <button style={{width: 'auto', padding: '0.75rem 100px', borderRadius: '15px'}} className={`btn fluid  ${!disableListedBtn ? 'btn-warning' : 'btn-disable'}`} onClick={sell} disabled={disableListedBtn}>
                    Sell
                  </button>
                </div>
              </div>
          </>
        )}

        {state === TransactionState.PROCESSING && <Processing text='Loading' />}
        
      </Modal>
      {isShowError && (
      <TransactionCancel 
        isShow={isShowError} 
        handCloseWarning={() => {
          setIsShowError(false)
        }} />)}
    {/* <Modal onCancel={onCloseModal} width={600}>
      <div className="candy-sell-modal">
        {state === TransactionState.DISPLAY && (
          <div>
            <h3 style={{ color: 'white' }}>Sell</h3>
            <p>You are about to SELL { nft?.metadata?.data?.name }</p>
            {/* <div className="candy-sell-modal-content">
              <div className="candy-sell-modal-img">
                <LiqImage src={nft?.nftImage} alt={nft?.metadata?.data?.name} fit="contain" />
              </div>
              <div>
                <div className="candy-sell-modal-nft-name">{nft?.metadata?.data?.name}</div>
                <div className="candy-sell-modal-symbol">{nft?.metadata?.data?.symbol}</div>
                <NftStat tokenMint={nft.tokenMintAddress} edition={nft.edition} />
              </div>
            </div> */}
{/* 
            <form>
              <Card body style={{background: '#fbf5fb', borderRadius: '10px'}}>
                <div className="row mb-4">
                  <div className="col-8">{ nft?.metadata?.data?.name.split('#')[0] }</div>
                  <div className="col-4 text-center" >{ '#' + (nft?.metadata?.data?.name.split('#')[1] ? nft?.metadata?.data?.name.split('#')[1] : '') }</div>
                </div>
                <div className="row mb-4">
                  <div className="col-8" style={{marginTop: "6px"}}>Price</div>
                  <div className="col-4" >
                    <div className='row'>
                      <div className='col-8'>
                        <input
                          className='form-control'
                          style={{width: '100%', borderRadius: '15px', border: "1px solid white", textAlign: 'center'}}
                          placeholder="0"
                          min={0}
                          onChange={onChangeInput}
                          type="number"
                          value={formState.price === undefined ? '' : formState.price}
                        />
                      </div>
                      <div className='col-4' style={{fontWeight: 'bold', padding: 0, marginTop: "6px"}}>{candyShop?.currencySymbol}</div>
                    </div>
                  </div>
                </div>
              </Card> */}
              {/* <div className="candy-sell-modal-fees">
                <div className="candy-sell-modal-fees-left">
                  Transaction Fees
                  <br />
                  Royalties
                </div>
                {loading ? (
                  <div className="candy-loading candy-sell-modal-loading" />
                ) : (
                  <div className="candy-sell-modal-fees-right">
                    <Tooltip inner="Payable to marketplace" className="candy-tooltip-right">
                      {transactionFee !== undefined && !isNaN(transactionFee) ? transactionFee.toFixed(1) + '%' : 'n/a'}
                    </Tooltip>
                    <Tooltip inner="Payable to NFT creators" className="candy-tooltip-right">
                      {royalties !== undefined && !isNaN(royalties) ? royalties.toFixed(1) + '%' : 'n/a'}
                    </Tooltip>
                  </div>
                )}
              </div> */}
              {/* <div className="row">
                <div className="col text-center">
                  <button style={{width: 'auto'}} className={`candy-sell-modal-button candy-button ${!disableListedBtn ? 'btn-warning' : ''}`} onClick={sell} disabled={disableListedBtn}>
                    Sell
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
        {state === TransactionState.PROCESSING && <Processing text="Loading" />} */}
        {/* {state === TransactionState.CONFIRMED && (
          <>
            <div className="candy-sell-modal-title">
              <IconTick />
            </div>
            <div className="candy-sell-modal-content">
              <div className="candy-sell-modal-img">
                <LiqImage src={nft?.nftImage} alt="NFT image" fit="contain" />
              </div>
              <div className="candy-sell-modal-listed">
                <span style={{ fontWeight: 'bold' }}>{nft?.metadata?.data?.name}</span> is now listed for sale
              </div>
            </div>
            <div className="candy-sell-modal-hr"></div>
            <button className="candy-sell-modal-button candy-button" onClick={onCancel}>
              Continue Browsing
            </button>
          </>
        )} */}
      {/* </div>
      </Modal>
      <NotificationModal isOpen={isShowError} message='test' handCloseWarning={() => setIsShowError(false)} /> */}
      </>
  );
};
