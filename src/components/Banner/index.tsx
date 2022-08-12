import { WalletMultiButton } from '../Wallet/WalletMultiButton';
import imageLogoImage from '../../img/banner/logo-goga.png'
import imageRight from '../../img/banner/right-img.png'
import { useWallet } from '@solana/wallet-adapter-react'

const Banner = () => {
    const { wallet } = useWallet();
    return (
        <section className="container header mb-4">
            <div className="row">
                <div className="col-lg-7 content-left">
                    <div className="box-image mb-3">
                        <img src={imageLogoImage} alt="Logo goga" />
                    </div>
                    <h2 className="page-title mb-3">The 1st Learn-To-Earn App </h2>
                    <div className="align-bottom">
                        {!wallet && <WalletMultiButton className='btn btn-primary btn-style1 btn-big' style={{backgroundImage: 'none'}}>Connect Wallet</WalletMultiButton>}
                    </div>
                </div> 
                <div className="col-lg-5 content-right">
                    <div className="box-image">   
                        <img src={imageRight} alt="" />
                    </div>
                </div> 
            </div>      
        </section>
    )

}

export default Banner