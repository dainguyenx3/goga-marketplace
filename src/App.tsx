import { createTheme, ThemeProvider } from '@material-ui/core'
import { useMemo, useEffect, createContext, useState } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import * as anchor from '@project-serum/anchor'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from './components/Wallet/WalletModalProvider'
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolflareWebWallet,
  getSolletWallet,
  getSolletExtensionWallet,
  getSolongWallet,
  getLedgerWallet,
  getSafePalWallet,
} from '@solana/wallet-adapter-wallets'
import { Route, Routes, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import TopNav from './components/TopNav'
import Footer from './components/Footer'
import { CurrencyProvider } from './components/Currency'
import Marketplace from './views/Marketplace'
import MyCollection from './views/MyCollection'
import SingleOrder from './views/SingleOrder'
import ContactUs from './components/ContactUs'
import Wallet404 from './components/Wallet/Wallet404'
import Account from './views/Account'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Connection } from '@solana/web3.js'
import Banner from './components/Banner';
import MintGoga from './views/MintGoga';
import './mint.css';
import { ProfileContex } from './hooks/useProfile';
import { useLocalStorage } from '@solana/wallet-adapter-react';
import { KEY_PROFILE } from './constant/index';
import { getConfig } from './api';
import SingleNft from './views/SingleNft';
import SingleNftIngame from './views/SingleNftIngame'
import { AlterContext } from './hooks/useAlter';
import TransactionCancel from './components/Transaction/TransactionCancel'
require('@solana/wallet-adapter-react-ui/styles.css')


// const candyMachineIds = [new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID!)]
const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork
const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!
// const connection = new anchor.web3.Connection(
//     rpcHost ? rpcHost : anchor.web3.clusterApiUrl('devnet'),
// );

const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(
        process.env.REACT_APP_CANDY_MACHINE_ID!,
    );

    return candyMachineId;
  } catch (e) {
    console.log('Failed to construct CandyMachineId', e);
    return undefined;
  }
};

const candyMachineId = getCandyMachineId();

const txTimeout = 30000 // milliseconds (confirm this works for your project)

const theme = createTheme({
  palette: {
    type: 'dark',
  },
  overrides: {
    MuiButtonBase: {
      root: {
        justifyContent: 'flex-start',
      },
    },
    MuiButton: {
      root: {
        textTransform: undefined,
        padding: '12px 16px',
      },
      startIcon: {
        marginRight: 8,
      },
      endIcon: {
        marginLeft: 8,
      },
    },
  },
})

// Used for a multi-currency shop
const currencyOptions = [
  {
    currencySymbol: 'SOL',
    treasuryMint: 'So11111111111111111111111111111111111111112',
    currencyDecimals: 9,
    priceDecimals: 3,
    volumeDecimals: 1
  },
  {
    currencySymbol: '56p',
    treasuryMint: '56pdaHboK66cxRLkzkYVvFSAjfoNEETJUsrdmAYaTXMJ',
    currencyDecimals: 9,
    priceDecimals: 2,
    volumeDecimals: 1
  }
];

export interface ConfigContextInterface {
  ipfsUrl: string;
  websiteUrl: string;
  chainApiUrl: string;
  networkId: string;
  loginMessage: string;
  transferProxy: string;
  erc20TransferProxy: string;
  transferProxyDeprecated: string;
  exchangeState: string;
  exchangeHolder: string;
  exchangeSystem: string;
  treasuryAccount: string;
  nftWithdrawFee: string;
  nftWithdrawCurrency: number;
}

