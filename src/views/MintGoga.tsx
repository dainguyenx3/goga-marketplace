import React, {MouseEvent, useCallback, useEffect, useMemo, useState, useContext, useRef} from "react";
import styled from "styled-components";
import confetti from "canvas-confetti";
import * as anchor from "@project-serum/anchor";
import {
    Commitment,
    Connection,
    PublicKey,
    Transaction,
    LAMPORTS_PER_SOL
} from "@solana/web3.js";
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base';
import {useWallet} from "@solana/wallet-adapter-react";
import {WalletMultiButton} from "./../components/Wallet/WalletMultiButton";
import {GatewayProvider} from '@civic/solana-gateway-react';
import Countdown from "react-countdown";
import {Snackbar, Paper, LinearProgress, Chip} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import {AlertState, getAtaForMint, toDate} from './../utils/goga/utils';
import {MintButton} from './../utils/goga/MintButton';
import {
    awaitTransactionSignatureConfirmation,
    CANDY_MACHINE_PROGRAM,
    CandyMachineAccount,
    createAccountsForMint,
    getCandyMachineState,
    getCollectionPDA,
    mintOneToken,
    SetupState,
} from "./../utils/goga/candy-machine";
import { getInfoCandyMachine, InfoCandyMachineProps } from './../utils/infoCandyMachine'
import headingImg from './../images/heading.png';
// import Epic from './../images/box/Epic.jpg';
// import Good from './../images/box/Good.jpg';
// import Legendary from './../images/box/Legendary.jpg';
// import Normal from './../images/box/Normal.jpg';
// import Rare from './../images/box/Rare.jpg';
import {Modal, OverlayTrigger, OverlayTriggerProps} from "react-bootstrap";
import processingGift from "./../img/modal/processing.gif";
import successfully from "./../img/modal/successfully.png";
import solanaImageModal from "./../img/modal/solana.png";
import solanaImage from "./../img/price/solana.png";
import warningImage from "./../img/warning.png";
const cluster = process.env.REACT_APP_SOLANA_NETWORK!.toString();
const decimals = process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS ? +process.env.REACT_APP_SPL_TOKEN_TO_MINT_DECIMALS!.toString() : 9;
const splTokenName = process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME ? process.env.REACT_APP_SPL_TOKEN_TO_MINT_NAME.toString() : "TOKEN";
const TIME_HIDDEN_ERROR = 5000;

export interface HomeProps {
    candyMachineId?: anchor.web3.PublicKey;
    connection: anchor.web3.Connection;
    txTimeout: number;
    rpcHost: string;
    network: WalletAdapterNetwork;
}
// import { Modal } from "react-bootstrap";

