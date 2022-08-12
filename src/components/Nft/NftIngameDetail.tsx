import { useState, MouseEvent, useContext } from 'react';
import imageBack from "../../img/back.png";
import NftIngameBox from './NftIngameBox';
import NftIngameTutorBox from './NftIngameTutorBox';
import { TYPE_NFT_TUTOR_BOX } from '../../constant'
import TransferModal from '../Transfer/TransferModal';
import { ConfigContext } from '../../App';
import { NftIngameInfo } from './NftIngame'
import { transferNft } from '../../api';
import { useProfile } from '../../hooks/useProfile';
import { useCurrencyBalance } from '../../hooks/useCurrencyBalance';
import { useAlter } from '../../hooks/useAlter';
import { MESSAGE_SUCCESS } from '../../constant';

interface NftIngameDetailProps {
  nft: NftIngameInfo;
  onBack: () => void;
  balance?: number;
}


const NftIngameDetail = ({ nft, onBack, balance }: NftIngameDetailProps) => {
  const [isOpenTransfer, setIsOpenTransfer] = useState<boolean>(false);
  const config = useContext(ConfigContext);
  const currencyBalance = useCurrencyBalance();
  const [errorMessage, setErrorMessage] = useState<string>();
  const { profile } = useProfile()
  const [loading, setLoading] = useState<boolean>(false);
  const setMessageAlter = useAlter();
  const handleBack = (e: MouseEvent) => {
    e.preventDefault();
    onBack()
  }

  const handleTransfer = async () => {
    setLoading(true);
    if(balance && balance < parseFloat(config.nftWithdrawFee)) {
      setErrorMessage(`Not enough ${currencyBalance.name}`)
    } else {
      const response = await transferNft({
        mintAddress: nft.mintAddress,
        customerId: profile.id
      })
      if(response.result === 'SUCCESS') {
        setIsOpenTransfer(false)
        setMessageAlter(MESSAGE_SUCCESS)
        onBack()
      } else {
        setErrorMessage(response.result)
      }
    }
    setLoading(false);
  }

return (
    <>
      <section className={`container ${nft.type === TYPE_NFT_TUTOR_BOX  ? '': 'tutor-box'} pb-5`}>
        <div className="py-3">
          <a href='#' onClick={handleBack} className="back-link"><img src={imageBack} alt="back" /> Back</a>
        </div>
        {nft.type === TYPE_NFT_TUTOR_BOX ? (
          <NftIngameTutorBox nft={nft!} handleOpenModalTransfer={() => setIsOpenTransfer(true)}  />
        ) : (
            <NftIngameBox nft={nft!} handleOpenModalTransfer={() => setIsOpenTransfer(true)} />
        )}
      </section>

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

export default NftIngameDetail