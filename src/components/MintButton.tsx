import {useEffect, useState} from 'react';
import {CircularProgress} from '@material-ui/core';
import {GatewayStatus, useGateway} from '@civic/solana-gateway-react';
import {CandyMachineAccount} from '../utils/goga/candy-machine';


export const MintButton = ({
  onMint,
  candyMachine,
  isMinting,
  isEnded,
  isActive,
  isSoldOut
} : {
  onMint: () => Promise<void>;
  candyMachine: CandyMachineAccount | undefined;
  isMinting: boolean;
  isEnded: boolean;
  isActive: boolean;
  isSoldOut: boolean;
}) => {
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

  return (
    <button
      className='btn btn-warning btn-style1 btn-purchase btn-big fluid'
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
            "MINT"
          )
      ) : isEnded ? "ENDED" : (candyMachine?.state.goLiveDate ? (
        "SOON"
      ) : (
        "UNAVAILABLE"
      ))}
    </button>
  );
};
