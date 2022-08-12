import { NftIngameInfo, STATUS_NFT } from './NftIngame'

interface NftTutorBoxProps {
    nft: NftIngameInfo;
    handleOpenModalTransfer: () => void
}

const NftIngameTutorBox = ({ nft, handleOpenModalTransfer }: NftTutorBoxProps) => {
    return (
        <div className="row">
        <div className={`col-lg-6 ${nft.quality?.toLowerCase()}`}>
            <div className="space-between mb-5">
                <div className="code"><span>{ '#' + nft?.tokenId }</span></div>
                <div className="character_name"><span>Genesis</span></div>
            </div>

            <div className="box-image box-image_character">
                <img src={nft.imageUrl} alt="" />
            </div>
        </div>
            <div className="col-lg-6 charactor-info">
              <div className="row mb-4">
                <div className="col-6">
                  <label className="text-pink">GOGA Level</label>
                  <div className="info">Level: { nft.level }</div>
                </div>
                  <div className="col-6">
                    <label className="text-pink">GOGA Quality</label>
                  <div className={`info info-${nft.quality?.toLowerCase()}`}>Quality: { nft.quality }</div>
                </div>
              </div>
          <div className="row mb-4">
            <div className="col-6">
              <label className="text-pink">Battery cycle</label>
                  <div className="info">{ nft.cycleCountUnlimited === 1 ? 'Unlimited' : ('Times: ' + nft.cycleCount) }</div>
            </div>
            <div className="col-6">
              <label className="text-pink">Skill Points</label>
              <div className="info">Total: {nft.attrPoint} </div>
            </div>
          </div>

          <div className="row table-info mb-4">
            <div className="table-info_row">
                  <p>Intelligence:</p>
                     <p>{nft.intelBase + nft.intel} ({nft.intelBase}<span className="text-pink">+{nft.intel}</span> )</p>
            </div>
            <div className="table-info_row">
              <p>Agility:</p>
                <p>{nft.agiBase + nft.agi} ({nft.agiBase}<span className="text-pink">+{nft.agi}</span> )</p>
            </div>

            <div className="table-info_row">
              <p>Luck:</p>

                <p>{nft.luckBase + nft.luck} ({nft.luckBase}<span className="text-pink">+{nft.luck}</span> )</p>
            </div>

            <div className="table-info_row">
              <p>Power:</p>
                <p>{nft.powerBase + nft.power} ({nft.powerBase}<span className="text-pink">+{nft.power}</span> )</p>
            </div>
          </div>
          <button onClick={handleOpenModalTransfer} disabled={nft.status !== STATUS_NFT['ACTIVE']  || Number(nft.battery) < 100 || nft.equipped} className={`btn ${(nft.status !== STATUS_NFT['ACTIVE'] || Number(nft.battery) < 100) || nft.equipped ? 'btn-disable' : 'btn-success'} fluid btn-lg mb-3`}>Transfer</button>
          </div>
    </div>
    )
}

export default NftIngameTutorBox;