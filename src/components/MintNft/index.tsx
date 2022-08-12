import { useState, useEffect } from 'react';
import Alert from '@material-ui/lab/Alert'
import styled from 'styled-components'
import { LinearProgress, Paper, Snackbar } from '@material-ui/core'
import { useAnchorWallet } from '@solana/wallet-adapter-react'
import { AlertState, getAtaForMint, toDate } from '../../utils/utils'
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
} from '../../utils/goga/candy-machine'
import Countdown from 'react-countdown'
import { GatewayProvider } from '@civic/solana-gateway-react'
import { WalletMultiButton } from '../Wallet/WalletMultiButton'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { MintButton } from '../MintButton'
import * as anchor from '@project-serum/anchor'
import confetti from 'canvas-confetti'
import imageProduct4 from '../../img/products/lootbox-04.png'
import imageProduct1 from '../../img/products/lootbox-01.png'

const cluster = process.env.REACT_APP_SOLANA_NETWORK!.toString()
const decimals = process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS
  ? +process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString()
  : 9
const splTokenName = process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME
  ? process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME.toString()
  : 'TOKEN'

const BorderLinearProgress = styled(LinearProgress)`
  margin: 20px;
  height: 10px !important;
  border-radius: 30px;
  border: 2px solid white;
  box-shadow: 5px 5px 40px 5px rgba(0, 0, 0, 0.5);
  background-color: var(--main-text-color) !important;

  > div.MuiLinearProgress-barColorPrimary {
    background-color: var(--title-text-color) !important;
  }

  > div.MuiLinearProgress-bar1Determinate {
    border-radius: 30px !important;
    background-image: linear-gradient(270deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.5));
  }
`

const MintButtonContainer = styled.div`
  button.MuiButton-contained:not(.MuiButton-containedPrimary).Mui-disabled {
    color: #464646;
  }

  button.MuiButton-contained:not(.MuiButton-containedPrimary):hover,
  button.MuiButton-contained:not(.MuiButton-containedPrimary):focus {
    -webkit-animation: pulse 1s;
    animation: pulse 1s;
    box-shadow: 0 0 0 2em rgba(255, 255, 255, 0);
  }

  @-webkit-keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 #ef8f6e;
    }
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 #ef8f6e;
    }
  }
`
const ConnectButton = styled(WalletMultiButton)`
  border-radius: 18px !important;
  padding: 6px 16px;
  background-color: #4e44ce;
  margin: 0 auto;
`

const Card = styled(Paper)`
  display: inline-block;
  background-color: var(card-background-lighter-color) !important;
  margin: 5px;
  min-width: 40px;
  padding: 24px;
  h1 {
    margin: 0px;
  }
`

const SolExplorerLink = styled.a`
  color: var(--title-text-color);
  border-bottom: 1px solid var(--title-text-color);
  font-weight: bold;
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  outline: none;
  text-decoration: none;
  text-size-adjust: 100%;

  :hover {
    border-bottom: 2px solid var(--title-text-color);
  }
`

export interface MintNftProps {
  candyMachineId: anchor.web3.PublicKey
  connection: anchor.web3.Connection
  txTimeout: number
  rpcHost: string,
  contents?: string[],
}

