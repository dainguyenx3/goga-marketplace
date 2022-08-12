import { useEffect, useState, MouseEvent, useContext } from 'react';
import { Order as OrderSchema, CandyShop as CandyShopResponse, Nft } from '@liqnft/candy-shop-types';
import { SingleTokenInfo, CandyShop } from '@liqnft/candy-shop-sdk';
import imageBack from "../../img/back.png";
import { NftAttributesFormat } from '../Order/OrderDetail'
import { AnchorWallet } from '@solana/wallet-adapter-react';
import NftBox from './NftBox';
import NftTutorBox from './NftTutorBox';
import { TYPE_NFT_TUTOR_BOX } from '../../constant'
import { SellModal } from '../SellModal';
import { getExchangeInfo } from '../../utils/getExchangeInfo';
import { getPrice } from '../../utils/getPrice';
import { web3, BN } from '@project-serum/anchor';
import { TIMEOUT_EXTRA_LOADING } from '../../constant';
import { useUnmountTimeout } from '../../hooks/useUnmountTimeout';
import { Modal } from 'react-bootstrap';
import { Processing } from '../Processing';
import TransferModal from '../Transfer/TransferModal';
import * as gogaTransfer from '../../utils/goga/transfer-spl';
import { ConfigContext } from '../../App';
import { useConnection, useAnchorWallet} from "@solana/wallet-adapter-react";
import TransactionCancel from '../Transaction/TransactionCancel'
import { CurrencyBalance } from '../../api';
import { useAlter } from '../../hooks/useAlter'
import { MESSAGE_SUCCESS, TIME_HIDDEN_LOADING, MESSAGE_TRANSACTION_FAILD } from '../../constant'
import { useNavigate } from 'react-router-dom'

interface NftDetailProps {
  nft: Nft;
  onBack: () => void;
  attributes: NftAttributesFormat;
  candyShop: CandyShop;
  shop: CandyShopResponse;
  wallet: AnchorWallet | undefined;
  currency_info?: CurrencyBalance;
  tokenAddress: string
}


const NftDetail = ({ nft, onBack, attributes, candyShop, shop, wallet, currency_info, tokenAddress }: NftDetailProps) => {
  const [isSell, setIsSell] = useState<boolean>(false);
  const [order, setOrder] = useState<OrderSchema>()
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isOpenTransfer, setIsOpenTransfer] = useState<boolean>(false);
  const config = useContext(ConfigContext);
  const walletAnchor = useAnchorWallet();
  const { connection } = useConnection();
  const [isShowErr, setIsShowErr] = useState<boolean>(false);
  const exchangeInfo = order
    ? getExchangeInfo(order, candyShop)
    : {
      symbol: candyShop.currencySymbol,
      decimals: candyShop.currencyDecimals
    };
  const navigate = useNavigate()
  const orderPrice = getPrice(candyShop.priceDecimalsMin, candyShop.priceDecimals, order, exchangeInfo);
  const timeoutRef = useUnmountTimeout();
  const [loading, setLoading] = useState<boolean>(false);
  const setMessageAlter = useAlter();
  useEffect(() => {
    if(nft?.mint) {
      candyShop.activeOrderByMintAddress(nft.mint).then(res=> {
        if(res.success) {
          setOrder(res.result)
        }
      })
    }
  }, [nft?.mint])

  useEffect(() => {
    if(isProcessing) {
      const timeId = setTimeout(() => {
        setIsSell(false);
        navigate('/inventory')
        setMessageAlter(MESSAGE_TRANSACTION_FAILD);
      }, TIME_HIDDEN_LOADING)

      return () => {
          clearTimeout(timeId)
      }
    }
  }, [isProcessing])

  const handleOpenModal = () => {
    if(order && wallet) {
      setIsProcessing(true);
      candyShop.cancel({
        tokenAccount: new web3.PublicKey(order.tokenAccount),
        tokenMint: new web3.PublicKey(order.tokenMint),
        price: new BN(order.price),
        wallet
      }).then(() => {
        timeoutRef.current = setTimeout(() => {
          setIsProcessing(false);
          setMessageAlter(MESSAGE_SUCCESS)
          onBack()
        }, TIMEOUT_EXTRA_LOADING);
      }).catch((err) => {
        // handleError({ error: err });
        setIsShowErr(true)
        setIsProcessing(false);
      });
    }else {
      setIsSell(true);
    }
  }

  const handleBack = (e: MouseEvent) => {
    e.preventDefault();
    onBack()
  }

  const handleTransfer = async () => {
    setLoading(true)
    const mintPublicKey = new web3.PublicKey(nft.mint);
    const user = gogaTransfer.Wallet.fromWallet(connection, walletAnchor!)
    const destPublicKey = new web3.PublicKey(config.treasuryAccount);
    const response = await user.transferToken(mintPublicKey, destPublicKey, 1).catch(e => {
      setIsShowErr(true)
    });
    setLoading(false)
    if(response) {
      setMessageAlter(MESSAGE_SUCCESS)
      onBack()
    }
  }

  if (!nft) {
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

return (
    <>
      <section className={`container ${attributes && !('level' in attributes) ? '' : 'tutor-box'} pb-5`}>
        <div className="py-3">
          <a href='#' onClick={handleBack} className="back-link"><img src={imageBack} alt="back" /> Back</a>
        </div>
        {attributes && ('level' in attributes) ? (
          <NftTutorBox nft={nft!} nftAttributes={attributes!} handleOpenModal={handleOpenModal} handleOpenModalTransfer={() => setIsOpenTransfer(true)} price={orderPrice}  />
        ) : (
            <NftBox nft={nft!} nftAttributes={attributes!} handleOpenModal={handleOpenModal} handleOpenModalTransfer={() => setIsOpenTransfer(true)} price={orderPrice} />
        )}
      </section>
      <SellModal tokenAddress={tokenAddress} candyShop={candyShop} isOpen={isSell} nft={nft} wallet={wallet!} shop={shop!} onClose={() => setIsSell(false)} />
      {isProcessing && (
        <Modal show={isProcessing} className="modal modal-alert" role="dialog" centered size='lg' >
          <Processing text='Loading' />
        </Modal>
      )}
      {
        isOpenTransfer && (<TransferModal isOpen={isOpenTransfer} handleClose={() => setIsOpenTransfer(false)} handleTransfer={handleTransfer} loading={loading}  />)
      }
      {isShowErr && (<TransactionCancel isShow={isShowErr} handCloseWarning={() => setIsShowErr(false)} />)}
    </> 
  );
};

export default NftDetail