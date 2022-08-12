import { useRef } from 'react'
import { CandyShop } from '@liqnft/candy-shop-sdk'
import OrderDetail from '../components/Order/OrderDetail'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Cluster } from '@solana/web3.js'
import { WalletMultiButton } from '../components/Wallet/WalletMultiButton'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { candyShop } from '../utils/candy-shop';

const DesContainer = styled.div`
  width: 100%;

  .candy-value {
    color: #fff;
  }

  .candy-nft-attribute {
    color: #000;
  }

  .buy-modal {
    color: #000;
  }
`

const SingleOrder: React.FC = () => {
  const { tokenMint, candyShopCreatorAddress } = useParams()

  const wallet = useAnchorWallet();

  if (!tokenMint) return null;

  return (
    <DesContainer>
      <OrderDetail
        tokenMint={tokenMint}
        backUrl={'/marketplace-with-url'}
        wallet={wallet}
        candyShop={candyShop}
        walletConnectComponent={<WalletMultiButton />}
        candyShopCreatorAddress={candyShopCreatorAddress!}
      />
    </DesContainer>
  )
}

export default SingleOrder
