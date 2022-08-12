import { useParams } from 'react-router-dom';
import { useEffect, useRef, useCallback, useState } from 'react';
import NftIngameDetail from '../components/Nft/NftIngameDetail';
import { NftIngameInfo } from '../components/Nft/NftIngame'
import Loading from '../components/LoadingSkeleton/Loading';
import { getNftIngame, BalanceIngame, getBalanceIngame, CurrencyBalance, getCurrency } from '../api';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import { useConfig } from '../hooks/useConfig'
import { CurrencyBalanceContext } from '../hooks/useCurrencyBalance'

const SingleNftIngame = () =>  {
    const {mintAddress} = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [nftInfo, setNftInfo] = useState<NftIngameInfo>();
    const navigate = useNavigate()
    const {profile} = useProfile();
    const [balanceIngame, setBalanceIngame] = useState<BalanceIngame>();
    const [currencyBalance, setCurrencyBalance] = useState<CurrencyBalance>();
    const config = useConfig();

    useEffect(() => {
        (async () => {
            if(profile) {
              setLoading(true)
              const response = await Promise.all([getNftIngame(), getBalanceIngame(), getCurrency()])
              if(response.length > 0) {
                if(response[0].length > 0) {
                    const findNft = response[0].find((item: NftIngameInfo) => item.mintAddress === mintAddress)
                    if(findNft) {
                        setNftInfo(findNft)
                    }
                }
                const currencyBalanceData = response[2].find(item => item.currency === config.nftWithdrawCurrency);
                if(currencyBalanceData) {
                  setCurrencyBalance(currencyBalanceData)
                }
                const balanceIngameData = response[1]?.find(item => item.currency === currencyBalance?.currency);
                if(balanceIngameData) setBalanceIngame(balanceIngameData);
              }
              setLoading(false);
            }
        })()
      }, [profile?.email])

    return (
      <CurrencyBalanceContext.Provider value={currencyBalance!}>
      {loading ? <Loading /> :
        nftInfo && <NftIngameDetail nft={nftInfo!} onBack={() => navigate(-1)} balance={parseFloat(balanceIngame?.availableBalance!)}  />
      }
      </CurrencyBalanceContext.Provider>
        
    )
}


export default SingleNftIngame;