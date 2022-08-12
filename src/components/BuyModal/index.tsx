import React, { useState, MouseEvent, useEffect } from 'react';
import { web3, BN } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'react-bootstrap'
import { Processing } from '../Processing';
import { getAccount } from '@solana/spl-token';
import BuyModalConfirmed from './BuyModalConfirmed';
import BuyModalDetail from './BuyModalDetail';
import { ShopExchangeInfo, TransactionState } from '../../model';
import { useUnmountTimeout } from '../../hooks/useUnmountTimeout';
import { CandyShop, getAtaForMint, WRAPPED_SOL_MINT, CandyShopTrade, CandyShopTradeBuyParams } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { handleError, ErrorType, ErrorMsgMap } from '../../utils/ErrorHandler';
import { notification, NotificationType } from '../../utils/rc-notification';
import { TIMEOUT_EXTRA_LOADING, TIME_HIDDEN_LOADING, MESSAGE_TRANSACTION_FAILD } from '../../constant';
import TransactionCancel from '../Transaction/TransactionCancel'
import './style.less';
import NotificationModal from '../Modal/NotificationModal';
import { useNavigate } from 'react-router-dom';
import { useAlter } from '../../hooks/useAlter'

export interface BuyModalProps {
  order: OrderSchema;
  onClose: () => void;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  shopAddress: web3.PublicKey;
  candyShopProgramId: web3.PublicKey;
  connection: web3.Connection;
  isEnterprise: boolean;
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
  isOpen: boolean
}

export const BuyModal: React.FC<BuyModalProps> = ({
  order,
  onClose,
  wallet,
  walletConnectComponent,
  exchangeInfo,
  isOpen,
  shopAddress,
  candyShopProgramId,
  connection,
  isEnterprise,
  shopPriceDecimalsMin,
  shopPriceDecimals,
  sellerUrl
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState(''); // txHash
  const [isError, setIsError] = useState<boolean>(false);
  const timeoutRef = useUnmountTimeout();
  const navigate = useNavigate()
  const setMessageAlter = useAlter()
  const buy = async () => {
    if (!wallet) {
      notification(ErrorMsgMap[ErrorType.InvalidWallet], NotificationType.Error);
      return;
    }
    setState(TransactionState.PROCESSING);

    const tradeBuyParams: CandyShopTradeBuyParams = {
      tokenAccount: new web3.PublicKey(order.tokenAccount),
      tokenMint: new web3.PublicKey(order.tokenMint),
      price: new BN(order.price),
      wallet: wallet,
      seller: new web3.PublicKey(order.walletAddress),
      connection: connection,
      shopAddress: shopAddress,
      candyShopProgramId: candyShopProgramId,
      isEnterprise: isEnterprise,
      // Replace with the order's
      shopCreatorAddress: new web3.PublicKey(order.candyShopCreatorAddress),
      shopTreasuryMint: new web3.PublicKey(order.treasuryMint)
    };

    return CandyShopTrade.buy(tradeBuyParams)
      .then((txHash) => {
        setHash(txHash);
        console.log('Buy order made with transaction hash', txHash);
        timeoutRef.current = setTimeout(() => {
          setState(TransactionState.CONFIRMED);
        }, TIMEOUT_EXTRA_LOADING);
      })
      .catch((err) => {
        setState(TransactionState.DISPLAY);
        setIsError(true)
      });
  };

  useEffect(() => {
    if(state === TransactionState.PROCESSING) {
      const timeId = setTimeout(() => {
        onClose();
        navigate('/')
        setMessageAlter(MESSAGE_TRANSACTION_FAILD);
      }, TIME_HIDDEN_LOADING)

      return () => {
          clearTimeout(timeId)
      }
    }
  }, [state])

  const handleClose = (e: MouseEvent) => {
    e.preventDefault();
    onClose()
  }

  return (
    <Modal show={isOpen} className="modal modal-alert" role="dialog" centered size='lg' >
      {state === TransactionState.DISPLAY && (
        <>
      <Modal.Title style={{ textAlign: 'center', fontSize: '40px' }}>
        <div className="candy-title text-center mb-2" style={{ color: 'white', fontWeight: 600 }} >Purchase</div>
      </Modal.Title>
      <div className='text-center'>You are about to purchase { order?.name }</div>
            <a href='#' onClick={handleClose} className="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </a>
            <Modal.Body>
                <div className="mb-3">
                    <BuyModalDetail
                      order={order}
                      buy={buy}
                      walletPublicKey={wallet?.publicKey}
                      walletConnectComponent={walletConnectComponent}
                      exchangeInfo={exchangeInfo}
                      shopPriceDecimalsMin={shopPriceDecimalsMin}
                      shopPriceDecimals={shopPriceDecimals}
                      sellerUrl={sellerUrl}
                    />
                </div>
          </Modal.Body>
          </>
      )}
      {state === TransactionState.PROCESSING && <Processing text="Loading" />}
      {state === TransactionState.CONFIRMED && wallet && (
          <BuyModalConfirmed
            walletPublicKey={wallet.publicKey}
            order={order}
            txHash={hash}
            onClose={() => {
              onClose();
              navigate('/');
            }}
            exchangeInfo={exchangeInfo}
          />
      )}
      {isError && <TransactionCancel isShow={isError} handCloseWarning={() => setIsError(false)} />}
      {/* <div className="candy-buy-modal">
        {state === TransactionState.DISPLAY && (
          <BuyModalDetail
            order={order}
            buy={buy}
            walletPublicKey={wallet?.publicKey}
            walletConnectComponent={walletConnectComponent}
            candyShop={candyShop}
            exchangeInfo={exchangeInfo}
          />
        )}
        {state === TransactionState.PROCESSING && <Processing text="Processing purchase" />}
        {state === TransactionState.CONFIRMED && wallet && (
          <BuyModalConfirmed
            walletPublicKey={wallet.publicKey}
            order={order}
            txHash={hash}
            onClose={onClose}
            candyShop={candyShop}
            exchangeInfo={exchangeInfo}
          />
        )}
      </div> */}
      </Modal>
  );
};
