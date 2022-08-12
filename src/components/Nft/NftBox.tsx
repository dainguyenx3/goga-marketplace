
import { Nft } from '@liqnft/candy-shop-types';
import { NftAttributesData, NftAttributesFormat } from '../Order/OrderDetail';
import imageSolana from '../../img/price/solana2.png';
import { useProfile } from '../../hooks/useProfile'
import { REGEX_IMAGE } from '../../constant';

interface NftBoxProps {
    nft: Nft;
    nftAttributes: NftAttributesFormat;
    handleOpenModal: () => void;
    price?: number;
    handleOpenModalTransfer: () => void
}

const NftBox = ({ nft, nftAttributes, handleOpenModal, price, handleOpenModalTransfer }: NftBoxProps) => {
    const { profile } = useProfile();
    return (
        <>
            <div className="row justify-content-center">
                <div className={`space-between col-lg-8 mb-3 ${nftAttributes && nftAttributes['quality']?.toLowerCase()}`}>
                    <div className="code"><span>{nft?.name?.split('#')[1] && ("#" + nft?.name?.split('#')[1])}</span></div>
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
                        <img style={{minHeight: '186px'}} src={nft?.image?.replace(REGEX_IMAGE, '.png')} alt="box" />
                    </div>
                </div>
            </div>

            <div className="row justify-content-center mb-4">
                <div className="col-lg-6">
                    <button onClick={handleOpenModalTransfer} disabled={price || !profile?.linked ? true: false} className={`btn ${price || !profile?.linked ? 'btn-disable' : 'btn-success'} fluid btn-lg mb-3`}>Transfer</button>
                    <div className='row items-center'>
                        {price && (
                            <div className="col-5">
                                <div className="price"><img src={imageSolana} alt="solana" /> <span style={{ fontWeight: 'bold'}}>{price}</span></div>  
                            </div>
                        )}
                           
                        <div className={`col${price && '-7'}`}>
                            <button className="btn btn-warning fluid btn-lg mb-3" onClick={handleOpenModal}>{price ? 'Cancel Selling' : 'Sell'}</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NftBox;