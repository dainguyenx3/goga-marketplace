import * as anchor from '@project-serum/anchor'
import { MintNft } from '../components/MintNft'
import styled from 'styled-components'

const MintContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 20px;
`

export interface HomeProps {
  candyMachineIds: anchor.web3.PublicKey[]
  connection: anchor.web3.Connection
  txTimeout: number
  rpcHost: string
}

const Home = (props: HomeProps) => {
  return (
    <>
      <MintContainer>
        <div id="content" role="main" className="content-area">
          <div className="container py-5">
            <div className="row mb-5">
              <div className="col-lg-12 text-center">
                <h2 className="text-pink mb-5">Tutor Box</h2>
                <p className="fst-italic">GOGA Tutor box contains various GOGA tutor ( NFT) with certain drop rates.</p>
                <p className="fst-italic">The higher quality of the box is, the higher the drop rate for the high-quality GOGA tutor is.</p>
              </div>          
            </div>
            <div className="row">
              {props.candyMachineIds.map((candyMachineId, index) => {
                return <MintNft
                  key={index}
                  candyMachineId={candyMachineId}
                  connection={props.connection}
                  rpcHost={props.rpcHost}
                  txTimeout={props.txTimeout}
                  contents={['Lorem ipsum dolor sit amet, consectetur', 'Lorem ipsum dolor sit amet, consectetur', 'Lorem ipsum dolor sit amet, consectetur']}
                />
              })}
            </div>
          </div>
        </div>
      </MintContainer>
    </>
  )
}

export default Home
