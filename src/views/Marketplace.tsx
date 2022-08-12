import { useRef } from 'react'
import { CandyShop } from '@liqnft/candy-shop-sdk'
import { Orders } from '../components/Orders'
import { Stat } from '@liqnft/candy-shop'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Cluster } from '@solana/web3.js'
import { WalletMultiButton } from '../components/Wallet/WalletMultiButton';
import { candyShop } from '../utils/candy-shop';
import styled from 'styled-components'

const DesContainer = styled.div`
  width: 100%;
  min-height: 525px;
`

const Marketplace: React.FC = () => {
  const wallet = useAnchorWallet();

  return (
    <DesContainer>
      <Orders
        wallet={wallet}
        candyShop={candyShop}
        walletConnectComponent={<WalletMultiButton />}
      />
    </DesContainer>
  )
}

export default Marketplace