export const MintNft = (props: MintNftProps) => {

  const [balance, setBalance] = useState<number>()
  const [isMinting, setIsMinting] = useState(false) // true when user got to press MINT
  const [isActive, setIsActive] = useState(false) // true when countdown completes or whitelisted
  const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>('')
  const [itemsAvailable, setItemsAvailable] = useState(0)
  const [itemsRedeemed, setItemsRedeemed] = useState(0)
  const [itemsRemaining, setItemsRemaining] = useState(0)
  const [isSoldOut, setIsSoldOut] = useState(false)
  const [payWithSplToken, setPayWithSplToken] = useState(false)
  const [price, setPrice] = useState(0)
  const [priceLabel, setPriceLabel] = useState<string>('SOL')
  const [whitelistPrice, setWhitelistPrice] = useState(0)
  const [whitelistEnabled, setWhitelistEnabled] = useState(false)
  const [isBurnToken, setIsBurnToken] = useState(false)
  const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0)
  const [isEnded, setIsEnded] = useState(false)
  const [endDate, setEndDate] = useState<Date>()
  const [isPresale, setIsPresale] = useState(false)
  const [isWLOnly, setIsWLOnly] = useState(false)

  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  })

  const wallet = useAnchorWallet()
  const rpcUrl = props.rpcHost
  const contents = props.contents
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>()

  const renderEndDateCounter = ({ days, hours, minutes }: any) => {
    let label = ''
    if (days > 0) {
      label += days + ' days '
    }
    if (hours > 0) {
      label += hours + ' hours '
    }
    label += minutes + 1 + ' minutes left to MINT.'
    return (
      <div>
        <h3>{label}</h3>
      </div>
    )
  }

    function displaySuccess(mintPublicKey: any): void {
    let remaining = itemsRemaining - 1
    setItemsRemaining(remaining)
    setIsSoldOut(remaining === 0)
    if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
      let balance = whitelistTokenBalance - 1
      setWhitelistTokenBalance(balance)
      setIsActive(isPresale && !isEnded && balance > 0)
    }
    setItemsRedeemed(itemsRedeemed + 1)
    const solFeesEstimation = 0.012 // approx
    if (!payWithSplToken && balance && balance > 0) {
      setBalance(balance - (whitelistEnabled ? whitelistPrice : price) - solFeesEstimation)
    }
    setSolanaExplorerLink(
      cluster === 'devnet' || cluster === 'testnet'
        ? 'https://solscan.io/token/' + mintPublicKey + '?cluster=' + cluster
        : 'https://solscan.io/token/' + mintPublicKey
    )
    throwConfetti()
    }

    function throwConfetti(): void {
    confetti({
      particleCount: 400,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  const onMint = async () => {
  //   try {
  //     setIsMinting(true)
  //     if (wallet && candyMachine?.program && wallet.publicKey) {
  //       const mint = anchor.web3.Keypair.generate()
  //       const mintTxId = (await mintOneToken(candyMachine, wallet.publicKey, mint))[0]
  //
  //       let status: any = { err: true }
  //       if (mintTxId) {
  //         status = await awaitTransactionSignatureConfirmation(
  //           mintTxId,
  //           props.txTimeout,
  //           props.connection,
  //           'singleGossip',
  //           true
  //         )
  //       }
  //
  //       if (!status?.err) {
  //         setAlertState({
  //           open: true,
  //           message: 'Congratulations! Mint succeeded!',
  //           severity: 'success',
  //         })
  //
  //         // update front-end amounts
  //         displaySuccess(mint.publicKey)
  //       } else {
  //         setAlertState({
  //           open: true,
  //           message: 'Mint failed! Please try again!',
  //           severity: 'error',
  //         })
  //       }
  //     }
  //   } catch (error: any) {
  //     // TODO: blech:
  //     let message = error.msg || 'Minting failed! Please try again!'
  //     if (!error.msg) {
  //       if (!error.message) {
  //         message = 'Transaction Timeout! Please try again.'
  //       } else if (error.message.indexOf('0x138')) {
  //       } else if (error.message.indexOf('0x137')) {
  //         message = `SOLD OUT!`
  //       } else if (error.message.indexOf('0x135')) {
  //         message = `Insufficient funds to mint. Please fund your wallet.`
  //       }
  //     } else {
  //       if (error.code === 311) {
  //         message = `SOLD OUT!`
  //       } else if (error.code === 312) {
  //         message = `Minting period hasn't started yet.`
  //       }
  //     }
  //
  //     setAlertState({
  //       open: true,
  //       message,
  //       severity: 'error',
  //     })
  //   } finally {
  //     setIsMinting(false)
  //   }
  // }
  //
  // const refreshCandyMachineState = () => {
  //   ;(async () => {
  //     if (!wallet) return
  //
  //     const cndy = await getCandyMachineState(
  //       wallet as anchor.Wallet,
  //       props.candyMachineId,
  //       props.connection
  //     )
  //
  //     setCandyMachine(cndy)
  //     setItemsAvailable(cndy.state.itemsAvailable)
  //     setItemsRemaining(cndy.state.itemsRemaining)
  //     setItemsRedeemed(cndy.state.itemsRedeemed)
  //
  //     var divider = 1
  //     if (decimals) {
  //       divider = +('1' + new Array(decimals).join('0').slice() + '0')
  //     }
  //
  //     // detect if using spl-token to mint
  //     if (cndy.state.tokenMint) {
  //       setPayWithSplToken(true)
  //       // Customize your SPL-TOKEN Label HERE
  //       // TODO: get spl-token metadata name
  //       setPriceLabel(splTokenName)
  //       setPrice(cndy.state.price.toNumber() / divider)
  //       setWhitelistPrice(cndy.state.price.toNumber() / divider)
  //     } else {
  //       setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL)
  //       setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL)
  //     }
  //
  //     // fetch whitelist token balance
  //     if (cndy.state.whitelistMintSettings) {
  //       setWhitelistEnabled(true)
  //       setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime)
  //       setIsPresale(cndy.state.whitelistMintSettings.presale)
  //       setIsWLOnly(!isPresale && cndy.state.whitelistMintSettings.discountPrice === null)
  //
  //       if (
  //         cndy.state.whitelistMintSettings.discountPrice !== null &&
  //         cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price
  //       ) {
  //         if (cndy.state.tokenMint) {
  //           setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / divider)
  //         } else {
  //           setWhitelistPrice(
  //             cndy.state.whitelistMintSettings.discountPrice?.toNumber() / LAMPORTS_PER_SOL
  //           )
  //         }
  //       }
  //
  //       let balance = 0
  //       try {
  //         const tokenBalance = await props.connection.getTokenAccountBalance(
  //           (
  //             await getAtaForMint(cndy.state.whitelistMintSettings.mint, wallet.publicKey)
  //           )[0]
  //         )
  //
  //         balance = tokenBalance?.value?.uiAmount || 0
  //       } catch (e) {
  //         console.error(e)
  //         balance = 0
  //       }
  //       setWhitelistTokenBalance(balance)
  //       setIsActive(isPresale && !isEnded && balance > 0)
  //     } else {
  //       setWhitelistEnabled(false)
  //     }
  //
  //     // end the mint when date is reached
  //     if (cndy?.state.endSettings?.endSettingType.date) {
  //       setEndDate(toDate(cndy.state.endSettings.number))
  //       if (cndy.state.endSettings.number.toNumber() < new Date().getTime() / 1000) {
  //         setIsEnded(true)
  //         setIsActive(false)
  //       }
  //     }
  //     // end the mint when amount is reached
  //     if (cndy?.state.endSettings?.endSettingType.amount) {
  //       let limit = Math.min(cndy.state.endSettings.number.toNumber(), cndy.state.itemsAvailable)
  //       setItemsAvailable(limit)
  //       if (cndy.state.itemsRedeemed < limit) {
  //         setItemsRemaining(limit - cndy.state.itemsRedeemed)
  //       } else {
  //         setItemsRemaining(0)
  //         cndy.state.isSoldOut = true
  //         setIsEnded(true)
  //       }
  //     } else {
  //       setItemsRemaining(cndy.state.itemsRemaining)
  //     }
  //
  //     if (cndy.state.isSoldOut) {
  //       setIsActive(false)
  //     }
  //   })()
  }

  const renderGoLiveDateCounter = ({ days, hours, minutes, seconds }: any) => {
    return (
      <div>
        <Card elevation={1}>
          <h1>{days}</h1>Days
        </Card>
        <Card elevation={1}>
          <h1>{hours}</h1>
          Hours
        </Card>
        <Card elevation={1}>
          <h1>{minutes}</h1>Mins
        </Card>
        <Card elevation={1}>
          <h1>{seconds}</h1>Secs
        </Card>
      </div>
    )
  }

   // useEffect(refreshCandyMachineState, [
   //  wallet,
   //  props.candyMachineId,
   //  props.connection,
   //  isEnded,
   //  isPresale,
   // ])

   useEffect(() => {
    ;(async () => {
      if (wallet) {
        const balance = await props.connection.getBalance(wallet.publicKey)
        setBalance(balance / LAMPORTS_PER_SOL)
      }
    })()
  }, [wallet, props.connection])

  return (
    <>
      <div className="col-lg-5">
          <div className="box box-center box-text-bottom box-product bg-light">
            <div className="box-image">
              <img width="255" height="230" src={imageProduct1} alt="" />
            </div>
            <div className="box-text text-center">
            <div className="box-text-inner">
              <p className="product-name"><strong>Normal Box</strong></p>
            <div className="product-desc">
                <ul>
                  {contents?.map(text => <li>{ text }</li>)}
              </ul>
            </div>
            <h4>
              {isActive && whitelistEnabled && whitelistTokenBalance > 0
              ? whitelistPrice + ' ' + priceLabel
              : price + ' ' + priceLabel}
            </h4>
            <p>~ 1.2 USD</p>
            <div className="product-purchase">
                {wallet && isActive && whitelistEnabled && whitelistTokenBalance > 0 && isBurnToken
                && (<h3>You own {whitelistTokenBalance} WL mint{' '} {whitelistTokenBalance > 1 ? 'tokens' : 'token'}.</h3>)}
                {wallet && isActive && whitelistEnabled && whitelistTokenBalance > 0 && !isBurnToken &&
                <h3>You are whitelisted and allowed to mint.</h3>}
                {wallet && isActive && endDate && Date.now() < endDate.getTime() && (
                  ""
                  // <Countdown
                  //   date={toDate(candyMachine?.state?.endSettings?.number)}
                  //   onMount={({ completed }: { completed: any}) => completed && setIsEnded(true)}
                  //   onComplete={() => { setIsEnded(true) }}
                  //   renderer={renderEndDateCounter}
                  // />
                )}
                {/* {wallet && isActive && (<h3>TOTAL MINTED : {itemsRedeemed} / {itemsAvailable}</h3>)} */}
                {wallet && isActive && (
                  <BorderLinearProgress
                    variant='determinate'
                    value={100 - (itemsRemaining * 100) / itemsAvailable}
                  />
                )}
                <br />
                <MintButtonContainer>
                  {!isActive && !isEnded && candyMachine?.state.goLiveDate &&
                  (!isWLOnly || whitelistTokenBalance > 0) ? (
                    ''
                  // <Countdown
                  //   date={toDate(candyMachine?.state.goLiveDate)}
                  //   onMount={({ completed }: { completed: any}) => completed && setIsActive(!isEnded)}
                  //   onComplete={() => { setIsActive(!isEnded) }}
                  //   renderer={renderGoLiveDateCounter}
                  // />
                  ) : !wallet ? (<ConnectButton>Connect Wallet</ConnectButton>)
                    : !isWLOnly || whitelistTokenBalance > 0 ? (
                      candyMachine?.state.gatekeeper &&
                      wallet.publicKey &&wallet.signTransaction ? (
                        <GatewayProvider
                          wallet={{
                          publicKey: wallet.publicKey || new PublicKey(CANDY_MACHINE_PROGRAM),
                          //@ts-ignore
                          signTransaction: wallet.signTransaction,
                        }}
                        // // Replace with following when added
                        // gatekeeperNetwork={candyMachine.state.gatekeeper_network}
                          gatekeeperNetwork={candyMachine?.state?.gatekeeper?.gatekeeperNetwork} // This is the ignite (captcha) network
                          /// Don't need this for mainnet
                          clusterUrl={rpcUrl}
                          options={{ autoShowModal: false }}>
                          <MintButton
                            candyMachine={candyMachine}
                            isMinting={isMinting}
                            isActive={isActive}
                            isEnded={isEnded}
                            isSoldOut={isSoldOut}
                            onMint={onMint}
                          />
                        </GatewayProvider>
                    ) : (
                      <MintButton
                        candyMachine={candyMachine}
                        isMinting={isMinting}
                        isActive={isActive}
                        isEnded={isEnded}
                        isSoldOut={isSoldOut}
                        onMint={onMint}
                      />
                    )
                  ) : (
                    <h1>Mint is private.</h1>
                  )}
                </MintButtonContainer>
                <br />
                {wallet && isActive && solanaExplorerLink && (
                  <SolExplorerLink href={solanaExplorerLink} target='_blank'>
                    View on Solscan
                  </SolExplorerLink>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}>
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}>
          {alertState.message}
        </Alert>
      </Snackbar>
    </>
  );
};
