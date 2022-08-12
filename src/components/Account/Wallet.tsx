import Back from './Back';
import Sidebar from './Sidebar';
import iconWallet2 from '../../img/icon/icon-wallet2.png';
import iconIngame from '../../img/icon/icon-ingame.png';
import iconCopy from '../../img/copy.png';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useContext, useState, useRef } from 'react'
import { getCurrency, getBalanceIngame, CurrencyBalance, BalanceIngame, transferToken } from '../../api'
import { Overlay, Tooltip, OverlayTrigger, Popover } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import TransferModal from '../Transfer/TransferModal';
import * as gogaTransfer from '../../utils/goga/transfer-spl';
import { ConfigContext } from '../../App';
import { useConnection, useAnchorWallet} from "@solana/wallet-adapter-react";
import { web3 } from '@project-serum/anchor';
import TransactionCancel from '../Transaction/TransactionCancel';
import { CurrencyBalanceContext } from '../../hooks/useCurrencyBalance';
import {getProfile} from '../../api'
import { useProfile } from '../../hooks/useProfile'
import { useAlter } from '../../hooks/useAlter';
import {MESSAGE_SUCCESS} from '../../constant';

export interface UserProfile {
    id: string;
    linked: boolean;
    status: number;
    version: number;
}
const Wallet = () => {
    const { publicKey, wallet } = useWallet();
    const { profile, setProfile } = useProfile();
    const { connection } = useConnection();
    const navigate = useNavigate();
    const [currencyBalance, setCurrencyBalance] = useState<CurrencyBalance>();
    const [balanceWallet, setBalanceWallet] = useState<number>(0);
    const [balanceIngame, setBalanceIngame] = useState<BalanceIngame>();
    const [totalTokenWallet, setTotalTokenWallet] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [typeTransfer, setTypeTransfer] = useState<'to_inventory' | 'to_wallet'>('to_inventory');
    const config = useContext(ConfigContext);
    const walletAnchor = useAnchorWallet();
    const [numberBalanceTransfer, setNumberBalanceTransfer] = useState<number | undefined>();
    const [isShowErr, setIsShowErr] = useState<boolean>(false);
    const [show, setShow] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const target = useRef(null);
    const [loadingTransfer, setLoadingTransfer] = useState<boolean>(false);
    const setMessageAlter = useAlter();
    useEffect(() => {
        getProfile().then((res) => {
            const {data} = res
            if(data.linked !== profile?.linked) {
                setProfile(data)
            }
        })
    }, [])

    useEffect(() => {
        setNumberBalanceTransfer(undefined)
    }, [typeTransfer])

    useEffect(() => {
        (async () => {
            if(profile) {
                const response = await Promise.all([getCurrency(), getBalanceIngame()]);
                if(response.length > 0) {
                    const currencyBalanceData = response[0].find(item => item.currency === config.nftWithdrawCurrency);
                    if(currencyBalanceData) {
                        setCurrencyBalance(currencyBalanceData);
                        handleChangeBalaceWallet()
                        const balanceIngameData = response[1]?.find(item => item.currency === currencyBalanceData.currency);
                        if(balanceIngameData) setBalanceIngame(balanceIngameData);
                    }
                }
            }

        })()
    }, [connection, walletAnchor, publicKey, currencyBalance?.address])

    const handleChangeBalaceWallet = async () => {
        try {
            const mintPublicKey = new web3.PublicKey(currencyBalance?.address!);
            // const mintPublicKey = new web3.PublicKey('HgDofNwp6RB4oTJsdhMR4dvypxjm5RwycrpEuuAQgu38');
            const account = gogaTransfer.Wallet.fromWallet(connection, walletAnchor!);
            const amount = await account.getBalance(mintPublicKey)
            setTotalTokenWallet(amount)
        } catch (error) {
               console.log('error',error)
        }
    }

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then(res => {
                setBalanceWallet(res / LAMPORTS_PER_SOL)
            }).catch(err => {
                console.log('error', err)
            })
        }
    }, [publicKey])

    useEffect(() => {
        if (show) {
            const timeId = setTimeout(() => {
                setShow(false)
            }, 3000)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [show])

    const handleOpenModalTranfer = (type: 'to_inventory' | 'to_wallet') => {
        setTypeTransfer(type);
        setIsOpen(true);
    }

    const handleTransfer = async () => {
        if (profile) {
            setLoadingTransfer(true);
            if(typeTransfer === 'to_inventory') {
                const mintPublicKey = new web3.PublicKey(currencyBalance?.address!);
                // const mintPublicKey = new web3.PublicKey('HgDofNwp6RB4oTJsdhMR4dvypxjm5RwycrpEuuAQgu38');
                const account = gogaTransfer.Wallet.fromWallet(connection, walletAnchor!);
                const destPublicKey = new web3.PublicKey(config.treasuryAccount);
                const response = await account.transferToken(mintPublicKey, destPublicKey, Number(numberBalanceTransfer)).catch(e => {
                    setIsShowErr(true);
                })
                if(response) {
                    setIsOpen(false);
                    await handleChangeBalaceWallet();
                    setMessageAlter(MESSAGE_SUCCESS)
                }
            } else {
                const response = await transferToken({
                    currency: currencyBalance?.currency!,
                    customerId: profile?.id,
                    amount: numberBalanceTransfer ? numberBalanceTransfer : 0
                })
                if(response.result === 'SUCCESS') {
                    setIsOpen(false);
                    const data = await getBalanceIngame();
                    if(currencyBalance) {
                        const balanceIngameData = data.find(item => item.currency === currencyBalance.currency);
                        if(balanceIngameData) setBalanceIngame(balanceIngameData);
                    }
                    setMessageAlter(MESSAGE_SUCCESS)
                } else {
                    setErrorMessage(response.result)
                }
            }
            setLoadingTransfer(false)
        }
      }

    const handleCopy = (e: any) => {
        e.preventDefault()
        navigator.clipboard.writeText(publicKey?.toBase58()!)
        setShow(!show);
    }

    const popover = (
        <Popover>
          <Popover.Body style={{padding: '5px 15px'}}>
            Copied
          </Popover.Body>
        </Popover>
    );

 return (
    <CurrencyBalanceContext.Provider value={currencyBalance!}>
        <div className="panel-wallet">
            <section className="container">
                <Back />
                <div className="row pb-5">
                    <Sidebar />
                        <div className="col-lg-9">
                            <section className="container mb-2">
                                <div className="space-between sc-header">
                                    <div className="title icon"><img className="me-2"  src={iconWallet2} alt="" /> Wallet</div>
                                    <div className="user_key">
                                        <span>{ publicKey && (publicKey?.toBase58().slice(0, 8) + '...' + publicKey?.toBase58().slice(-8))}</span>
                                        <OverlayTrigger show={show} trigger="click" placement="bottom" overlay={popover}>
                                            <a href="#"  ref={target} onClick={handleCopy} className="copy_text" data-bs-toggle="tooltip" data-bs-placement="top" title="Copied"><img src={iconCopy} alt="copy" /></a>
                                        </OverlayTrigger>
                                    </div>
                                </div>

                                <div className="row wallet-boxs mb-0">
                                    <div className="col-lg-4 wallet-box normal">
                                        <div className="col-inner">
                                            <h3 className="title">Other Currency</h3>
                                            <div className="box-icon">
                                                <i className="icon-currency solana"></i>
                                            </div>
                                        <div className="value">{balanceWallet} SOL</div>
                                    </div>
                                </div>

                                <div className="col-lg-4 wallet-box normal">
                                    <div className="col-inner">
                                        <h3 className="title">Your Balance</h3>
                                        <div className="box-icon">
                                            <i className="icon-currency coin"></i>
                                        </div>
                                        <div className="value">{ `${totalTokenWallet} ${currencyBalance?.name ? currencyBalance?.name : '' }`}</div>
                                            <div className="py-3 px-3">
                                                <button
                                                    onClick={() => handleOpenModalTranfer('to_inventory')}
                                                    disabled={ totalTokenWallet <= 0 || (profile && !profile.linked)  }
                                                    className={`btn ${totalTokenWallet > 0 && (profile && profile.linked) ? 'btn-success' : 'btn-disable' } fluid`}>
                                                        Transfer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="container">
                                <div className="space-between sc-header" style={{justifyContent: 'normal'}}>
                                    <div className="title icon">
                                        <img className="me-2" src={iconIngame} alt="" />
                                        Ingame Currency
                                    </div>
                                </div>
                                {
                                    (profile && profile?.linked) ? (
                                        <div className="row wallet-boxs mb-0">
                                            <div className="col-lg-4 wallet-box normal">
                                                <div className="col-inner">
                                                    <h3 className="title">Your Balance</h3>
                                                    <div className="box-icon">
                                                        <i className="icon-currency coin"></i>
                                                    </div>
                                                    <div className="value">{ `${balanceIngame?.availableBalance ? balanceIngame?.availableBalance : 0} ${currencyBalance?.name ? currencyBalance?.name : '' }`}</div>
                                                    <div className="py-3 px-3"><button onClick={() => handleOpenModalTranfer('to_wallet')} disabled={ !balanceIngame?.availableBalance || parseFloat(balanceIngame?.availableBalance!) <= 0} className={`btn ${parseFloat(balanceIngame?.availableBalance!) > 0 ? 'btn-success' : 'btn-disable'} fluid`}>Transfer</button></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-5 mb-5">
                                            <p className="text-center mb-5 fs-3 fw-bold text-secondary">You haven’t linked to your in-game account</p>
                                            <div className="row justify-content-center">
                                                <div className="col-6 col-lg-3">
                                                    <button style={{borderRadius: '10px'}} onClick={() => navigate('/account/link-account')} className="btn btn-warning fluid">Link Account</button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </section>
                        </div>
                    </div>
                </section>
            </div>
            {
                isOpen && <TransferModal
                    isOpen={isOpen}
                    transfer="transfer_token"
                    type={typeTransfer}
                    handleClose={() => {
                        setLoadingTransfer(false)
                        setNumberBalanceTransfer(undefined)
                        setErrorMessage(undefined)
                        setIsOpen(false)
                    }}
                    handleTransfer={handleTransfer}
                    balance={typeTransfer === 'to_wallet' ? parseFloat(balanceIngame?.availableBalance!): totalTokenWallet}
                    amount={numberBalanceTransfer}
                    handleChangeAmount={(value: number | undefined) => {
                        setNumberBalanceTransfer(value)
                        if(errorMessage) {
                            setErrorMessage(undefined)
                        }
                    }}
                    message={errorMessage}
                    loading={loadingTransfer}
                    setMessage={(value: string) => setErrorMessage(value)}
                />
            }

            {
               isShowErr &&  <TransactionCancel isShow={isShowErr} handCloseWarning={() => setIsShowErr(false)} />
            }
    </CurrencyBalanceContext.Provider>
 )
}

export default Wallet;
