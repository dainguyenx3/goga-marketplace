import {useWallet} from '@solana/wallet-adapter-react'
import Wallet404Modal from './Wallet404Modal';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Wallet404 = () => {
    const { wallet, connected } = useWallet();
    const router = useNavigate();
    return (
        <>
            <div id="content" role="main" className="content-area">
                <div className="container py-5">
                    <div>
                        <a href="#" onClick={() => router(-2)} className="btn btn-lg btn-outline-light has-icon icon-left"><span className="icon icon-back"></span> Back</a>
                    </div>

                    <div className="row mb-4">
                        <div className="col-lg-12 text-center">
                            <h1 className="mb-4">Connect wallet</h1>
                            <h3 className="text-pink">You need an Ethereum wallet to Buy Box</h3>
                            <p>Connect with one of these available wallet providers.</p>
                        </div>          
                    </div>
                    <div className="row content-center">
                        <div className="col-lg-7">
                            <div className="payment-method box py-5 text-center active">
                                <div className="box-image mb-3">
                                    <img src={wallet?.icon} width="134" alt="icon" />
                                </div> 
                                <div className="box-text">
                                <h4>{ wallet?.name }</h4>
                                </div> 
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            <Wallet404Modal connected={connected} wallet={wallet} />
        </>
    )
}

export default Wallet404