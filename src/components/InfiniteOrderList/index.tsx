import React from 'react';
import { Order as OrderComponent } from '../Order';
import { Order } from '@liqnft/candy-shop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Skeleton } from '../Skeleton';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { CandyShop } from '@liqnft/candy-shop-sdk';

interface InfiniteOrderListProps {
  orders: Order[];
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
  url?: string;
  candyShop: CandyShop;
}

export const InfiniteOrderList: React.FC<InfiniteOrderListProps> = ({
  orders,
  wallet,
  walletConnectComponent,
  url,
  candyShop
}) => {
  return (
      <div className="row list-character">
        {orders.map((order) => (
          <OrderComponent
            order={order}
            walletConnectComponent={walletConnectComponent}
            wallet={wallet}
            url={url}
            candyShop={candyShop}
            key={order.tokenMint}
            />
        ))}
      </div>
  );
};
