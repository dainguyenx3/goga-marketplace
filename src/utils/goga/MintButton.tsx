import styled from 'styled-components';
import React, {useContext, useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import {CircularProgress} from '@material-ui/core';
import {GatewayStatus, useGateway} from '@civic/solana-gateway-react';
import {CandyMachineAccount} from './candy-machine';
import Countdown from "react-countdown";


export const CTAButton = styled(Button)`
  display: block !important;
  margin: 0 auto !important;
  background-color: var(--title-text-color) !important;
  min-width: 120px !important;
  font-size: 1em !important;
`;

export const MintButton = ({
                               onMint,
                               candyMachine,
                               isMinting,
                               isEnded,
                               isActive,
                               isSoldOut,
                               className,
                               whitelistEnabled,
                               whitelistPrice,
                               isClaim
                           }: {
    onMint: () => Promise<void>;
    candyMachine?: CandyMachineAccount;
    isMinting: boolean;
    isEnded: boolean;
    isActive: boolean;
    isSoldOut: boolean;
    className?: string;
    whitelistEnabled?: boolean,
    whitelistPrice?: number,
    isClaim?: boolean
}) => {
    //const infoCandyMachine = useContext(InfoCandyMachine);
    const {requestGatewayToken, gatewayStatus} = useGateway();
    const [clicked, setClicked] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    useEffect(() => {
        setIsVerifying(false);
        if (gatewayStatus === GatewayStatus.COLLECTING_USER_INFORMATION && clicked) {
            // when user approves wallet verification txn
            setIsVerifying(true);
        } else if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
            console.log('Verified human, now minting...');
            onMint();
            setClicked(false);
        }
    }, [gatewayStatus, clicked, setClicked, onMint]);
    const [isAirDrop, setIsAirDrop] = useState(false)
    const [dataDate, setDataDate] = useState<any>('');
    const [isEndMint, setisEndMint] = useState(false);

    useEffect(() => {
        const whiteListDate = process.env.REACT_APP_WHITELIST_DEFAULT;
        const whiteListEndDate = process.env.REACT_APP_WHITELIST_DEFAULT;
        const airDropDate = process.env.REACT_APP_AIRDROP_DEFAULT;
        const airDropEndDate = process.env.REACT_APP_AIRDROP_END_DEFAULT;
        const endMint = process.env.REACT_APP_GOLIVE_END_DEFAULT
        const goLiveDate = process.env.REACT_APP_GOLIVE_DEFAULT
        if (new Date() < new Date(whiteListDate!)) {
            setDataDate(goLiveDate!)
        } else {
            if ((new Date() > new Date(airDropDate!)  &&  new Date() < new Date(airDropEndDate!) && isActive===false ) || (new Date() > new Date(whiteListDate!)  &&  new Date() < new Date(whiteListEndDate!) && isActive===false )) {
                setDataDate(goLiveDate!)
            } else {
                if (isActive === false && new Date() < new Date(goLiveDate!)) {
                    setDataDate(goLiveDate!)
                } else {
                    setDataDate('')
                }
            }
        }

        // if (new Date() < new Date(airDropDate!)) {
        //     setDataDate(infoCandyMachine.goLiveDate)
        // }
        if (new Date() >= new Date(airDropDate!) && new Date() <= new Date(airDropEndDate!)) {
            setIsAirDrop(true);
        }
        if (new Date() > new Date(endMint!)) {
            setisEndMint(true);
        }
        // if (infoCandyMachine.itemsAvailable === infoCandyMachine.itemsRedeemed) {
        //     setisEndMint(true);
        // }
    }, [isActive]);
    const renderDate = ({days, hours, minutes, seconds}: any) => {
        return (
            <div className="countdown-inner">
                <div className="days" style={{marginRight: '4px'}}>
                    <span>{days}</span><span>d</span>
                </div>
                <div className="hrs" style={{marginRight: '4px'}}>
                    <span>{hours}</span><span>h</span>
                </div>
                <div className="min" style={{marginRight: '4px'}}>
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

    return  (isEndMint === true) ?
        <button className="button">
            <span>Ended</span>
        </button>
        :
        (dataDate == '') ?
            <button className={className}
                    disabled={
                        clicked ||
                        candyMachine?.state.isSoldOut ||
                        isSoldOut ||
                        isMinting ||
                        isEnded ||
                        !isActive ||
                        isVerifying
                    }
                    onClick={async () => {
                        if (isActive && candyMachine?.state.gatekeeper && gatewayStatus !== GatewayStatus.ACTIVE) {
                            console.log('Requesting gateway token');
                            setClicked(true);
                            await requestGatewayToken();
                        } else {
                            console.log('Minting...');
                            await onMint();
                        }
                    }}
            >
                {!candyMachine ? (
                    "CONNECTING..."
                ) : candyMachine?.state.isSoldOut || isSoldOut ? (
                    'SOLD OUT'
                ) : isActive ? (
                    isVerifying ? 'VERIFYING...' :
                        isMinting || clicked ? (
                            <CircularProgress/>
                        ) : (
                            ( isAirDrop === true) ? "Mint" :  "Mint"
                        )
                ) : isEnded ? "ENDED" : (candyMachine?.state.goLiveDate ? (
                    (isAirDrop === true) ? "Mint" :  "Mint"
                ) : (
                    "UNAVAILABLE"
                ))}
            </button>
            :
            <button className="button">
                <span>You can mint with Token A/B tickets</span>
                {/*<span className={`countdown countdown-text`}>*/}
                {/*    <Countdown*/}
                {/*        date={new Date(dataDate!)}*/}
                {/*        onMount={(completed) => { }}*/}
                {/*        onComplete={() => {}}*/}
                {/*        renderer={renderDate}*/}
                {/*    />*/}
                {/*</span>*/}
            </button>
};
