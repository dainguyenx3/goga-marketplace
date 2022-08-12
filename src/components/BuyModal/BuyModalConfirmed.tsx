import React, { MouseEvent } from 'react';

import { web3 } from '@project-serum/anchor';
import { formatDate } from '../../utils/format';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { ExplorerLink } from '../ExplorerLink';
import { LiqImage } from '../LiqImage';
import IconTick from '../../assets/IconTick';
import imageModalSuccess from '../../img/modal/successfully.png'
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo } from '../../model';

interface BuyModalConfirmedProps {
  order: OrderSchema;
  txHash: string;
  walletPublicKey: web3.PublicKey | undefined;
  onClose: () => void;
  exchangeInfo: ShopExchangeInfo;
}

const BuyModalConfirmed: React.FC<BuyModalConfirmedProps> = ({
  order,
  txHash,
  walletPublicKey,
  onClose,
  exchangeInfo
}) => {

  const handleClose = (e: MouseEvent) => {
    e.preventDefault();
    onClose();
  }

  return (
    <>
      <a href="#" onClick={handleClose} className="close" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </a>
      <div className="text-center mb-3">
        <div className="box-image" style={{ padding: '45px 0' }}>
          <img src={imageModalSuccess} width="180" alt="" />
          <div style={{color: 'white', fontSize: '40px', fontWeight: 600, marginTop: '40px'}}>Purchase Successfully</div>
        </div>
      </div>
    </>
  );
};

export default BuyModalConfirmed;
