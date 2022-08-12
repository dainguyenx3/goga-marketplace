import React, { useState } from 'react';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Modal } from 'react-bootstrap';
import { Processing } from '../Processing';

import { CandyShop } from '@liqnft/candy-shop-sdk';
import { ShopExchangeInfo, TransactionState } from '../../model';
import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { CancelModalConfirm } from './CancelModalConfirm';
import { CancelModalDetail } from './CancelModalDetail';

import './index.less';

export interface CancelModalProps {
  order: OrderSchema;
  onClose: () => void;
  wallet: AnchorWallet;
  candyShop: CandyShop;
  exchangeInfo: ShopExchangeInfo;
  isOpen: boolean;
}

export const CancelModal: React.FC<CancelModalProps> = ({
  order,
  onClose,
  wallet,
  candyShop,
  exchangeInfo,
  isOpen
}) => {
  const [state, setState] = useState<TransactionState>(TransactionState.DISPLAY);

  // Handle change step
  const onChangeStep = (state: TransactionState) => setState(state);

  return (
    <Modal show={isOpen} className="modal modal-alert" role="dialog" centered size='lg' >
      {state === TransactionState.DISPLAY && wallet && (
         <>
      <Modal.Title style={{ textAlign: 'center', fontSize: '40px' }}>
        <div className="candy-title text-center mb-2" style={{ color: 'white' }} >Cancel Selling</div>
      </Modal.Title>
      <div className='text-center'>You are about to cancel selling { order?.name }</div>
            <a onClick={onClose} className="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </a>
            <Modal.Body>
                <div className="mb-3">
                    <CancelModalDetail
                      onCancel={onClose}
                      order={order}
                      onChangeStep={onChangeStep}
                      wallet={wallet}
                      candyShop={candyShop}
                      exchangeInfo={exchangeInfo}
                    />
                </div>
          </Modal.Body>
          </>
      )}
      {state === TransactionState.PROCESSING && <Processing text="Loading" />}
      {state === TransactionState.CONFIRMED && <CancelModalConfirm order={order} onCancel={onClose} />}
    </Modal>
  );
};