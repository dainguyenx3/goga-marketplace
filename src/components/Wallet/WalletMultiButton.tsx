import { useWallet } from '@solana/wallet-adapter-react';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { Button, ButtonProps } from './Button';
import { useWalletModal } from '../../hooks/useWalletModal';
import { WalletConnectButton } from './WalletConnectButton';
import { WalletIcon } from './WalletIcon';
import { WalletModalButton } from './WalletModalButton';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../hooks/useProfile';
import {useCookies} from 'react-cookie'

export const WalletMultiButton: FC<ButtonProps> = ({ children, ...props }) => {
    const [cookies, setCookie, removeCookie] = useCookies(['JSESSIONID'])
    const { publicKey, wallet, disconnect, signMessage } = useWallet();
    const {setProfile} = useProfile();
    const { setVisible } = useWalletModal();
    const [copied, setCopied] = useState(false);
    const [active, setActive] = useState(false);
    const ref = useRef<HTMLUListElement>(null);
    const navigate = useNavigate();
    const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

    const content = useMemo(() => {
        if (children) return children;
        if (!wallet || !base58) return null;
        return base58.slice(0, 8) + '...' + base58.slice(-8);
    }, [children, wallet, base58, publicKey]);
    
    const copyAddress = useCallback(async () => {
        if (base58) {
            await navigator.clipboard.writeText(base58);
            setCopied(true);
            setTimeout(() => setCopied(false), 400);
        }
    }, [base58]);

    const openDropdown = useCallback(() => setActive(true), [setActive]);

    const closeDropdown = useCallback(() => setActive(false), [setActive]);

    const openModal = useCallback(() => {
        setVisible(true);
        closeDropdown();
    }, [setVisible, closeDropdown]);

    

    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent) => {
            const node = ref.current;

            // Do nothing if clicking dropdown or its descendants
            if (!node || node.contains(event.target as Node)) return;

            closeDropdown();
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, closeDropdown]);

    useEffect(() => {
        if ("solana" in window) {
            const solWindow = window as any;
            solWindow.solana.on('accountChanged', () => {
                removeCookie('JSESSIONID')
                localStorage.clear()
                disconnect().then(res => {
                    window.location.replace('/')
                })
            })

            // solWindow.solana.on('disconnect', () => {
            //     removeCookie('JSESSIONID');
            //     // window.location.reload()
            // })

        }
    }, [signMessage, publicKey])

    if (!wallet) return <WalletModalButton {...props}>{children}</WalletModalButton>;
    if (!base58) return <WalletConnectButton {...props}>{children}</WalletConnectButton>;

    const handleClick = (e: React.MouseEvent, path: string) => {
        e.preventDefault()
        navigate(path)
    }

    const handleDisconnect = (e: React.MouseEvent) => {
        e.preventDefault()
        disconnect().then(res => {
            setProfile(null);
        })
        if(window.location.pathname.includes('/account')) {
            navigate('/')
        }
    }

    return (
        <>
            <Button
                aria-expanded={active}
                className="wallet-adapter-button-trigger"
                style={{ pointerEvents: active ? 'none' : 'auto', ...props.style }}
                onClick={openDropdown}
                startIcon={<WalletIcon wallet={wallet} />}
                {...props}
            >
                {content}
            </Button>
            <ul className="sub-menu" style={{zIndex: 1}}>
                <li><a href="#" onClick={(e) => handleClick(e, '/account/wallet')} className="has-icon"><i className="icon wallet-blue"></i> Wallet</a></li>
                <li><a href="#" onClick={(e) => handleClick(e, '/account/history')} className="has-icon"><i className="icon history-blue"></i> History</a></li>
                <li><a href="#" onClick={(e) => handleClick(e, '/account/link-account')} className="has-icon"><i className="icon account-blue"></i> Account</a></li>
                <li><a href='#' onClick={handleDisconnect} >Disconnect</a></li>
            </ul>
            {/* <ul
                aria-label="dropdown-list"
                className={`wallet-adapter-dropdown-list ${active && 'wallet-adapter-dropdown-list-active'}`}
                ref={ref}
                role="menu"
            >
                <li onClick={copyAddress} className="wallet-adapter-dropdown-list-item" role="menuitem">
                    {copied ? 'Copied' : 'Copy address'}
                </li>
                <li onClick={openModal} className="wallet-adapter-dropdown-list-item" role="menuitem">
                    Connect a different wallet
                </li>
                <li className="wallet-adapter-dropdown-list-item" role="menuitem">
                    Wallet
                </li>
                <li className="wallet-adapter-dropdown-list-item" role="menuitem">
                    <Link to={'/history'}>History</Link>
                </li>
                <li className="wallet-adapter-dropdown-list-item" role="menuitem">
                    Account
                </li>
                <li onClick={disconnect} className="wallet-adapter-dropdown-list-item" role="menuitem">
                    Disconnect
                </li>
            </ul> */}
        </>
    );
};
