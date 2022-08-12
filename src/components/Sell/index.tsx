import React, { useEffect, useMemo, useState, useCallback, useRef, useContext } from 'react';
import { web3 } from '@project-serum/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';

import { Nft } from '../Nft';
import { LoadingSkeleton } from '../LoadingSkeleton';

import {
  Order as OrderSchema,
  WhitelistNft,
  ListBase,
  CandyShop as CandyShopResponse,
  SingleBase
} from '@liqnft/candy-shop-types';
import {
  CacheNFTParam,
  CandyShop,
  FetchNFTBatchParam,
  fetchNftsFromWallet,
  fetchShopByShopAddress,
  SingleTokenInfo
} from '@liqnft/candy-shop-sdk';

import { LoadStatus, SellActionsStatus } from '../../constant';
import { useValidateStatus } from '../../hooks/useValidateStatus';
import { useUpdateCandyShopContext } from '../Context';
import imageInventory from '../../img/inventory.png';
import imageIconWallet from '../../img/icon/icon-wallet-disable.png'
import imageIconCopy from '../../img/copy.png'
import imageIconInGame from '../../img/icon/icon-ingame.png';
import imageHelp from '../../img/help.png'
import NftDetail from '../Nft/NftDetail';
import { NftAttributesFormat } from '../Order/OrderDetail';
import { getNftIngame, getBalanceIngame, BalanceIngame, getProfile } from '../../api';
import { NftIngame, NftIngameInfo } from '../Nft/NftIngame';
import { OverlayTrigger, Card, Overlay, Popover } from 'react-bootstrap';
import { useProfile } from '../../hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import NftIngameDetail from '../Nft/NftIngameDetail';
import { ConfigContext } from '../../App';
import { useCurrencyBalance } from '../../hooks/useCurrencyBalance';

const Logger = 'CandyShopUI/Sell';

interface SellProps {
  wallet: AnchorWallet | undefined;
  walletConnectComponent: React.ReactElement;
  candyShop: CandyShop;
  style?: { [key: string]: string | number } | undefined;
  enableCacheNFT?: boolean;
}

/**
 * React component that allows user to put wallet's NFT for sale
 */

interface SelectionState {
  nft: SingleTokenInfo;
  attributes: NftAttributesFormat
}

