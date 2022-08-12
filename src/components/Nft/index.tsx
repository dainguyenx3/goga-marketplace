import { useEffect, useState, MouseEvent, useContext } from 'react';
import { web3, BN } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { NftAttributesData, NftAttributesFormat } from '../Order/OrderDetail'

import { SingleTokenInfo, CandyShop } from '@liqnft/candy-shop-sdk';
import { Order as OrderSchema, CandyShop as CandyShopResponse } from '@liqnft/candy-shop-types';
import './index.less';
import { getExchangeInfo } from '../../utils/getExchangeInfo';
import axios from 'axios';
import { Processing } from '../Processing';
import { Modal } from 'react-bootstrap';
import { TIMEOUT_EXTRA_LOADING } from '../../constant';
import { useUnmountTimeout } from '../../hooks/useUnmountTimeout';
import TransferModal from '../Transfer/TransferModal';
import {useWallet, useConnection, useAnchorWallet} from "@solana/wallet-adapter-react";
import * as gogaTransfer from '../../utils/goga/transfer-spl';
import { ConfigContext } from '../../App';
import TransactionCancel from '../Transaction/TransactionCancel';
import { useNavigate } from 'react-router-dom';
import {useProfile} from '../../hooks/useProfile'
import { useAlter } from '../../hooks/useAlter';
import { REGEX_IMAGE, MESSAGE_SUCCESS } from '../../constant';

export interface NftProps {
  nft: SingleTokenInfo;
  wallet: AnchorWallet;
  sellDetail?: OrderSchema;
  shop: CandyShopResponse;
  candyShop: CandyShop;
  handleSelection: any;
  reloadData: any;
}

