import React, { useEffect, useState } from 'react'
import { WalletMultiButton } from '../components/Wallet/WalletMultiButton'
import { useAnchorWallet, useWallet } from '@solana/wallet-adapter-react'
import styled from 'styled-components'
import logoBlack from '../img/logo-black.png';
import logoWhite from '../img/logo-white.png';
import {Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface TopNavProps {
  showCurrencyToggle?: boolean,
}

const TopNav: React.FC<TopNavProps> = () => {
    const wallet = useAnchorWallet()
    const navigate = useNavigate();
    const [isToggle, setToggle] = useState<boolean>(false);
    const [open, setOpen] = React.useState(false)

    const anchorRef = React.useRef<HTMLLIElement>(null)

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: any) => {
        if (anchorRef?.current && (anchorRef.current as any).contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    function handleListKeyDown(event: any) {
        if (event.key === 'Tab') {
            event.preventDefault();
            setOpen(false);
        }
    }

    // return focus to the button when we transitioned from !open -> open
    const prevOpen = React.useRef(open);
    React.useEffect(() => {
        if (prevOpen.current === true && open === false) {
            if (anchorRef.current !== null) anchorRef.current.focus();
        }

        prevOpen.current = open;
    }, [open]);
  return (
      <header className='header-section has-header-main'>
            <div className="header-main is-sticky" id="header-main">
                <nav className="navbar navbar-expand-lg navbar-dark">
                    <div className="container">
                        <a className="navbar-brand" href='#' onClick={(e) =>{
                                e.preventDefault();
                                navigate('/')
                            } }>
                            <img className="logo-dark logo-img" src={logoBlack} alt="logo" />
                            <img className="logo-light logo-img" src={logoWhite} alt="logo" />
                        </a>
                        <button className="navbar-toggler" onClick={handleToggle} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className={`navbar-collapse ${open === false ? 'collapse' : '' }`} id="navbarSupportedContent">
                            <ul className="navbar-nav ml-auto">
                                <li className={`nav-item ${window.location.pathname === '/mint' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/mint">GOGA BOX</Link>
                                </li>
                                <li className={`nav-item ${window.location.pathname === '/' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/">Marketplace</Link>
                                </li>
                                <li className={`nav-item ${window.location.pathname === '/inventory' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/inventory">Inventory</Link>
                                </li>
                                <li className={`nav-item ${window.location.pathname === '/contact-us' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/contact-us">Contact us</Link>
                                </li>
                                <li className={`nav-item ${window.location.pathname === '/download' ? 'active' : ''}`}>
                                    <a className="nav-link" href="https://goga.ai/how-to-download-beta-goga-app-sign-in-to-your-account/">Download</a>
                                </li>
                                <li className={`nav-item nav-item-cta ${wallet ? 'has-child' : '' }`}>
                                    {wallet?.publicKey ? (
                                      <WalletMultiButton className="btn btn-primary btn-style1" style={{ backgroundColor: '#715AFF' }} />
                                    ) : (
                                      <WalletMultiButton className="btn btn-primary btn-style1" >Connect Wallet</WalletMultiButton>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
  )
}

const Wallet = styled.ul`
  flex: 0 0 auto;
  margin: 0;
  padding: 0;
`

export default TopNav
