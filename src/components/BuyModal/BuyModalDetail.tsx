import React, { useEffect, useMemo, useState, useContext } from 'react';
import { web3 } from '@project-serum/anchor';

import { LiqImage } from '../LiqImage';
import { NftStat } from '../NftStat';
import { NftAttributes } from '../NftAttributes';

import { Nft, Order as OrderSchema } from '@liqnft/candy-shop-types';
import { CandyShop, fetchNFTByMintAddress } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from '../../model';
import { getPrice } from '../../utils/getPrice';
import { Card } from 'react-bootstrap';
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { ConnectionContext } from '../../App';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { REGEX_NUMBER } from '../../constant'
export interface BuyModalDetailProps {
  order: OrderSchema;
  buy: () => void;
  walletPublicKey: web3.PublicKey | undefined;
  walletConnectComponent: React.ReactElement;
  exchangeInfo: ShopExchangeInfo;
  typeNft?: string,
  shopPriceDecimalsMin: number;
  shopPriceDecimals: number;
  sellerUrl?: string;
}

const BuyModalDetail: React.FC<BuyModalDetailProps> = ({
  order,
  buy,
  walletPublicKey,
  walletConnectComponent,
  exchangeInfo,
  typeNft,
  shopPriceDecimalsMin,
  shopPriceDecimals
}) => {
  const [loadingNftInfo, setLoadingNftInfo] = useState(false);
  const [nftInfo, setNftInfo] = useState<Nft | null>(null);
  const [balance, setBalance] = useState<number>(0)
  const connection = useContext(ConnectionContext);
  useEffect(() => {
    setLoadingNftInfo(true);
    fetchNFTByMintAddress(order.tokenMint)
      .then((nft: Nft) => setNftInfo(nft))
      .catch((error: Error) => {
        console.info('fetchNftByMint failed:', error);
      })
      .finally(() => {
        setLoadingNftInfo(false);
      });
  }, [order.tokenMint]);

  useEffect(() => {
    (async () => {
      if (walletPublicKey) {
        const balance = await connection.getBalance(walletPublicKey)
        setBalance(balance / LAMPORTS_PER_SOL)
      }
    })()
  }, [walletPublicKey, connection])

  const orderPrice =  getPrice(shopPriceDecimalsMin, shopPriceDecimals, order, exchangeInfo);

  return (
    <>
      {/* <div className="candy-buy-modal-thumbnail">
        <LiqImage src={order?.nftImageLink || ''} alt={order?.name} fit="contain" />
      </div> */}
        <Card body style={{borderRadius: '13px', color: 'black'}}>
          <div className="row mb-2">
          <div className="col-8">{ order?.name?.split('#')[0]?.toUpperCase() }</div>
            <div className="col-4" >{ order?.name?.split('#')[1] &&('#' + order?.name?.split('#')[1]) }</div>
          </div>
          <div className="row mb-4">
            <div className="col-8">Price</div>
            <div className="col-4" >{orderPrice ? `${orderPrice} ${exchangeInfo.symbol}` : 'N/A'}</div>
          </div>
          <div className="row">
            <div className="col-8" style={{fontWeight: 'bold'}}>Your balance</div>
            <div className="col-4" style={{fontWeight: 'bold'}}>{balance + ' SOL'}</div>
          </div>
          {Number(balance) <= Number(orderPrice.replace(REGEX_NUMBER, '')) && <div className="row text-center text-danger">
            <div className="col-12" style={{fontSize: '16px', fontWeight: 600}}><AiOutlineExclamationCircle /> Your balance is not enough funds. Please depoit more and submit again</div>
          </div>}
          
        </Card>
        <div className="candy-buy-modal-control text-center" style={{marginTop: '35px', marginBottom: 0}}>
          {!walletPublicKey ? (
            <div className='col'>
              {walletConnectComponent}
            </div>
          ) : (
              <div className='col'>
                <button disabled={Number(balance) <= Number(orderPrice.replace(REGEX_NUMBER, ''))} style={{ padding: '5px 50px', borderRadius: '13px' }} className={`btn btn-${balance <= orderPrice ? 'light' : 'warning'} text-primary btn-big`} onClick={buy}>
                  Purchase
                </button>
              </div>
          )}
        </div>
        {/* {order.nftDescription && (
          <div className="candy-stat">
            <div className="candy-label">DESCRIPTION</div>
            <div className="candy-value">{order?.nftDescription}</div>
          </div>
        )}
        <NftStat owner={order.walletAddress} tokenMint={order.tokenMint} edition={order.edition} />
        <NftAttributes loading={loadingNftInfo} attributes={nftInfo?.attributes} /> */}
    </>
  );
};

export default BuyModalDetail;
