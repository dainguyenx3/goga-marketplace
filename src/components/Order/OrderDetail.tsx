import React, { useEffect, useState, useMemo, MouseEvent } from 'react';
import { web3, BN } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Skeleton } from '../Skeleton';
import { ExplorerLink } from '../ExplorerLink';
import { NftAttributes } from '../NftAttributes';
import { LiqImage } from '../LiqImage';
import { Processing } from '../Processing';
import { Nft, Order as OrderSchema } from '@liqnft/candy-shop-types';
import { TransactionState } from '../../model';
import { BuyModal } from '../BuyModal'
import { CandyShop, CandyShopTrade } from '@liqnft/candy-shop-sdk';
import './style.less';
import { getExchangeInfo } from '../../utils/getExchangeInfo';
import { getPrice } from '../../utils/getPrice';
import imageBack from "../../img/back.png";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TutorBox from './TutorBox'
import Box from './Box'
import { TYPE_NFT_TUTOR_BOX } from '../../constant'
import { Placeholder, Card, Modal } from 'react-bootstrap'
import { TIMEOUT_EXTRA_LOADING } from '../../constant';
import { useUnmountTimeout } from '../../hooks/useUnmountTimeout';
import TransactionCancel from '../Transaction/TransactionCancel';
import { useAlter } from '../../hooks/useAlter';
import { MESSAGE_SUCCESS, TIME_HIDDEN_LOADING, MESSAGE_TRANSACTION_FAILD } from '../../constant';

interface OrderDetailProps {
  tokenMint: string;
  backUrl?: string;
  walletConnectComponent: React.ReactElement;
  wallet: AnchorWallet | undefined;
  candyShop: CandyShop;
  candyShopCreatorAddress: string;
  
}

export interface NftAttributesData {
  trait_type: string;
  value: string
}

export interface NftAttributesFormat {
   [key: string]: string
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  tokenMint,
  backUrl = '/',
  walletConnectComponent,
  wallet,
  candyShop,
  candyShopCreatorAddress
}) => {

  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [order, setOrder] = useState<OrderSchema>();
  const [nftInfo, setNftInfo] = useState<Nft>();
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);
  const [hash, setHash] = useState('');
  const [orderCandyShop, setOrderCandyShop] = useState<CandyShop>(candyShop);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false)
  const [nftAttributes, setNftAttributes] = useState<NftAttributesFormat>();
  const [isShowErr, setIsShowErr] = useState<boolean>(false);
  const setMessageAlter = useAlter();

  const exchangeInfo = order
    ? getExchangeInfo(order, candyShop)
    : {
        symbol: candyShop.currencySymbol,
        decimals: candyShop.currencyDecimals
      };
  const orderPrice = getPrice(candyShop.priceDecimalsMin, candyShop.priceDecimals, order, exchangeInfo);

  const isUserListing = wallet?.publicKey && order && order.walletAddress === wallet.publicKey.toString();
  const navigate = useNavigate();
  const timeoutRef = useUnmountTimeout();

  useEffect(() => {
    if (!order) {
      setLoadingOrder(true);
      candyShop
        .activeOrderByMintAddress(tokenMint)
        .then((res) => {
          if (!res.success) throw new Error('Order not found');
          setOrder(res.result);
        })
        .catch((err) => {
          console.log('OrderDetail: activeOrderByMintAddress failed=', err);
        })
        .finally(() => {
          setLoadingOrder(false);
        });
      return;
    }
  }, [candyShop, tokenMint]);

  useEffect(() => {
    (async () => {
      if (order?.nftUri) {
        const response = await axios.get(order?.nftUri);
        if (response?.data?.attributes) {
          let mapAttributes: NftAttributesFormat = {};
          response.data.attributes.forEach((item: NftAttributesData) => {
            mapAttributes[item.trait_type.toLowerCase()] = item.value;
          })
          setNftAttributes(mapAttributes)
        }
      }
    })()
  }, [order?.nftUri]);

  useEffect(() => {
    if(state === TransactionState.PROCESSING) {
      const timeId = setTimeout(() => {
        setIsOpenModal(false);
        navigate('/')
        setMessageAlter(MESSAGE_TRANSACTION_FAILD);
      }, TIME_HIDDEN_LOADING)

      return () => {
          clearTimeout(timeId)
      }
    }
  }, [state])

  const handleOpenModal = () => {
    setIsOpenModal(true)
    if (order && isUserListing) {
      setState(TransactionState.PROCESSING)
      candyShop.cancel({
        tokenAccount: new web3.PublicKey(order.tokenAccount),
        tokenMint: new web3.PublicKey(order.tokenMint),
        price: new BN(order.price),
        wallet
      }).then(() => {
        timeoutRef.current = setTimeout(() => {
          setMessageAlter(MESSAGE_SUCCESS)
          navigate('/')
        }, TIMEOUT_EXTRA_LOADING);
      }).catch((err) => {
        // handleError({ error: err });
        setIsShowErr(true)
        setIsOpenModal(false);
      });
    }
  }

  if (loadingOrder) {
    return (
      <div className="row justify-content-center mb-3" style={{ minHeight: '445px' }}>
        <div className="col-lg-6 mb-5">
          <div className="box-image" style={{ marginTop: '25%' }}>
            {/* <Placeholder as={Card.Text} animation="glow">
              <Placeholder xs={6} />
              <Placeholder xs={8} />
              <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
              <Placeholder xs={6} /> <Placeholder xs={8} />
            </Placeholder> */}
          </div>
        </div>
      </div>
    );
  }

  const handleBack = (e: MouseEvent) => {
    e.preventDefault();
    navigate(-1);
  }