const MintGoga = (props: HomeProps) => {
    const [infoCandyMachine, setInfoCandyMachine] = useState<InfoCandyMachineProps>({
        goLiveDate: new Date,
        price: 0,
        itemsRemaining: 0,
        itemsAvailable: 0,
        itemsRedeemed: 0
    });
    useEffect(() => {
        (async function() {
            const res = await getInfoCandyMachine(props.connection, process.env.REACT_APP_CANDY_MACHINE_ID!);
            setInfoCandyMachine(res)
        })()
    }, []);
    const [balance, setBalance] = useState<number>();
    const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT
    const [isActive, setIsActive] = useState(false); // true when countdown completes or whitelisted
    const [solanaExplorerLink, setSolanaExplorerLink] = useState<string>("");
    const [itemsAvailable, setItemsAvailable] = useState(0);
    const [itemsRedeemed, setItemsRedeemed] = useState(0);
    const [itemsRemaining, setItemsRemaining] = useState(0);
    const [isSoldOut, setIsSoldOut] = useState(false);
    const [payWithSplToken, setPayWithSplToken] = useState(false);
    const [price, setPrice] = useState(0);
    const [priceLabel, setPriceLabel] = useState<string>("SOL");
    const [whitelistPrice, setWhitelistPrice] = useState(0);
    const [whitelistEnabled, setWhitelistEnabled] = useState(false);
    const [isBurnToken, setIsBurnToken] = useState(false);
    const [whitelistTokenBalance, setWhitelistTokenBalance] = useState(0);
    const [isEnded, setIsEnded] = useState(false);
    const [endDate, setEndDate] = useState<Date>();
    const [isPresale, setIsPresale] = useState(false);
    const [isWLOnly, setIsWLOnly] = useState(false);
    const [userWalletOnline, setUserWalletOnline] = useState(false)
    const [isPreSaleDate, setIsPreSaleDate] = useState(false)

    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    });

    const [needTxnSplit, setNeedTxnSplit] = useState(true);
    const [setupTxn, setSetupTxn] = useState<SetupState>();

    const wallet = useWallet();
    const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();

    const rpcUrl = props.rpcHost;
    const solFeesEstimation = 0.012; // approx of account creation fees

    const anchorWallet = useMemo(() => {

        if (
            !wallet ||
            !wallet.publicKey ||
            !wallet.signAllTransactions ||
            !wallet.signTransaction
        ) {
            return;
        }
        setUserWalletOnline(true)
        return {
            publicKey: wallet.publicKey,
            signAllTransactions: wallet.signAllTransactions,
            signTransaction: wallet.signTransaction,
        } as anchor.Wallet;
    }, [wallet]);
    const refreshCandyMachineState = useCallback(
        async (commitment: Commitment = 'confirmed') => {

            if (!anchorWallet) {
                let priceDefault = process.env.REACT_APP_PRICE_DEFAULT!
                setPrice(parseFloat(priceDefault))
                setItemsRemaining(parseInt(process.env.REACT_APP_REMAINING_DEFAULT!))
                return;
            }

            const connection = new Connection(props.rpcHost, commitment);

            if (props.candyMachineId) {
                try {
                    const cndy = await getCandyMachineState(
                        anchorWallet,
                        props.candyMachineId,
                        connection,
                    );

                    setCandyMachine(cndy);
                    setItemsAvailable(cndy.state.itemsAvailable);
                    setItemsRemaining(cndy.state.itemsRemaining);
                    setItemsRedeemed(cndy.state.itemsRedeemed);
                    if (cndy.state?.goLiveDate ) {
                        if (cndy.state.goLiveDate.toNumber() >   new Date().getTime() / 1000) {
                            setIsPreSaleDate(true)
                        }
                    }
                    var divider = 1;
                    if (decimals) {
                        divider = +('1' + new Array(decimals).join('0').slice() + '0');
                    }

                    // detect if using spl-token to mint
                    if (cndy.state.tokenMint) {
                        setPayWithSplToken(true);
                        // Customize your SPL-TOKEN Label HERE
                        // TODO: get spl-token metadata name
                        setPriceLabel(splTokenName);
                        setPrice(cndy.state.price.toNumber() / divider);
                        setWhitelistPrice(cndy.state.price.toNumber() / divider);
                    } else {
                        setPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
                        setWhitelistPrice(cndy.state.price.toNumber() / LAMPORTS_PER_SOL);
                    }


                    // fetch whitelist token balance
                    if (cndy.state.whitelistMintSettings) {
                        setWhitelistEnabled(true);
                        setIsBurnToken(cndy.state.whitelistMintSettings.mode.burnEveryTime);
                        setIsPresale(cndy.state.whitelistMintSettings.presale);
                        setIsWLOnly(!isPresale && cndy.state.whitelistMintSettings.discountPrice === null);

                        if (cndy.state.whitelistMintSettings.discountPrice !== null && cndy.state.whitelistMintSettings.discountPrice !== cndy.state.price) {
                            if (cndy.state.tokenMint) {
                                setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / divider);
                            } else {
                                setWhitelistPrice(cndy.state.whitelistMintSettings.discountPrice?.toNumber() / LAMPORTS_PER_SOL);
                            }
                        }

                        let balance = 0;
                        try {
                            const tokenBalance =
                                await props.connection.getTokenAccountBalance(
                                    (
                                        await getAtaForMint(
                                            cndy.state.whitelistMintSettings.mint,
                                            anchorWallet.publicKey,
                                        )
                                    )[0],
                                );

                            balance = tokenBalance?.value?.uiAmount || 0;
                        } catch (e) {
                            console.error(e);
                            balance = 0;
                        }
                        if (commitment !== "processed") {
                            setWhitelistTokenBalance(balance);
                        }
                        setIsActive(isPresale && !isEnded && balance > 0);

                    } else {
                        setWhitelistEnabled(false);
                    }

                    // end the mint when date is reached
                    if (cndy?.state.endSettings?.endSettingType.date) {
                        setEndDate(toDate(cndy.state.endSettings.number));
                        if (
                            cndy.state.endSettings.number.toNumber() <
                            new Date().getTime() / 1000
                        ) {
                            setIsEnded(true);
                            setIsActive(false);
                        }
                    }
                    // end the mint when amount is reached
                    if (cndy?.state.endSettings?.endSettingType.amount) {
                        let limit = Math.min(
                            cndy.state.endSettings.number.toNumber(),
                            cndy.state.itemsAvailable,
                        );
                        setItemsAvailable(limit);
                        if (cndy.state.itemsRedeemed < limit) {
                            setItemsRemaining(limit - cndy.state.itemsRedeemed);
                        } else {
                            setItemsRemaining(0);
                            cndy.state.isSoldOut = true;
                            setIsEnded(true);
                        }
                    } else {
                        setItemsRemaining(cndy.state.itemsRemaining);
                    }

                    if (cndy.state.isSoldOut) {
                        setIsActive(false);
                    }

                    const [collectionPDA] = await getCollectionPDA(props.candyMachineId);
                    const collectionPDAAccount = await connection.getAccountInfo(
                        collectionPDA,
                    );

                    const txnEstimate =
                        892 +
                        (!!collectionPDAAccount && cndy.state.retainAuthority ? 182 : 0) +
                        (cndy.state.tokenMint ? 66 : 0) +
                        (cndy.state.whitelistMintSettings ? 34 : 0) +
                        (cndy.state.whitelistMintSettings?.mode?.burnEveryTime ? 34 : 0) +
                        (cndy.state.gatekeeper ? 33 : 0) +
                        (cndy.state.gatekeeper?.expireOnUse ? 66 : 0);

                    setNeedTxnSplit(txnEstimate > 1230);
                    if (isActive === true) {
                        setUserWalletOnline(true)
                    }
                } catch (e) {
                    if (e instanceof Error) {
                        if (
                            e.message === `Account does not exist ${props.candyMachineId}`
                        ) {
                            setAlertState({
                                open: true,
                                message: `Couldn't fetch candy machine state from candy machine with address: ${props.candyMachineId}, using rpc: ${props.rpcHost}! You probably typed the REACT_APP_CANDY_MACHINE_ID value in wrong in your .env file, or you are using the wrong RPC!`,
                                severity: 'error',
                                hideDuration: null,
                            });
                        } else if (
                            e.message.startsWith('failed to get info about account')
                        ) {
                            setAlertState({
                                open: true,
                                message: `Couldn't fetch candy machine state with rpc: ${props.rpcHost}! This probably means you have an issue with the REACT_APP_SOLANA_RPC_HOST value in your .env file, or you are not using a custom RPC!`,
                                severity: 'error',
                                hideDuration: null,
                            });
                        }
                    } else {
                        setAlertState({
                            open: true,
                            message: `${e}`,
                            severity: 'error',
                            hideDuration: null,
                        });
                    }
                    console.log(e);
                }
            } else {
                setAlertState({
                    open: true,
                    message: `Your REACT_APP_CANDY_MACHINE_ID value in the .env file doesn't look right! Make sure you enter it in as plain base-58 address!`,
                    severity: 'error',
                    hideDuration: null,
                });
            }
        },
        [anchorWallet, props.candyMachineId, props.rpcHost, isEnded, isPresale, props.connection],
    );

    const renderGoLiveDateCounter = ({days, hours, minutes, seconds}: any) => {
        return (
            <div className="countdown-inner">
                <div className="days">
                    <span>{days}</span><span>d</span>
                </div>
                <div className="hrs">
                    <span>{hours}</span><span>h</span>
                </div>
                <div className="min">
                    <span>{minutes}</span><span>min</span>
                </div>
                <div className="secs">
                    <span>{seconds}</span><span>secs</span>
                </div>
            </div>

            // <div><Card elevation={1}><h1>{days}</h1>Days</Card><Card elevation={1}><h1>{hours}</h1>
            //     Hours</Card><Card elevation={1}><h1>{minutes}</h1>Mins</Card><Card elevation={1}>
            //     <h1>{seconds}</h1>Secs</Card></div>
        );
    };

    const renderEndDateCounter = ({days, hours, minutes, seconds}: any) => {
        // let label = "";
        // if (days > 0) {
        //     label += days + " days "
        // }
        // if (hours > 0) {
        //     label += hours + " hours "
        // }
        // label += (minutes + 1) + " minutes left to MINT."
        //let hourData = days*24+hours
        return (
            <div className="countdown-inner">
                <div className="days" tooltip-title="DAY">
                    <span tooltip-title="Days">{days}</span><span>d</span>
                </div>
                <div className="hrs">
                    <span tooltip-title="Hours">{hours}</span><span>h</span>
                </div>
                <div className="min">
                    <span tooltip-title="Minutes">{minutes}</span><span>min</span>
                </div>
                <div className="secs">
                    <span tooltip-title="Seconds">{seconds}</span><span>secs</span>
                </div>
            </div>
        )
        // return (
        //     <div><h3>{label}</h3></div>
        // );
    };

    function displaySuccess(mintPublicKey: any, qty: number = 1): void {
        let remaining = itemsRemaining - qty;
        setItemsRemaining(remaining);
        setIsSoldOut(remaining === 0);
        if (isBurnToken && whitelistTokenBalance && whitelistTokenBalance > 0) {
            let balance = whitelistTokenBalance - qty;
            setWhitelistTokenBalance(balance);
            setIsActive(isPresale && !isEnded && balance > 0);
        }
        setSetupTxn(undefined);
        setItemsRedeemed(itemsRedeemed + qty);
        if (!payWithSplToken && balance && balance > 0) {
            setBalance(balance - ((whitelistEnabled ? whitelistPrice : price) * qty) - solFeesEstimation);
        }
        setSolanaExplorerLink(cluster === "devnet" || cluster === "testnet"
            ? ("https://solscan.io/token/" + mintPublicKey + "?cluster=" + cluster)
            : ("https://solscan.io/token/" + mintPublicKey));
        setIsMinting(false);
        throwConfetti();
    };

    function throwConfetti(): void {
        console.log('vao day')
        setModalShow(true);
        setMintSuccess(true);
        // confetti({
        //     particleCount: 400,
        //     spread: 70,
        //     origin: {y: 0.6},
        // });
    }

    const onMint = async (
        beforeTransactions: Transaction[] = [],
        afterTransactions: Transaction[] = [],
    ) => {
        try {
            if (wallet.connected && candyMachine?.program && wallet.publicKey) {
                const balanceWallet = await props.connection.getBalance(anchorWallet!.publicKey);
                let ballancePrice = balanceWallet / LAMPORTS_PER_SOL
                let errNotMoney = false
                if (ballancePrice >= 0 && whitelistEnabled === true ) {
                    if(ballancePrice >= 0 && ballancePrice < whitelistPrice && whitelistPrice > 0) {
                        errNotMoney = true
                    } else {
                        if (ballancePrice < price) {
                            errNotMoney = true
                        }
                    }
                }
                if (ballancePrice >= 0 && whitelistEnabled === false && ballancePrice < price) {
                    errNotMoney = true
                }
                if (errNotMoney === true) {

                    setModalShowAlert(true)
                } else {
                    setModalShow(true)
                    setIsMinting(true);
                    setMintSuccess(false);
                    let setupMint: SetupState | undefined;
                    if (needTxnSplit && setupTxn === undefined) {
                        setAlertState({
                            open: true,
                            message: 'Please validate account setup transaction',
                            severity: 'info',
                        });
                        setupMint = await createAccountsForMint(
                            candyMachine,
                            wallet.publicKey,
                        );
                        let status: any = {err: true};
                        if (setupMint.transaction) {
                            status = await awaitTransactionSignatureConfirmation(
                                setupMint.transaction,
                                props.txTimeout,
                                props.connection,
                                true,
                            );
                        }
                        if (status && !status.err) {
                            setSetupTxn(setupMint);
                            setAlertState({
                                open: true,
                                message:
                                    'Setup transaction succeeded! You can now validate mint transaction',
                                severity: 'info',
                            });
                        } else {
                            // setAlertState({
                            //     open: true,
                            //     message: 'Mint failed! Please try again!',
                            //     severity: 'error',
                            // });
                            setModalShow(false)
                            setShowErr(true)
                            return;
                        }
                    }

                    const setupState = setupMint ?? setupTxn;
                    const mint = setupState?.mint ?? anchor.web3.Keypair.generate();
                    let mintResult = await mintOneToken(
                        candyMachine,
                        wallet.publicKey,
                        mint,
                        beforeTransactions,
                        afterTransactions,
                        setupState,
                    );

                    let status: any = {err: true};
                    let metadataStatus = null;
                    if (mintResult) {
                        status = await awaitTransactionSignatureConfirmation(
                            mintResult.mintTxId,
                            props.txTimeout,
                            props.connection,
                            true,
                        );

                        metadataStatus =
                            await candyMachine.program.provider.connection.getAccountInfo(
                                mintResult.metadataKey,
                                'processed',
                            );
                        console.log('Metadata status: ', !!metadataStatus);
                    }

                    if (status && !status.err && metadataStatus) {
                        setModalShow(true);
                        // setMintSuccess(false);
                        // setAlertState({
                        //     open: true,
                        //     message: 'Congratulations! Mint succeeded!',
                        //     severity: 'success',
                        // });
                        setMintSuccess(true)
                        // update front-end amounts
                        displaySuccess(mint.publicKey);
                        refreshCandyMachineState('processed');
                    } else if (status && !status.err) {
                        setAlertState({
                            open: true,
                            message:
                                'Mint likely failed! Anti-bot SOL 0.01 fee potentially charged! Check the explorer to confirm the mint failed and if so, make sure you are eligible to mint before trying again.',
                            severity: 'error',
                            hideDuration: 8000,
                        });
                        setShowErr(true)
                        refreshCandyMachineState();
                    } else {
                        // setAlertState({
                        //     open: true,
                        //     message: 'Mint failed! Please try again!',
                        //     severity: 'error',
                        // });
                        setModalShow(false)
                        setShowErr(true)
                        refreshCandyMachineState();
                    }
                    //setModalShow(false)
                }

            }
        } catch (error: any) {
            let message = error.msg || 'Minting failed! Please try again!';
            if (!error.msg) {
                if (!error.message) {
                    message = 'Transaction Timeout! Please try again.';
                } else if (error.message.indexOf('0x138')) {
                } else if (error.message.indexOf('0x137')) {
                    message = `SOLD OUT!`;
                } else if (error.message.indexOf('0x135')) {
                    message = `Insufficient funds to mint. Please fund your wallet.`;
                }
            } else {
                if (error.code === 311) {
                    message = `SOLD OUT!`;
                } else if (error.code === 312) {
                    message = `Minting period hasn't started yet.`;
                }
            }
            //setShowErr(true)

            setAlertState({
                open: true,
                message,
                severity: "error",
            });
            setModalShow(false)
            //setModalShow(false)
        } finally {
            console.log('finally')
            setIsMinting(false);

            //setShowErr(true)
        }
    };

    useEffect(() => {
        (async () => {
            if (anchorWallet) {
                const balance = await props.connection.getBalance(anchorWallet!.publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
            }
        })();
    }, [anchorWallet, props.connection]);

    useEffect(() => {
        refreshCandyMachineState();
    }, [
        anchorWallet,
        props.candyMachineId,
        props.connection,
        isEnded,
        isPresale,
        refreshCandyMachineState
    ]);

    const [fadeIn, setFadeIn] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [mintSuccess, setMintSuccess] = useState(false);
    const [modalShowAlert, setModalShowAlert] = useState(false)
    const [showErr, setShowErr] = useState(false);
    const hideModal = useCallback(() => {
        setFadeIn(false);
        setModalShow(false)
        setModalShowAlert(false)
    }, [setFadeIn]);

    const handleClose = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            hideModal();
        },
        [hideModal]
    );

    const handleClosePurchase = useCallback((event: MouseEvent) => {
        event.preventDefault();
        document.location.reload()
        hideModal();
    }, [hideModal]);

    const handCloseWarning = useCallback(
        (event: MouseEvent) => {
            event.preventDefault()
            setShowErr(false)
        },
        []
    )

    useEffect(() => {
        if (showErr) {
            const timeId = setTimeout(() => {
                setShowErr(false)
            }, TIME_HIDDEN_ERROR)

            return () => {
                clearTimeout(timeId)
            }
        }
    }, [showErr])

    const percentNormal = process.env.REACT_APP_PERCENT_NORMAL;
    const percentGood = process.env.REACT_APP_PERCENT_GOOD;
    const percentRare = process.env.REACT_APP_PERCENT_RARE;
    const percentLegendary = process.env.REACT_APP_PERCENT_LEGENDARY;
    const percentEpic = process.env.REACT_APP_PERCENT_EPIC;
    const whiteListDate = process.env.REACT_APP_WHITELIST_DEFAULT;
    const airDropDate = process.env.REACT_APP_AIRDROP_DEFAULT;
    const whiteListEndDate = process.env.REACT_APP_WHITELIST_END_DEFAULT;
    const airDropEndDate = process.env.REACT_APP_AIRDROP_END_DEFAULT;
    const goliveEndDate = process.env.REACT_APP_GOLIVE_END_DEFAULT;
    const goLiveDate = process.env.REACT_APP_GOLIVE_DEFAULT;
    const checkDateCurrent = (new Date(goLiveDate!) > new Date()) ? true : false;
    const checkWhiteListDate = ((new Date(whiteListDate!) > new Date()) || new Date() > new Date(whiteListDate!) && new Date() <  new Date(whiteListEndDate!)) ? true : false;
    const checkAirDropDate = (new Date(airDropDate!) > new Date() || new Date() > new Date(airDropDate!) && new Date() <  new Date(airDropEndDate!)) ? true : false
    const checkGoliveDate = (new Date(goLiveDate!) > new Date() || new Date() > new Date(goLiveDate!) && new Date() <  new Date(goliveEndDate!)) ? true : false
    // const activeDateWhiteList =  (new Date() > new Date(whiteListDate!) && new Date() <  new Date(whiteListEndDate!)) ? true : false;
    // const activeDateAirDrop =  (new Date() > new Date(airDropDate!) && new Date() <  new Date(airDropEndDate!)) ? true : false;
    const refToolTipAirBox = useRef(null);
    const percentageMint = Math.round((infoCandyMachine.itemsRedeemed/infoCandyMachine.itemsAvailable)*100);
    const [listImage, setListImage] = useState([
        'https://global-cdn.x3english.com/GOGA%20App/Image/220711-Box-GOGA/GOGA-Box-BG-JPG/01-normal.jpg',
        'https://global-cdn.x3english.com/GOGA%20App/Image/220711-Box-GOGA/GOGA-Box-BG-JPG/02-good.jpg',
        'https://global-cdn.x3english.com/GOGA%20App/Image/220711-Box-GOGA/GOGA-Box-BG-JPG/03-rare.jpg',
        'https://global-cdn.x3english.com/GOGA%20App/Image/220711-Box-GOGA/GOGA-Box-BG-JPG/04-epic.jpg',
        'https://global-cdn.x3english.com/GOGA%20App/Image/220711-Box-GOGA/GOGA-Box-BG-JPG/05-legendary.jpg',
    ]);
    const [imageBox, setImageBox] = useState('https://global-cdn.x3english.com/GOGA%20App/Image/220711-Box-GOGA/GOGA-Box-BG-JPG/01-normal.jpg')
    useEffect(() => {
        const timer = window.setInterval(() => {
            let findIndex = listImage.findIndex((item) => item === imageBox)
            let numberIndex = (findIndex >= 4) ? 0 : findIndex +1
            setImageBox(listImage[numberIndex])
        }, 500);
        return () => {
            window.clearInterval(timer);
        };
    }, [imageBox]);
    const [toolTipWhiteList, setToolWhiteList] = useState(false)
    const [infoNumbMint, setInfoNumbMint] = useState({
        airdrop:  process.env.REACT_APP_NUMB_AIRDROP,
        mint: process.env.REACT_APP_NUMB_MINT,
        whitelist: process.env.REACT_APP_NUMB_WHITELIST,
    })
    const priceWhiteList = process.env.REACT_APP_PRICE_WHITELIST
    const formatDate = function(dataDate:any) {
        const date = new Date(dataDate);
        const month = (date.getMonth()+1 < 10) ? `0${date.getMonth()+1}`: date.getMonth()+1;
        const hours = (date.getHours() < 10) ? `0${date.getHours()}` : date.getHours();
        const minutes = (date.getMinutes() < 10) ? `0${date.getMinutes()}`: date.getMinutes();
        return date.getDate()  + "-" + month + "-" + date.getFullYear() + " " +
            hours + ":" + minutes;
    }
    const formatStringStart = function(status:boolean) {
        return (status===true) ? 'starts' : 'started '
    }
    const formatStringEnd = function(status:boolean) {
        return (status===true) ? 'ends' : 'ended '
    }
    //console.log(new Date(infoCandyMachine.goLiveDate).toString())
    return (
        <main id="main">
            <div id="content" role="main" className="content-area" style={{maxWidth: "fit-content"}}>
                <div className="container">
                    <div className="mint row justify-content-between py-4">
                        <div className="col-lg-6 text-center">
                            <div className="box-image mb-3">
                                <img src={headingImg} alt="heading" />
                            </div>

                            <h4 className="fw-bold text-success">Drop rate GOGA box</h4>
                            <ul className="list-inline">
                                <li>{percentNormal}% Normal box</li>
                                <li>{percentGood}% Good box</li>
                                <li>{percentRare}% Rare box</li>
                                <li>{percentEpic}% Epic box</li>
                                <li>{percentLegendary}% Legendary box</li>
                            </ul>

                            <div className="mint-boxs">
                                <OverlayTrigger placement="top"  overlay={
                                    <div
                                        {...props}
                                        style={{
                                            position: 'absolute',
                                            backgroundColor: '#3A589D',
                                            padding: '5px 15px',
                                            color: 'white',
                                            borderRadius: 3,
                                            width: '400px'
                                        }}
                                    >
                                        The "Whitelist A" Stage of the launch {formatStringStart(checkWhiteListDate) } at {formatDate(whiteListDate)} and {formatStringEnd(checkWhiteListDate) } at {formatDate(whiteListEndDate)}. <br/>This stage was private.
                                    </div>
                                }>
                                <div className={`mint-box mint-box-whitelist ${new Date() > new Date(whiteListDate!) && new Date() <  new Date(whiteListEndDate!) ? 'active' : ''}  row`}>
                                    <div className="col-6 col-lg-5">
                                        <h3>Whitelist A</h3>
                                        <div className="meta">
                                            <span className="items">Items {infoNumbMint.whitelist}</span>
                                            <span className="price">
                                                <span>Price</span>
                                                <strong>{priceWhiteList}</strong>
                                                <span className="icon-currency solana"></span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6 col-lg-7">
                                        {checkWhiteListDate === true &&
                                        <div className="wrap-countdown"
                                             onMouseEnter={() => setToolWhiteList(true)}
                                             onMouseLeave={() => setToolWhiteList(false)}
                                        >
                                            <h3 className="text-success">
                                                {
                                                    new Date() > new Date(whiteListDate!) && new Date() <  new Date(whiteListEndDate!)
                                                        ?
                                                        <strong>Ends in</strong>
                                                        :
                                                        <strong>Starts in</strong>
                                                }
                                            </h3>

                                                <div className="countdown">
                                                    <Countdown
                                                        date={new Date() > new Date(whiteListDate!) && new Date() <  new Date(whiteListEndDate!) ? new Date(whiteListEndDate!) : new Date(whiteListDate!)}
                                                        onMount={(completed) => { }}
                                                        onComplete={() => {}}
                                                        renderer={renderEndDateCounter}
                                                    />
                                                </div>

                                        </div>
                                        }
                                        { checkWhiteListDate === false &&
                                        <h3 className="text-right" style={{ textAlign: "right" }}><strong>Ended</strong></h3>
                                        }
                                    </div>
                                </div>
                                </OverlayTrigger>
                                <OverlayTrigger placement="top"   overlay={
                                    <div
                                        {...props}
                                        style={{
                                            position: 'absolute',
                                            backgroundColor: '#3A589D',
                                            padding: '5px 15px',
                                            color: 'white',
                                            borderRadius: 3,
                                            width: '400px'
                                        }}
                                    >
                                        The "Whitelist B" Stage of the launch {formatStringStart(checkAirDropDate)} at {formatDate(airDropDate!)} and {formatStringEnd(checkAirDropDate)} at {formatDate(airDropEndDate!)}. This stage was private.
                                    </div>
                                }>
                                <div className={`mint-box mint-box-whitelist ${new Date() > new Date(airDropDate!) && new Date() <  new Date(airDropEndDate!) ? 'active' : ''}  row`}>
                                    <div className="col-6 col-lg-5">
                                        <h3>Whitelist B </h3>
                                        <div className="meta">
                                            <span className="items">Items {infoNumbMint.airdrop}</span>
                                            <span className="price">
                                                <span>Price</span>
                                                <strong>{priceWhiteList}</strong>
                                                <span className="icon-currency solana"></span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6 col-lg-7">
                                        {checkAirDropDate === true &&
                                        <div className="wrap-countdown" style={{    position: "relative"}}  >
                                            <h3 className="text-success" ref={refToolTipAirBox}>
                                                {
                                                    new Date() > new Date(airDropDate!) && new Date() <  new Date(airDropEndDate!)
                                                        ?
                                                        <strong>Ends in</strong>
                                                        :
                                                        <strong>Starts in</strong>
                                                }
                                            </h3>

                                                <div className="countdown">
                                                    <Countdown
                                                        date={new Date() > new Date(airDropDate!) && new Date() <  new Date(airDropEndDate!) ? new Date(airDropEndDate!) : new Date(airDropDate!)}
                                                        onMount={(completed) => { }}
                                                        onComplete={() => {}}
                                                        renderer={renderEndDateCounter}
                                                    />
                                                </div>

                                        </div>
                                        }
                                        { checkAirDropDate === false &&
                                        <h3 className="text-right" style={{ textAlign: "right" }}><strong>Ended</strong></h3>
                                        }
                                    </div>
                                </div>
                                </OverlayTrigger>
                                {/*<OverlayTrigger placement="top"   overlay={*/}
                                {/*    <div*/}
                                {/*        {...props}*/}
                                {/*        style={{*/}
                                {/*            position: 'absolute',*/}
                                {/*            backgroundColor: '#3A589D',*/}
                                {/*            padding: '5px 15px',*/}
                                {/*            color: 'white',*/}
                                {/*            borderRadius: 3,*/}
                                {/*            width: '400px'*/}
                                {/*        }}*/}
                                {/*    >*/}
                                {/*        The "Public" Stage of the launch {formatStringStart(checkGoliveDate)} at {formatDate(goLiveDate!)} and {formatStringEnd(checkGoliveDate)} at {formatDate(goliveEndDate)}. This stage was private.*/}
                                {/*    </div>*/}
                                {/*}>*/}
                                {/*<div className={`mint-box mint-box-whitelist ${new Date() > new Date(goLiveDate!) && new Date() <  new Date(goliveEndDate!) ? 'active' : ''}  row`}>*/}
                                {/*    <div className="col-6 col-lg-5">*/}
                                {/*        <h3>Public </h3>*/}
                                {/*        <div className="meta">*/}
                                {/*            <span className="items"></span>*/}
                                {/*            <span className="price">*/}
                                {/*                <span>Price</span>*/}
                                {/*                <strong>{infoCandyMachine.price}</strong>*/}
                                {/*            <span*/}
                                {/*                className="icon-currency solana"></span></span>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*    <div className="col-6 col-lg-7">*/}
                                {/*        {  checkGoliveDate === true &&*/}
                                {/*        <div className="wrap-countdown">*/}
                                {/*            <h3 className="text-success">*/}
                                {/*                {*/}
                                {/*                    new Date() > new Date(goLiveDate!) && new Date() <  new Date(goliveEndDate!)*/}
                                {/*                        ?*/}
                                {/*                        <strong>Ends in</strong>*/}
                                {/*                        :*/}
                                {/*                        <strong>Starts in</strong>*/}
                                {/*                }*/}
                                {/*            </h3>*/}

                                {/*                <div className="countdown"*/}
                                {/*                     data-bs-toggle="tooltip"*/}
                                {/*                >*/}
                                {/*                    <Countdown*/}
                                {/*                        date={new Date() > new Date(goLiveDate!) && new Date() <  new Date(goliveEndDate!) ? new Date(goliveEndDate!) : new Date(goLiveDate!)}*/}
                                {/*                        //date={new Date(infoCandyMachine.goLiveDate)}*/}
                                {/*                        onMount={(completed) => { }}*/}
                                {/*                        onComplete={() => {}}*/}
                                {/*                        renderer={renderEndDateCounter}*/}
                                {/*                    />*/}
                                {/*                </div>*/}

                                {/*        </div>*/}
                                {/*        }*/}
                                {/*        { checkGoliveDate === false &&*/}
                                {/*        <h3 className="text-right" style={{ textAlign: "right" }}><strong>Ended</strong></h3>*/}
                                {/*        }*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                                {/*</OverlayTrigger>*/}
                            </div>

                        </div>
                        <div className="col-lg-6">
                            <div className="box-images box-image text-center px-5 mb-4">
                                <img src={imageBox} className="active" alt="" />
                                {/*<img src={Good} alt="" />*/}
                                {/*<img src={Legendary} alt="" />*/}
                                {/*<img src={Normal} alt="" />*/}
                                {/*<img src={Rare} alt="" />*/}
                            </div>

                            <div className="mint-box row">
                                <div className="col-12 col-lg-5 left-action">
                                    {((!anchorWallet && userWalletOnline === false && checkDateCurrent === false) || (wallet.wallet === null)) &&
                                    <WalletMultiButton className="btn btn-warning btn-style1 text-primary btn-big fluid" isButton={true} style={{height: "57px", fontSize: "19px", padding: "0px"}} >Connect Wallet</WalletMultiButton>
                                    }
                                    {candyMachine && anchorWallet &&
                                    <MintButton
                                        candyMachine={candyMachine}
                                        isMinting={isMinting}
                                        isActive={isActive}
                                        isEnded={isEnded}
                                        isSoldOut={isSoldOut}
                                        onMint={onMint}
                                        whitelistEnabled={whitelistEnabled}
                                        whitelistPrice={whitelistPrice}
                                        className={ (isActive) ? "btn btn-warning btn-style1 text-primary btn-big fluid" : "btn btn-light btn-style1 text-primary btn-big fluid"}
                                    />
                                    }
                                </div>
                                <div className="col-12 col-lg-7 ">
                                    <div className="justify-content-between mb-4">
                                        <h3><strong>Total minted</strong></h3>
                                        <span className="count">{infoCandyMachine.itemsRedeemed}/{infoCandyMachine.itemsAvailable}</span>
                                    </div>
                                    <div className="meter">
                                        <span style={{ width: percentageMint+"%" }}></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{display:"none"}}>
                {wallet && isActive && endDate && Date.now() < endDate.getTime() &&
                <Countdown
                    date={toDate(candyMachine?.state?.endSettings?.number)}
                    onMount={({completed}) => completed && setIsEnded(true)}
                    onComplete={() => {
                        setIsEnded(true);
                    }}
                    renderer={renderEndDateCounter}
                />}
                {!isActive && !isEnded && candyMachine?.state.goLiveDate && (!isWLOnly || whitelistTokenBalance > 0) &&
                <Countdown
                    date={toDate(candyMachine?.state.goLiveDate)}
                    onMount={({completed}) => {
                        console.log('onMount')
                        completed && setIsActive(!isEnded)
                    }}
                    onComplete={() => {
                        console.log('complete')
                        setIsActive(!isEnded);
                    }}
                    renderer={renderGoLiveDateCounter}
                />
                }
            </div>
            <Snackbar
                open={alertState.open}
                autoHideDuration={6000}
                onClose={() => setAlertState({...alertState, open: false})}
            >
                <Alert
                    onClose={() => setAlertState({...alertState, open: false})}
                    severity={alertState.severity}
                >
                    {alertState.message}
                </Alert>
            </Snackbar>
            <Modal show={modalShow} id="alert-processing-gpurchase" className="modal modal-alert" role="dialog" centered >
                <Modal.Body>
                    <a href="#" onClick={handleClosePurchase} className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </a>
                    {mintSuccess === false &&
                    <div className="text-center">
                        <div className="box-image mb-4">
                            <img src={processingGift} width="150" alt="processing"/>
                        </div>
                        <h3 style={{color: '#fff'}}>Processing purchase</h3>
                    </div>
                    }
                    {mintSuccess === true &&
                    <div className="text-center">
                        <div className="box-image mb-4">
                            <img src={successfully} width="150" alt="successfully"/>
                        </div>
                        <h3 style={{color: '#fff'}}>Purchase successfully </h3>
                    </div>
                    }
                </Modal.Body>
            </Modal>

            <Modal show={modalShowAlert} id="alert-not-enough" className="modal modal-alert" tabIndex="-1" role="dialog">
                <Modal.Body>
                    <a href="#"  onClick={handleClose} className="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </a>
                    <div className="text-center">
                        <div className="box-image mb-5">
                            <div className="not-enough"><img src={solanaImageModal} width="130" alt="solana"/>
                            </div>

                        </div>
                        <h3 style={{color: '#fff', fontWeight: 'bold'}}>
                            {
                                (whitelistEnabled === true && whitelistTokenBalance > 0 )  ?
                                    `Not enough ${whitelistPrice}`
                                    :
                                    `Not enough ${price}`
                            }
                            <img className="icon-coin" src={solanaImage} width="36"  alt="solana"/>
                        </h3>
                        <p className="mb-0">to buy GOGA Box</p>
                    </div>
                </Modal.Body>
            </Modal>
            {showErr === true &&
            <div className="alert alert-light alert-popup icon-left show" role="alert" style={{position: "absolute", top: "20px"}}>
                <a href="#" onClick={handCloseWarning} className="close" data-dismiss="alert-popup" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </a>
                <img className="icon" src={warningImage} alt="warning" /> You have rejected the transaction
            </div>
            }
        </main>
    );
};

export default MintGoga;