export const Sell: React.FC<SellProps> = ({ wallet, walletConnectComponent, style, candyShop, enableCacheNFT }) => {
  const [selection, setSelection] = useState<SelectionState>();
  const [nfts, setNfts] = useState<SingleTokenInfo[]>([]);
  const [ingameNfts, setIngameNfts] = useState<NftIngameInfo[]>();
  const [sellOrders, setSellOrders] = useState<OrderSchema[]>();
  const [walletPublicKey, setWalletPublicKey] = useState<web3.PublicKey>();
  const [loadingNFTStatus, setNFTLoadingStatus] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [orderLoading, setOrderLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [shopLoading, setShopLoading] = useState<LoadStatus>(LoadStatus.ToLoad);
  const [loadingDataWallet, setLoadingDataWallet] = useState<boolean>(false);
  const [loadingDataIngame, setLoadingDataIngame] = useState<boolean>(false);
  const [shop, setShop] = useState<CandyShopResponse>();
  const {profile, setProfile} = useProfile();
  const navigate = useNavigate();
  const config = useContext(ConfigContext);
  const currencyBalance = useCurrencyBalance();
  // global array for concat batches.
  const allNFTs = useRef<any>({});
  const firstBatchNFTLoaded = useRef<boolean>(false);
  const sellUpdateStatus = useValidateStatus(SellActionsStatus);
  const [balanceIngame, setBalanceIngame] = useState<BalanceIngame>();
  const target = useRef(null);
  const [show, setShow] = useState<boolean>(false);
  useUpdateCandyShopContext(candyShop.candyShopAddress);

  useEffect(() => {
    (async () => {
        const res = await getProfile();
        setProfile(res?.data)
    })()
  }, [])

  useEffect(() => {
    if (!walletPublicKey) return;
    setShopLoading(LoadStatus.Loading);
    fetchShopByShopAddress(candyShop.candyShopAddress)
      .then((data: SingleBase<CandyShopResponse>) => {
        setShop(data.result);
      })
      .catch((error: any) => {
        console.log(`${Logger}: Sell failed to get shop detail, error=`, error);
      })
      .finally(() => {
        setShopLoading(LoadStatus.Loaded);
      });
  }, [candyShop, walletPublicKey]);


  useEffect(() => {
    if (wallet?.publicKey && candyShop) {
      setWalletPublicKey(wallet.publicKey);
      setNFTLoadingStatus(LoadStatus.ToLoad);
    }
  }, [wallet?.publicKey, sellUpdateStatus, candyShop]);

  useEffect(() => {
    (async () => {
        if(profile && !ingameNfts && !balanceIngame) {
          const response = await Promise.all([fetchNftIngame(), getBalanceIngame()])
          if(response.length > 0) {
            const balanceIngameData = response[1]?.find(item => item.currency === currencyBalance?.currency);
            if(balanceIngameData) setBalanceIngame(balanceIngameData);
          }
        }
    })()
  }, [profile?.email])

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

  const fetchNftIngame = async () => {
    setLoadingDataIngame(true);
    const response = await getNftIngame()
    if(response) {
      setIngameNfts(response);
    }
    setLoadingDataIngame(false);
  }

  const fetchNftWallet = async () => {
    setLoadingDataWallet(true);
    await progressiveLoadUserNFTs(walletPublicKey!)
    setLoadingDataWallet(false)
  }

  const getShopIdentifiers = useCallback(async (): Promise<string[]> => {
    return candyShop
      .shopWlNfts()
      .then((nfts: ListBase<WhitelistNft>) =>
        nfts.result.reduce((arr: string[], item: WhitelistNft) => arr.concat(item.identifier), [])
      );
  }, [candyShop]);

  const getUserNFTFromBatch = useCallback((batchNFTs: SingleTokenInfo[]) => {
    if (!firstBatchNFTLoaded.current) {
      firstBatchNFTLoaded.current = true;
    }
    allNFTs.current = Object.assign(
      allNFTs.current,
      batchNFTs.reduce((acc: any, item: SingleTokenInfo) => {
        acc[item.tokenMintAddress] = item;
        return acc;
      }, {})
    );
    // const userNFTs = allNFTs.current.concat(batchNFTs);
    // allNFTs.current = userNFTs
    
    setNfts(Object.values(allNFTs.current));
  }, []);


  const progressiveLoadUserNFTs = useCallback(
    async (walletPublicKey: web3.PublicKey) => {
      const identifiers = await getShopIdentifiers();
      // Setup the batchCallback to retrieve the batch result.
      const fetchBatchParam: FetchNFTBatchParam = {
        batchCallback: getUserNFTFromBatch,
        batchSize: 8
      };
      // Enable cache nft, store nft token in IDB and get nft token from IDB.
      // CandyShopSDK will always keep up-to-date status from chain in IDB once fetchNFT is called.
      const cacheNFTParam: CacheNFTParam = {
        enable: enableCacheNFT ?? false
      };
      const userNFTs = fetchNftsFromWallet(
        candyShop.connection(),
        walletPublicKey,
        identifiers,
        fetchBatchParam,
        cacheNFTParam
      );
      return userNFTs;
    },
    [candyShop, getShopIdentifiers, getUserNFTFromBatch, enableCacheNFT]
  );



  // fetch current wallet nfts when mount and when publicKey was changed.
  useEffect(() => {
    if (!walletPublicKey || shopLoading !== LoadStatus.Loaded) {
      return;
    }
    if (loadingNFTStatus === LoadStatus.ToLoad) {
      allNFTs.current = [];
      firstBatchNFTLoaded.current = false;
      setNFTLoadingStatus(LoadStatus.Loading);
      progressiveLoadUserNFTs(walletPublicKey)
        .then((allUserNFTs: SingleTokenInfo[]) => {
          console.log(`${Logger}: getUserNFTs success, total amount of user NFTs= ${allUserNFTs.length}`);
        })
        .catch((error: any) => {
          console.log(`${Logger}: getUserNFTs failed, error=`, error);
          firstBatchNFTLoaded.current = true;
        })
        .finally(() => {
          setNFTLoadingStatus(LoadStatus.Loaded);
        });
    }
  }, [candyShop, loadingNFTStatus, walletPublicKey, progressiveLoadUserNFTs, shopLoading]);

  useEffect(() => {
    if (!walletPublicKey) {
      return;
    }
    setOrderLoading(LoadStatus.Loading);
    candyShop
      .activeOrdersByWalletAddress(walletPublicKey.toString())
      .then((sellOrders: OrderSchema[]) => {
        setSellOrders(sellOrders);
      })
      .catch((err: Error) => {
        console.log(`${Logger}: activeOrdersByWalletAddress failed, error=`, err);
      })
      .finally(() => {
        setOrderLoading(LoadStatus.Loaded);
      });
  }, [candyShop, walletPublicKey, sellUpdateStatus]);

  const handleSelection = (nft: SingleTokenInfo, attributes: NftAttributesFormat) => {
    setSelection({nft: nft, attributes: attributes});
  }

  const handleCopy = (e: any) => {
    e.preventDefault()
    navigator.clipboard.writeText(walletPublicKey?.toBase58()!)
    setShow(!show);
  }

  const popover = (
    <Popover>
      <Popover.Body style={{padding: '5px 15px'}}>
        Copied
      </Popover.Body>
    </Popover>
);

  const hashSellOrders: any = useMemo(() => {
    return (
      sellOrders?.reduce((acc: any, item: OrderSchema) => {
        acc[item.tokenMint] = item;
        return acc;
      }, {}) || {}
    );
  }, [sellOrders]);

  if (!wallet) {
    return (
      <div className="candy-container" style={{ textAlign: 'center', minHeight: '445px' }}>
        <div className="box-image mb-4">
          <img src={imageInventory} alt="inventory" />
        </div>
        <h2>Connect Wallet</h2>
        <p className="mb-5">You need connect your wallet first</p>
        {walletConnectComponent}
      </div>
    );
  }

  const loading = loadingDataWallet || !firstBatchNFTLoaded.current || orderLoading !== LoadStatus.Loaded || shopLoading !== LoadStatus.Loaded;
  return (
    <div className="py-5">
      <section className="container">
        <div className="space-between sc-header">
          <div className="title icon"><img className="me-2"  src={imageIconWallet} alt="" /> Wallet</div>
          <div className="user_key">
            <span>{ walletPublicKey?.toBase58().slice(0,8) + '...' + walletPublicKey?.toBase58().slice(-8) }</span>
            <OverlayTrigger show={show} trigger="click" placement="bottom" overlay={popover}>
            <a href="#" ref={target} onClick={handleCopy} className="copy_text" data-bs-toggle="tooltip" data-bs-placement="top" title="Copied"><img src={imageIconCopy} alt="copy" /></a>
            </OverlayTrigger>
          </div>
        </div>
        {loading ? (<div className="row list-character mb-0"><LoadingSkeleton /></div>) : (
          nfts.length > 0 && shop ? (
          <div className="row list-character mb-0">
            {nfts.map((item) => (
              <Nft
                nft={item}
                wallet={wallet}
                sellDetail={hashSellOrders[item.tokenMintAddress]}
                shop={shop}
                candyShop={candyShop}
                key={item.tokenAccountAddress}
                handleSelection={(nft: SingleTokenInfo , attributes: NftAttributesFormat) => handleSelection(nft, attributes)}
                reloadData={fetchNftWallet}
              />
            ))}
          </div>
        ) : (
          <div className="py-5 mb-5">
            <p className="text-center fs-3 fw-bold text-secondary">You don’t have any NFT in Wallet </p>
          </div>
        )
        )}
      </section>
    
      <section className="container">
        <div className="sc-header">
          <div className="title icon">
            <img className="me-2" src={imageIconInGame} alt="" /> 
              Ingame Inventory
              <OverlayTrigger placement="right" overlay={
              (
                <Card body style={{background: '#715AFF', width: '279.63px',marginLeft: '10px', borderRadius: '20px'}}>
                  Only GOGA with 100% battery and not in level up, equip or freezing state can transfer to Wallet
                </Card>
              )
            }>
              <p className="ms-2" style={{marginTop: '15px'}}><img src={imageHelp} alt="" /></p>
            </OverlayTrigger>
          </div>
        </div>
        <div className="row list-character mb-0">
          
          {!profile?.linked ? (
             <div className="py-5 mb-5">
              <p className="text-center mb-5 fs-3 fw-bold text-secondary">You haven’t linked to your in-game account</p>
              <div className="row">
                  <div className="col text-center"><button style={{width: '260px', borderRadius: '20px'}} onClick={() => navigate('/account/link-account')} className="btn btn-warning btn-lg fluid">Link Account</button></div>
              </div>
            </div>
          ) :  ( loadingDataIngame ? (<div className="row list-character mb-0"><LoadingSkeleton /></div>) : ingameNfts && ingameNfts?.length > 0 ? (
            ingameNfts.map(item => (
              <NftIngame 
                nft={item}
                key={item.mintAddress}
                balance={parseFloat(balanceIngame?.availableBalance!)}
                reloadData={fetchNftIngame}
              />
            ))
          ) : (
            <p className="text-center fs-3 fw-bold text-secondary">You don’t have any NFT in Ingame Inventory</p>
          ))}
          
        </div>
      </section>
    </div>
    // <div style={style} className="candy-sell-component">
    //   <div className="candy-container">
    //     {loading && <LoadingSkeleton />}
    //     {!loading && (
    //       <>
    //         {nfts.length > 0 && shop && (
    //           <div className="candy-container-list">
    //             {nfts.map((item) => (
    //               <div key={item.tokenAccountAddress}>
    //                 <Nft
    //                   nft={item}
    //                   wallet={wallet}
    //                   sellDetail={hashSellOrders[item.tokenMintAddress]}
    //                   shop={shop}
    //                   candyShop={candyShop}
    //                 />
    //               </div>
    //             ))}
    //           </div>
    //         )}
    //       </>
    //     )}
    //     {loadingNFTStatus === LoadStatus.Loaded && nfts.length === 0 && <Empty description="No NFTs found" />}
    //   </div>
    // </div>
  );
};