import { Nft, Order as OrderSchema } from '@liqnft/candy-shop-types';
import { useWallet } from '@solana/wallet-adapter-react';
import imageSolana from '../../img/price/solana2.png';
import { WalletMultiButton } from '../Wallet/WalletMultiButton';
import { REGEX_IMAGE } from '../../constant'
interface NftAttributesFormat {
   [key: string]: string
}

interface BoxProps {
    order: OrderSchema;
    nftAttributes: NftAttributesFormat;
    orderPrice: number;
    handleOpenModal: () => void;
    isUserListing: boolean | undefined
}

const Box = ({ order, nftAttributes, orderPrice, handleOpenModal, isUserListing }: BoxProps) => {
    const { wallet } = useWallet();
    return (
        <>
            <div className="row justify-content-center">
                <div className={`space-between col-lg-8 mb-3 ${nftAttributes && nftAttributes['quality']?.toLowerCase()}`}>
                    <div className="code"><span>{ order?.name?.split('#')[1] && ("#" + order?.name?.split('#')[1]) }</span></div>
                    {nftAttributes && nftAttributes['quality'] && (
                        <div className={`level ${nftAttributes['quality']?.toLowerCase()}`}>
                            <span>{ nftAttributes['quality'] }</span>
                        </div>
                    )}
                    
                </div>
            </div>
            <div className="row justify-content-center mb-3">
                <div className="col-lg-6 mb-5">
                    <div className="box-image text-center">
                        <img src={order?.nftImageLink?.replace(REGEX_IMAGE, '.png')} alt="box" />
                    </div>
                </div>
            </div>
            <div className="row justify-content-center mb-4">
                <div className="col-lg-6">
                    <div className="row items-center">
                        <div className="col-5">
                            <div className="price"><img src={imageSolana} alt="solana" /> <span style={{ fontWeight: 'bold' }}>{ orderPrice }</span></div>  
                        </div>   
                        <div className="col-7">
                            {!wallet ? <WalletMultiButton className='btn btn-warning fluid btn-lg' style={{color: 'black', padding: '37px 5px'}}>Purchase</WalletMultiButton> : (
                                <button onClick={handleOpenModal} className="btn btn-warning fluid btn-lg">{ isUserListing && order && wallet ? 'Cancel Selling' : 'Purchase' }</button>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
            <div className="owner text-center"><span className="text-pink me-3">Owner:</span> <span className="text-light">{ order?.walletAddress?.slice(0, 8) + '...' + order?.walletAddress?.slice(-8) }</span></div>
        </>
    )
}

export default Box;