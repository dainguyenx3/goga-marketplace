import { Order as OrderSchema } from '@liqnft/candy-shop-types';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '../Wallet/WalletMultiButton';
import imageSolana from '../../img/price/solana2.png';
import { REGEX_IMAGE } from '../../constant';

interface NftAttributesFormat {
   [key: string]: string
}

interface TutorBoxProps {
  order: OrderSchema;
  nftAttributes: NftAttributesFormat;
  orderPrice: number;
  handleOpenModal: () => void;
  isUserListing: boolean | undefined
}
const TutorBox = ({ order, nftAttributes, orderPrice, handleOpenModal, isUserListing }: TutorBoxProps) => {
  const { wallet } = useWallet();
  console.log('nftAttributes', nftAttributes)
    return (
        <div className="row">
        <div className={`col-lg-6 ${nftAttributes['quality']?.toLowerCase()}`}>
          <div className="space-between mb-5">
                <div className="code"><span>{  order?.name?.split('#')[1] && ("#" + order?.name?.split('#')[1]) }</span></div>
            <div className="character_name"><span>Genesis</span></div>
          </div>
        <div className="box-image box-image_character">
          <img src={order?.nftImageLink?.replace(REGEX_IMAGE, '.png')} alt="" />
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
                  <div className="info">{ ('battery cycle count' in nftAttributes) ?( nftAttributes['battery cycle count'] === 'Unlimited' ? 'Unlimited' :( 'Times: ' + nftAttributes['battery cycle count'].split('/')[0] )): 'Times: ' }</div>
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

          <div className="row items-center mb-4">
            <div className="col-5">
                  <div className="price"><img src={imageSolana} alt="solana" /> <span>{ orderPrice ? `${orderPrice}` : 'N/A' }</span></div>  
            </div>   
            <div className="col-7">
              {!wallet ? <WalletMultiButton className='btn btn-warning fluid btn-lg' style={{color: 'black', padding: '37px 5px'}}>Purchase</WalletMultiButton> : (
                <button onClick={handleOpenModal} className="btn btn-warning fluid btn-lg">{ isUserListing && order && wallet ? 'Cancel Selling' : 'Purchase' }</button>
              )}
            </div>
          </div>
              <div className="owner">
                <span className="text-pink me-3">Owner:</span> <span className="text-light">{order?.walletAddress?.slice(0, 8) + '...' + order?.walletAddress?.slice(-8)}</span></div>
          </div>
          )
        }
      </div>
    )
}

export default TutorBox;