return (
    <>
      <section className={`container ${ nftAttributes && ('level' in nftAttributes) ? '' : 'tutor-box'} pb-5`}>
        <div className="py-3">
          <a href='#' onClick={handleBack} className="back-link"><img src={imageBack} alt="back" /> Back</a>
        </div>
        {nftAttributes && ('level' in nftAttributes) ? (
          <TutorBox  isUserListing={isUserListing} handleOpenModal={handleOpenModal} order={order!} orderPrice={orderPrice} nftAttributes={nftAttributes!} />
        ) : (
            <Box isUserListing={isUserListing} handleOpenModal={handleOpenModal} order={order!} nftAttributes={nftAttributes!} orderPrice={orderPrice} />
        )}
      </section>

      {isOpenModal && order && !isUserListing ? (
        <BuyModal
          order={order}
          onClose={() => setIsOpenModal(false)}
          wallet={wallet}
          walletConnectComponent={walletConnectComponent}
          exchangeInfo={exchangeInfo}
          isOpen={isOpenModal}
          shopAddress={candyShop.candyShopAddress}
          candyShopProgramId={candyShop.programId}
          connection={candyShop.connection()}
          isEnterprise={candyShop.isEnterprise}
          shopPriceDecimalsMin={candyShop.priceDecimalsMin}
          shopPriceDecimals={candyShop.priceDecimals}
        />
    ) : null}
    {
      order && isUserListing && wallet ? (
        <Modal show={isOpenModal} className="modal modal-alert" role="dialog" centered size='lg' >
          <Modal.Body>
            <Processing text='Loading' />
          </Modal.Body>
        </Modal>
      ) : null
    }
    {
      isShowErr && (<TransactionCancel isShow={isShowErr} handCloseWarning={() => setIsShowErr(false)} />)
    }
      {/* {order && isUserListing && wallet ? (
        <CancelModal
          onClose={() => setIsOpenModal(false)}
          candyShop={orderCandyShop}
          order={order}
          wallet={wallet}
          exchangeInfo={exchangeInfo}
          isOpen={isOpenModal}
        />
      ) : null} */}
    </>
    // <div className="candy-order-detail">
    //   <div className="candy-container">
    //     <div className="candy-order-detail-left">
    //       <LiqImage src={order?.nftImageLink || ''} alt={order?.name} fit="contain" />
    //     </div>
    //     <div className="candy-order-detail-right">
    //       {isUserListing && <div className="candy-status-tag-inline">Your Listing</div>}
    //       <div className="candy-order-detail-title">{order?.name}</div>
    //       <div className="candy-stat">
    //         <div className="candy-label">PRICE</div>
    //         <div className="candy-price">{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
    //       </div>
    //       <div className="candy-stat">
    //         <div className="candy-label">DESCRIPTION</div>
    //         <div className="candy-value">{order?.nftDescription}</div>
    //       </div>
    //       <div className="candy-stat-horizontal">
    //         <div>
    //           <div className="candy-label">MINT ADDRESS</div>
    //           <div className="candy-value">
    //             <ExplorerLink type="address" address={order?.tokenMint || ''} />
    //           </div>
    //         </div>
    //         <div className="candy-stat-horizontal-line" />
    //         {order?.edition ? (
    //           <>
    //             <div>
    //               <div className="candy-label">EDITION</div>
    //               <div className="candy-value">{order?.edition}</div>
    //             </div>
    //             <div className="candy-stat-horizontal-line" />
    //           </>
    //         ) : null}
    //         <div>
    //           <div className="candy-label">OWNER</div>
    //           <div className="candy-value">
    //             <ExplorerLink type="address" address={order?.walletAddress || ''} />
    //           </div>
    //         </div>
    //       </div>
    //       <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} />

    //       {!wallet ? (
    //         walletConnectComponent
    //       ) : (
    //         <button
    //           className="candy-button"
    //           onClick={handleOpenModal}
    //           disabled={state === TransactionState.PROCESSING || state === TransactionState.CONFIRMED}
    //         >
    //           Purchase
    //         </button>
    //       )}
    //     </div>
    //     {isOpenModal && order && !isUserListing ? (
    //     <BuyModal
    //       order={order}
    //       onClose={() => setIsOpenModal(false)}
    //       wallet={wallet}
    //       candyShop={orderCandyShop}
    //       walletConnectComponent={walletConnectComponent}
    //       exchangeInfo={exchangeInfo}
    //     />
    //   ) : null}

    //   {order && isUserListing && wallet ? (
    //     <CancelModal
    //       onClose={onClose}
    //       candyShop={orderCandyShop}
    //       order={selection}
    //       wallet={wallet}
    //       exchangeInfo={exchangeInfo}
    //     />
    //   ) : null}
    //     {state === TransactionState.PROCESSING && (
    //       <Modal onCancel={() => setState(TransactionState.DISPLAY)} width={600}>
    //         <div className="buy-modal">
    //           <Processing text="Processing purchase" />
    //         </div>
    //       </Modal>
    //     )}
    //     {state === TransactionState.CONFIRMED && wallet && order && (
    //       <Modal onCancel={goToMarketplace} width={600}>
    //         <div className="buy-modal">
    //           <BuyModalConfirmed
    //             walletPublicKey={wallet.publicKey}
    //             order={order}
    //             txHash={hash}
    //             onClose={goToMarketplace}
    //             candyShop={candyShop}
    //             exchangeInfo={exchangeInfo}
    //           />
    //         </div>
    //       </Modal>
    //     )}
    //   </div>
    // </div>
  );
};

export default OrderDetail