export const Nft = ({ nft, wallet, sellDetail, shop, candyShop, handleSelection, reloadData }: NftProps): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);
  const [attributes, setAttributes] = useState<NftAttributesFormat>()
  const [isCancelSelling, setIsCancelSelling] = useState<boolean>(false);
  const timeoutRef = useUnmountTimeout();
  const [isOpenTransfer, setIsOpenTransfer] = useState<boolean>(false);
  const navigate  = useNavigate();
  const walletAnchor = useAnchorWallet();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const config = useContext(ConfigContext);
  const [isShowErr, setIsShowErr] = useState<boolean>(false);
  const { profile } = useProfile();
  const setMessageAlter = useAlter();

  useEffect(() => {
    (async () => {
      if (nft.metadata?.data.uri) {
        const response = await axios.get(nft.metadata?.data.uri);
        if (response.data?.attributes) {
          let mapAttributes: NftAttributesFormat = {};
          response.data.attributes.forEach((item: NftAttributesData) => {
            mapAttributes[item.trait_type.toLowerCase()] = item.value;
          })
          setAttributes(mapAttributes)
        }
      }
    })()
  }, [nft.metadata?.data.uri])

  const isSellItem = Boolean(sellDetail);

  const exchangeInfo = sellDetail
    ? getExchangeInfo(sellDetail, candyShop)
    : {
        symbol: candyShop.currencySymbol,
        decimals: candyShop.currencyDecimals
      };

  const handleClick = async (e: MouseEvent) => {
    e.stopPropagation();
    if(isSellItem && nft) {
      setIsCancelSelling(true)
      const { result } = await candyShop.activeOrderByMintAddress(nft.tokenMintAddress)
      if(result) {
        candyShop.cancel({
          tokenAccount: new web3.PublicKey(result.tokenAccount),
          tokenMint: new web3.PublicKey(result.tokenMint),
          price: new BN(result.price),
          wallet
        }).then(() => {
          timeoutRef.current = setTimeout(() => {
            setIsCancelSelling(false);
            setMessageAlter(MESSAGE_SUCCESS)
            if(reloadData) {
              reloadData()
            }
          }, TIMEOUT_EXTRA_LOADING);
        }).catch((err) => {
          // handleError({ error: err });
          setIsShowErr(true)
          setIsCancelSelling(false);
        });
      }
    } else {
      setIsOpenTransfer(true)
    }
  }

  const handleTransfer = async () => {
    setLoading(true);
    const mintPublicKey = new web3.PublicKey(nft.tokenMintAddress);
    const user = gogaTransfer.Wallet.fromWallet(connection, walletAnchor!)
    const destPublicKey = new web3.PublicKey(config.treasuryAccount);
    const response = await user.transferToken(mintPublicKey, destPublicKey, 1).catch(e => {
      setIsShowErr(true)
      setLoading(false)
    });
    if(response) {
      setIsOpenTransfer(false);
      setLoading(false)
      setMessageAlter(MESSAGE_SUCCESS)
      if(reloadData) {
        reloadData()
      }
    }
  }

  return (
    <>
      <div
        onClick={() => navigate(`/inventory/wallet/${nft.tokenMintAddress}/${nft.tokenAccountAddress}`)}
        className={`col-lg-3 character ${attributes && attributes['quality']?.toLowerCase()}`}>
        <div className="col-inner">
          {isSellItem && <span className="badge badge-sell"></span>}
          <div className="code"><span>{ nft.metadata?.data.name.split('#')[1] && ('#' + nft.metadata?.data.name.split('#')[1]) }</span></div>
          <div className="box-image">
            {nft?.nftImage ? (
              <img width='266px' height='186px' style={{ objectFit: 'contain' }} src={nft?.nftImage?.replace(REGEX_IMAGE, ".png")} alt={nft?.metadata?.data?.name} />
            ) : (
              <div style={{width:'266px', height:'143px'}}></div>
            )}
          </div>
          {attributes && attributes['quality'] ? (<div className="level"><span>{attributes['quality']}</span></div>) : (<div className="level"><span style={{ background: 'none' }}></span></div>)}
          <div className="py-3 px-3"><button disabled={!profile?.linked && !isSellItem} onClick={handleClick} style={{borderRadius: '10px'}} className={`btn ${(isSellItem ? 'btn-warning' : (!profile?.linked ? ('btn-disable') : 'btn-success'))} fluid`}>{isSellItem ? 'Cancel Selling' :'Transfer'}</button></div>
          </div>
      </div>
      {isCancelSelling && (
        <Modal show={isCancelSelling} className="modal modal-alert" role="dialog" centered size='lg' >
          <Processing text='Loading' />
        </Modal>
      )}
      {
        isOpenTransfer && (<TransferModal isOpen={isOpenTransfer} handleClose={() => setIsOpenTransfer(false)} handleTransfer={handleTransfer} loading={loading} />)
      }

      {(isShowErr) && 
      (<TransactionCancel isShow={isShowErr} handCloseWarning={() => {setIsShowErr(false)
      }} />)}
      {/* <div className="candy-card-border candy-nft-card" onClick={onClick}>
        {isSellItem && <div className="candy-status-tag">Listed for Sale</div>}

        <LiqImage
          src={nft?.nftImage}
          alt={nft?.metadata?.data?.name}
          fit="cover"
          style={{ borderTopRightRadius: 14, borderTopLeftRadius: 14 }}
        />

        <div className="candy-nft-info">
          <div className="name">{nft?.metadata?.data?.name}</div>
          <div className="ticker">{nft?.metadata?.data?.symbol}</div>
        </div>
      </div>

      {selection && !isSellItem && (
        <SellModal onCancel={onClose} nft={selection} wallet={wallet} shop={shop} candyShop={candyShop} />
      )}

      {selection && sellDetail ? (
        <CancelModal
          onClose={onClose}
          order={sellDetail}
          wallet={wallet}
          candyShop={candyShop}
          exchangeInfo={exchangeInfo}
          isOpen={selection ? true: false}
        />
      ) : null} */}
    </>
  );
};