export const ConfigContext = createContext({} as ConfigContextInterface)
export const ConnectionContext = createContext({} as Connection)
const App = () => {
  const [connection, setConnection] = useState<Connection>();
  const [config, setConfig] = useState<ConfigContextInterface>()
  const [messageAlter, setMessageAlter] = useState<string | undefined>()
  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWallet(),
      getSolflareWebWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
      getSolongWallet(),
      getLedgerWallet(),
      getSafePalWallet(),
    ],
    []
  )

  const [profile, setProfile] = useLocalStorage(KEY_PROFILE, null)
  const { pathname } = useLocation();
  
  useEffect(() => {
    (async () => {
      const res = await getConfig();
      if(res?.data) {
        setConnection(new anchor.web3.Connection(res.data.chainApiUrl));
        setConfig(res.data)
      }
    })()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname])
  return (
    <ThemeProvider theme={theme}>
      {config?.chainApiUrl ? (
        <ConnectionProvider endpoint={config?.chainApiUrl}>
        <ConfigContext.Provider value={config!} >
          <ConnectionContext.Provider value={connection!}>
            <WalletProvider wallets={wallets} autoConnect={true}>
              <CurrencyProvider currencyOptions={currencyOptions}>
              <ProfileContex.Provider value={{profile, setProfile}}>
                <WalletModalProvider>
                  <AlterContext.Provider value={setMessageAlter}>
                  <main id='main'>
                    <MainContainer>
                      <Routes>
                        <Route
                          path='/marketplace/:tokenMint/:candyShopCreatorAddress'
                          element={(
                            <>
                              <TopNav />
                              <SingleOrder />
                              <Footer />
                            </>
                          )}
                        />
                        <Route
                          path='/'
                          element={(
                            <>
                              <TopNav />
                              <Banner />
                              <Marketplace />
                              {
                                messageAlter && <TransactionCancel isShow={messageAlter ? true : false} handCloseWarning={() => setMessageAlter(undefined)} message={messageAlter} />
                              }
                              <Footer />
                            </>
                          )}
                        />
                        <Route
                          path='/contact-us'
                          element={(
                            <>
                              <TopNav />
                              <ContactUs />
                              <Footer />
                            </>
                          )}
                        />
                        <Route
                          path='/inventory'
                          element={
                            <>
                              <TopNav />
                              <MyCollection />
                              {
                                messageAlter && <TransactionCancel isShow={messageAlter ? true : false} handCloseWarning={() => setMessageAlter(undefined)} message={messageAlter} />
                              }
                              <Footer />
                            </>
                          }
                        />
                        <Route
                          path='/inventory/wallet/:mintAddress/:tokenAddress'
                          element={
                            <>
                              <TopNav />
                              <SingleNft />
                              <Footer />
                            </>
                          }
                        />
                        <Route
                          path='/inventory/ingame/:mintAddress'
                          element={
                            <>
                              <TopNav />
                              <SingleNftIngame />
                              {
                                messageAlter && <TransactionCancel isShow={messageAlter ? true : false} handCloseWarning={() => setMessageAlter(undefined)} message={messageAlter} />
                              }
                              <Footer />
                            </>
                          }
                        />
                        <Route
                          path='/404'
                          element={
                            <>
                              <TopNav />
                              <Wallet404 />
                              <Footer />
                            </>
                          }
                        />
                        <Route
                          path='/account/:type'
                          element={
                            <>

                                <TopNav />
                                <Account />
                                {
                                  messageAlter && <TransactionCancel isShow={messageAlter ? true : false} handCloseWarning={() => setMessageAlter(undefined)} message={messageAlter} />
                                }
                                <Footer />

                            </>
                          }
                        />
                        <Route
                            path='/mint'
                            element={
                              <>
                                <TopNav />
                                <MintGoga
                                    candyMachineId={candyMachineId}
                                    connection={connection!}
                                    txTimeout={txTimeout}
                                    rpcHost={rpcHost}
                                    network={network}
                                />
                                <Footer />
                              </>
                            }
                        />
                      </Routes>
                    </MainContainer>
                  </main>
                  </AlterContext.Provider>
                </WalletModalProvider>
                </ProfileContex.Provider>
              </CurrencyProvider>
            </WalletProvider>
          </ConnectionContext.Provider>
          </ConfigContext.Provider>
        </ConnectionProvider>
      ): ''}
    </ThemeProvider>
  )
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

export default App
