import { Nft } from '@liqnft/candy-shop-types';
import { NftAttributesFormat } from '../Order/OrderDetail';
import imageSolana from '../../img/price/solana2.png';
import { useProfile } from '../../hooks/useProfile';
import { REGEX_IMAGE } from '../../constant'

interface NftTutorBoxProps {
    nft: Nft;
    nftAttributes: NftAttributesFormat;
    handleOpenModal: () => void;
    price?: number;
    handleOpenModalTransfer: () => void
}

const NftTutorBox = ({ nft, nftAttributes, handleOpenModal, price, handleOpenModalTransfer }: NftTutorBoxProps) => {
  const { profile } = useProfile();

    return (
        <div className="row">
        <div className={`col-lg-6 ${nftAttributes['quality']?.toLowerCase()}`}>
            <div className="space-between mb-5">
                <div className="code"><span>{nft?.name?.split('#')[1] && ("#" + nft?.name?.split('#')[1])}</span></div>
                <div className="character_name"><span>Genesis</span></div>
            </div>

            <div className="box-image box-image_character">
                <img src={nft.image?.replace(REGEX_IMAGE, '.png')} alt="" />
            </div>
        </div>
        {
          nftAttributes && (
            <div className="col-lg-6 charactor-info">
              <div className="row mb-4">
                <div className="col-6">
                  <label className="text-pink">GOGA Level</label>
                  <div className="info">Level: { nftAttributes['level'] }</div>
                </div>
                  <div className="col-6">
                    <label className="text-pink">GOGA Quality</label>
                  <div className={`info info-${nftAttributes['quality']?.toLowerCase()}`}>Quality: { nftAttributes['quality'] }</div>
                </div>
              </div>
          <div className="row mb-4">
            <div className="col-6">
              <label className="text-pink">Battery cycle</label>
                  <div className="info">{ ('battery cycle count' in nftAttributes) ? (nftAttributes['battery cycle count'] === 'Unlimited' ? 'Unlimited' : ( 'Times: ' + nftAttributes['battery cycle count'].split('/')[0])) : 'Times: ' }</div>
            </div>
            <div className="col-6">
              <label className="text-pink">Skill Points</label>
              <div className="info">Total: { ('skill points' in  nftAttributes) ? nftAttributes['skill points'] + ' points' : ''} </div>
            </div>
          </div>

          <div className="row table-info mb-4">
            <div className="table-info_row">
                  <p>Intelligence:</p>
                  {
                    ('intelligence base' in nftAttributes) ? <p>{nftAttributes['intelligence base'] + nftAttributes['intelligence added points']} ({nftAttributes['intelligence base']}+<span className="text-pink">{ nftAttributes['intelligence added points']}</span> )</p> : <p></p>
                  }
            </div>
            <div className="table-info_row">
              <p>Agility:</p>
              {
                ('agility base' in nftAttributes) ? <p>{nftAttributes['agility base'] + nftAttributes['agility added points']} ({nftAttributes['agility base']}+<span className="text-pink">{nftAttributes['agility added points']}</span> )</p> : <p></p>
              }
            </div>

            <div className="table-info_row">
              <p>Luck:</p>
              {
                ('luck base' in nftAttributes) ? <p>{nftAttributes['luck base'] + nftAttributes['luck added points']} ({nftAttributes['luck base']}+<span className="text-pink">{nftAttributes['luck added points']}</span> )</p> : <p></p>
              }
            </div>

            <div className="table-info_row">
              <p>Power:</p>
              {
                ( 'power base' in nftAttributes) ? <p>{nftAttributes['power base'] + nftAttributes['power added points']} ({nftAttributes['power base']}+<span className="text-pink">{nftAttributes['power added points']}</span> )</p> : <p></p>
              }
            </div>
          </div>
          <button onClick={handleOpenModalTransfer} disabled={price || !profile.linked ? true: false} className={`btn ${price || !profile.linked ? 'btn-disable' : 'btn-success'} fluid btn-lg mb-3`}>Transfer</button>
          <div className="row items-center mb-4">
            {price && (
                <div className="col-5">
                    <div className="price"><img src={imageSolana} alt="solana" /> <span style={{fontWeight: 'bold'}}>{price}</span></div>  
                </div>
            )}
            <div className={`col${price && '-7'}`}>
                <button className="btn btn-warning fluid btn-lg mb-3" onClick={handleOpenModal}>{price ? 'Cancel Selling' : 'Sell'}</button>
            </div>
          </div>
          </div>
          )
        }
    </div>
    )
}

export default NftTutorBox;