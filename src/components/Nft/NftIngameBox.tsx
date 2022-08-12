import { NftIngameInfo, STATUS_NFT } from './NftIngame'
interface NftBoxProps {
    nft: NftIngameInfo;
    handleOpenModalTransfer: () => void
}

const NftIngameBox = ({ nft, handleOpenModalTransfer }: NftBoxProps) => {
    return (
        <>
            <div className="row justify-content-center">
                <div className={`space-between col-lg-8 mb-3 ${nft.quality}`}>
                    <div className="code"><span>{nft.name?.split('#')[1] && ("#" + nft.name?.split('#')[1])}</span></div>
                    {nft.quality && (
                        <div className={`level ${nft.quality?.toLowerCase()}`}>
                            <span>{ nft.quality }</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="row justify-content-center mb-3">
                <div className="col-lg-6 mb-5">
                    <div className="box-image text-center">
                        <img src={nft?.imageUrl} alt="box" />
                    </div>
                </div>
            </div>

            <div className="row justify-content-center mb-4">
                <div className="col-lg-6">
                    <button disabled={nft.status !== STATUS_NFT['ACTIVE'] ? true : false} onClick={handleOpenModalTransfer} className={`btn ${nft.status !== STATUS_NFT['ACTIVE'] ? 'btn-disable' : 'btn-success'} fluid btn-lg mb-3`}>Transfer</button>
                </div>
            </div>
        </>
    )
}

export default NftIngameBox;