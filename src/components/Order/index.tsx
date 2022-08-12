import { CandyShop } from '@liqnft/candy-shop-sdk';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { BuyModal } from '../BuyModal';
import { CancelModal } from '../CancelModal';
import { LiqImage } from '../LiqImage';
import React, { useEffect, useMemo, useState } from 'react';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { getExchangeInfo } from '../../utils/getExchangeInfo';
import { getPrice } from '../../utils/getPrice';
import './index.less';
import axios from 'axios';
import imageSolana from '../../img/price/solana.png'
import { useNavigate } from 'react-router-dom'
import { NftAttributesFormat, NftAttributesData } from './OrderDetail';
import { REGEX_IMAGE } from '../../constant'
export interface OrderProps {
  order: OrderSchema;
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  url?: string;
  candyShop: CandyShop;
}

export const Order: React.FC<OrderProps> = ({ order, wallet, walletConnectComponent, url, candyShop }) => {
  const [selection, setSelection] = useState<OrderSchema>();
  const [orderCandyShop, setOrderCandyShop] = useState<CandyShop>(candyShop);
  const [nftAttributes, setNftAttributes] = useState<NftAttributesFormat>();
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      if (order.nftUri) {
        const response = await axios.get(order.nftUri);
        if (response.data && response.data.attributes) {
          let mapAttributes: NftAttributesFormat = {};
            response.data.attributes.forEach((item: NftAttributesData) => {
              mapAttributes[item.trait_type.toLowerCase()] = item.value;
            })
            setNftAttributes(mapAttributes)
        }
      }
    })()
  }, [order.nftUri])
  const onClose = () => {
    setSelection(undefined);
  };

  const onClick = () => {
    navigate(`/marketplace/${order.tokenMint}/${order.candyShopCreatorAddress}`)
  };
  const exchangeInfo = getExchangeInfo(order, candyShop);
  const orderPrice = getPrice(candyShop.priceDecimalsMin, candyShop.priceDecimals, order, exchangeInfo);
  const isUserListing = wallet?.publicKey && order.walletAddress === wallet.publicKey.toString();
  return (
      <div className={`col-lg-3 character ${nftAttributes && nftAttributes['quality']?.toLowerCase()}`} onClick={onClick}>
        <div className="col-inner">
          <div className="code"><span>{ order?.name?.split('#')[1] && (`#${order?.name?.split('#')[1]}`) }</span></div>
          <div className="box-image">
            <img width='266px' height='186px' style={{ objectFit: 'contain', minHeight: '186px' }} src={order?.nftImageLink?.replace(REGEX_IMAGE, '.png')} alt="character" />
          </div>
        <div className="level">
          {nftAttributes && nftAttributes['quality'] ? (<span>{nftAttributes['quality']}</span>
          ) : (
              <span style={{ background: 'none' }}>{nftAttributes && nftAttributes['quality']}</span>
          )}
        </div>
          <div className="price"><img src={imageSolana} alt="solana" /> <span>{ orderPrice ? `${orderPrice}` : 'N/A' }</span></div>
        </div>
      </div>
  );
};
