import { useState, MouseEvent } from 'react';
import './index.less';
import TransferModal from '../Transfer/TransferModal';
import { transferNft } from '../../api';
import { useProfile } from '../../hooks/useProfile';
import { useCurrencyBalance } from '../../hooks/useCurrencyBalance';
import { useConfig } from '../../hooks/useConfig'
import { useNavigate } from 'react-router-dom'
import { useAlter } from '../../hooks/useAlter';
import { MESSAGE_SUCCESS } from '../../constant';

export interface NftIngameProps {
  nft: NftIngameInfo;
  balance: number;
  reloadData: any;
}

export interface NftIngameInfo {
    agi: number;
    luck: number;
    level: number;
    intel: number;
    power: number;
    type: string;
    name: string;
    tokenId: string;
    agiBase: number;
    quality: string;
    luckBase: number;
    attrPoint: number;
    intelBase: number;
    powerBase: number;
    imageUrl: string;
    royaltyFee: number;
    mintAddress: string;
    battery: string;
    cycleCountTotal: number;
    lockReleaseTime: string;
    cycleCountRemain: number;
    cycleCountUnlimited: number;
    cycleCount: number;
    status: number;
    equipped: boolean;
}

export const STATUS_NFT = {
  ACTIVE: 1,
  LOCK_LEVELUP: 2,
  LOCK_TRANSFER: 3,
  TRANSFER_RESERVE: 4,
}

export const NftIngame = ({ nft, balance, reloadData }: NftIngameProps): JSX.Element => {
  const [isOpenTransfer, setIsOpenTransfer] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const { profile } = useProfile()
  const [loading, setLoading] = useState<boolean>(false);
  const currencyBalance = useCurrencyBalance();
  const config = useConfig();
  const navigate = useNavigate()
  const handleClick = async (e: MouseEvent) => {
    e.stopPropagation();
    setIsOpenTransfer(true)
  }

  const setMessageAlter = useAlter();

  const handleTransfer = async () => {
    setLoading(true);
    if(balance < parseFloat(config.nftWithdrawFee)) {
      setErrorMessage(`Not enough ${currencyBalance.name}`)
    } else {
      const response = await transferNft({
        mintAddress: nft.mintAddress,
        customerId: profile.id
      })
      if(response.result === 'SUCCESS') {
        setIsOpenTransfer(false)
        setMessageAlter(MESSAGE_SUCCESS)
        if(reloadData) {
          reloadData()
        }
      } else {
        setErrorMessage(response.result)
      }
    }
    setLoading(false);
  }
  return (
    <>
      <div
        onClick={() => navigate(`/inventory/ingame/${nft.mintAddress}`)}
        className={`col-lg-3 character ${nft.quality.toLowerCase()}`}>
        <div className="col-inner">
          <div className="code"><span>{ "#" + nft?.tokenId }</span></div>
          <div className="box-image">
            {nft?.imageUrl ? (
              <img width='266px' height='186px' style={{ objectFit: 'contain', minHeight: '186px' }} src={nft?.imageUrl} alt={nft?.name} />
            ) : (
              <div style={{width:'266px', height:'143px'}}></div>
            )}
          </div>
          {nft.quality ? (<div className="level"><span>{nft.quality}</span></div>) : (<div className="level"><span style={{ background: 'none' }}></span></div>)}
          <div className="py-3 px-3">
            <button disabled={ nft.status !== STATUS_NFT['ACTIVE'] || Number(nft.battery) < 100 || nft.equipped} onClick={handleClick} style={{borderRadius: '10px'}} className={`btn ${(nft.status !== STATUS_NFT['ACTIVE'] || Number(nft.battery) < 100 || nft.equipped) ? 'btn-disable': 'btn-success'} fluid`}>{'Transfer'}</button></div>
          </div>
      </div>
      {
        isOpenTransfer && (
        <TransferModal 
          type='to_wallet'
          isOpen={isOpenTransfer} 
          handleClose={() => setIsOpenTransfer(false)} 
          handleTransfer={handleTransfer} 
          balance={balance} 
          loading={loading}
          message={errorMessage}
        />)
      }
    </>
  );
};