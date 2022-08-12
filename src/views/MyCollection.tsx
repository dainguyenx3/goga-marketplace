import { useRef, useEffect, useState } from 'react'
import { CandyShop } from '@liqnft/candy-shop-sdk'
import { Sell } from '../components/Sell'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Cluster } from '@solana/web3.js'
import { WalletMultiButton } from '../components/Wallet/WalletMultiButton'
import { CurrencyBalanceContext } from '../hooks/useCurrencyBalance'
import { useProfile } from '../hooks/useProfile'
import { useConfig } from '../hooks/useConfig'
import { getCurrency, getBalanceIngame, CurrencyBalance } from '../api'
import { candyShop } from '../utils/candy-shop'
import styled from 'styled-components'

const DesContainer = styled.div`
  width: 100%;

  .wallet-adapter-button {
    margin: 0 auto;
  }
`

const MyCollection: React.FC = () => {
  const wallet = useAnchorWallet()
  const {profile} = useProfile();
  const config = useConfig();
  const [currencyBalance, setCurrencyBalance] = useState<CurrencyBalance>()


  useEffect(() => {
    (async () => {
        if(profile) {
          const response = await getCurrency()
          if(response) {
            const currencyBalanceData = response.find(item => item.currency === config.nftWithdrawCurrency);
            if(currencyBalanceData) {
              setCurrencyBalance(currencyBalanceData)
            }
          }
        }
    })()
  }, [profile?.email])

  return (
    <DesContainer>
      <CurrencyBalanceContext.Provider value={currencyBalance!}>
        <Sell
          wallet={wallet}
          candyShop={candyShop}
          walletConnectComponent={<WalletMultiButton className='btn btn-warning rounded-pill btn-connect-wallet text-primary mb-2'>Connect wallet</WalletMultiButton>}
          enableCacheNFT={true}
          style={{minHeight: '445px'}}
        />
      </CurrencyBalanceContext.Provider>
    </DesContainer>
  )
}

export default MyCollection
