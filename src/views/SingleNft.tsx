import { useParams } from 'react-router-dom';
import { useEffect, useRef, useCallback, useState } from 'react';
import { web3 } from '@project-serum/anchor';
import { PublicKey, Cluster } from '@solana/web3.js';
import {
    Order as OrderSchema,
    WhitelistNft,
    ListBase,
    CandyShop as CandyShopResponse,
    SingleBase,
    Nft
} from '@liqnft/candy-shop-types';
import {
    CacheNFTParam,
    CandyShop,
    FetchNFTBatchParam,
    fetchNftsFromWallet,
    fetchShopByShopAddress,
    SingleTokenInfo,
    fetchNFTByMintAddress,
} from '@liqnft/candy-shop-sdk';
import { useWallet, useAnchorWallet } from '@solana/wallet-adapter-react'
import NftDetail from '../components/Nft/NftDetail';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { NftAttributesFormat, NftAttributesData } from '../components/Order/OrderDetail';
import { useProfile } from '../hooks/useProfile'
import { useConfig } from '../hooks/useConfig'
import { getCurrency, getBalanceIngame, CurrencyBalance } from '../api'
import { candyShop } from '../utils/candy-shop';
import Loading from '../components/LoadingSkeleton/Loading'

const SingleNft = () =>  {
    const {mintAddress, tokenAddress} = useParams();
    const navigate = useNavigate();
    const [nft, setNft] = useState<Nft>();
    const {publicKey} = useWallet();
    const [attributes, setAttributes] = useState<NftAttributesFormat>()
    const [shop, setShop] = useState<CandyShopResponse>()
    const {profile} = useProfile();
    const config = useConfig();
    const [currencyBalance, setCurrencyBalance] = useState<CurrencyBalance>()
    const wallet = useAnchorWallet()
    const [loading, setLoading] = useState<boolean>(false);

    const firstBatchNFTLoaded = useRef<boolean>(false);

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
      let findNft = batchNFTs.find(item => item.tokenMintAddress === mintAddress);
      if(findNft) {
        setNft({
          mint: findNft.tokenMintAddress,
          nftUri: findNft.metadata?.data.uri,
          name: findNft.metadata?.data.name!,
          symbol: findNft.metadata?.data.symbol!,
          description: findNft.nftDescription,
          sellerFeeBasisPoint: findNft.metadata?.data.sellerFeeBasisPoints!,
          image: findNft.nftImage
        })
      }
    }, [mintAddress]);
  
  
    const progressiveLoadUserNFTs = useCallback(
      async (walletPublicKey: web3.PublicKey) => {
        const identifiers = await getShopIdentifiers();
        const fetchBatchParam: FetchNFTBatchParam = {
          batchCallback: getUserNFTFromBatch,
          batchSize: 8
        };
        const cacheNFTParam: CacheNFTParam = {
          enable: true
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
      [candyShop, getShopIdentifiers, getUserNFTFromBatch, ]
    );

    useEffect(() => {
        (async () => {
            if(mintAddress && wallet?.publicKey) {
                setLoading(true);
                const responnse = await fetchNFTByMintAddress(mintAddress);
                if(responnse) {
                  setNft(responnse)
                } else {
                  await progressiveLoadUserNFTs(wallet?.publicKey)
                }
                setLoading(false);
            }
        })()
    }, [mintAddress, wallet?.publicKey])
    useEffect(() => {
        if(nft?.nftUri) {
            axios.get(nft?.nftUri).then(res =>  {
                if(res.data.attributes) {
                    let mapAttributes: NftAttributesFormat = {};
                    res.data.attributes.forEach((item: NftAttributesData) => {
                    mapAttributes[item.trait_type.toLowerCase()] = item.value;
                    })
                    setAttributes(mapAttributes)
                }
            })
        }
    }, [nft?.nftUri])

    useEffect(() => {
        (async () => {
            if(profile) {
              const response = await getCurrency().catch(e => { console.log('Error', e) })
              if(response) {
                const currencyBalanceData = response.find(item => item.currency === config.nftWithdrawCurrency);
                if(currencyBalanceData) {
                  setCurrencyBalance(currencyBalanceData)
                }
              }
            }
        })()
      }, [profile?.email])

    return (
      <>
      {loading ? <Loading /> : 
      <NftDetail
            nft={nft!}
            onBack={() => navigate(-1)}
            attributes={attributes!}
            candyShop={candyShop}
            shop={shop!}
            currency_info={currencyBalance}
            wallet={wallet}
            tokenAddress={tokenAddress!}
        />}
      </>
        
    )
}


export default SingleNft;