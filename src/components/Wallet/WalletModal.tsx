import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { FC, MouseEvent, ReactNode, useCallback, useLayoutEffect, useMemo, useRef, useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { Collapse } from './Collapse';
import { useWalletModal } from '../../hooks/useWalletModal';
import { WalletListItem } from './WalletListItem';
import { Modal } from 'react-bootstrap'
import imageModal from '../../img/modal/01-image 1.png';
import LoginAccountModal from '../Modal/LoginAccountModal';
import { login } from '../../api';
import * as bs58 from 'bs58';
import { ConfigContext } from '../../App';
import { useProfile } from '../../hooks/useProfile';
import { handleError } from '../../utils/ErrorHandler';

export interface WalletModalProps {
    className?: string;
    logo?: ReactNode;
    featuredWallets?: number;
    container?: string;
}

export const WalletModal: FC<WalletModalProps> = ({
    className = '',
    logo,
    featuredWallets = 3,
    container = 'body',
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const { wallets, select, signMessage, publicKey, disconnect } = useWallet();
    const [walletPhantom, setWalletPhantom] = useState<Wallet>();
    const { setVisible } = useWalletModal();
    const [expanded, setExpanded] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [portal, setPortal] = useState<Element | null>(null);
    const [isConnectWallet, setIsConnectWallet] = useState<boolean>(false)
    const [featured, more] = useMemo(
        () => {
            let findWallet = wallets.find(item => item.name == WalletName.Phantom)
            if (findWallet) {
                setWalletPhantom(findWallet)
            }
            return [wallets.slice(0, featuredWallets), wallets.slice(featuredWallets)]
        },
        [wallets, featuredWallets]
    );
    const config = useContext(ConfigContext);
    const profileData = useProfile();

    const hideModal = useCallback(() => {
        setFadeIn(false);
        setTimeout(() => setVisible(false), 150);
    }, [setFadeIn, setVisible]);

    const handleClose = useCallback(
        (event: MouseEvent) => {
            event.preventDefault();
            hideModal();
        },
        [hideModal]
    );

    const handleWalletClick = useCallback(
        async (event: MouseEvent, wallet: Wallet) => {
            select(wallet.name);
            // handleClose(event);
            try {
                await wallet.adapter().connect()
            } catch (e) {
                console.log('Connect wallet error', e)
                localStorage.removeItem('walletName')
                window.open(wallet.url)
            }
        },
        [select, handleClose, setIsConnectWallet]
    );

    useEffect(() => {
        if ("solana" in window) {
            const solWindow = window as any;
            solWindow.solana.on('connect', async () => {
            const time = new Date().getTime();
                const signed = await signMessage?.(new TextEncoder().encode(config.loginMessage.replace('%s', time.toString())))
                .catch(e => { 
                    // handleError({error: e});
                    hideModal();
                    disconnect();
                });
                if (signed) {
                    let signature = bs58.encode(signed);
                    const response = await login(publicKey?.toBase58()!, time, signature);
                    if(response.data.customer.profile) {
                        profileData.setProfile(response.data.customer.profile)
                        if(!response.data.customer.profile.linked) {
                            setIsConnectWallet(true)
                        } else {
                            hideModal()
                        }
                    }
                }
            })
    
        }
    }, [publicKey])

    const handleCollapseClick = useCallback(() => setExpanded(!expanded), [setExpanded, expanded]);

    const handleTabKey = useCallback(
        (event: KeyboardEvent) => {
            const node = ref.current;
            if (!node) return;

            // here we query all focusable elements
            const focusableElements = node.querySelectorAll('button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                // if going backward by pressing tab and firstElement is active, shift focus to last focusable element
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                // if going forward by pressing tab and lastElement is active, shift focus to first focusable element
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        },
        [ref]
    );

    useLayoutEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                hideModal();
            } else if (event.key === 'Tab') {
                handleTabKey(event);
            }
        };

        // Get original overflow
        const { overflow } = window.getComputedStyle(document.body);
        // Hack to enable fade in animation after mount
        setTimeout(() => setFadeIn(true), 0);
        // Prevent scrolling on mount
        // document.body.style.overflow = 'hidden';
        // Listen for keydown events
        window.addEventListener('keydown', handleKeyDown, false);

        return () => {
            // Re-enable scrolling when component unmounts
            document.body.style.overflow = overflow;
            window.removeEventListener('keydown', handleKeyDown, false);
        };
    }, [hideModal, handleTabKey]);

    useLayoutEffect(() => setPortal(document.querySelector(container)), [setPortal, container]);

    return (
        isConnectWallet ? (<LoginAccountModal isOpen={isConnectWallet} handleClose={handleClose} />) :
        (portal &&
        createPortal(
            <Modal show={true} id="alert-connect-walllet" className="modal modal-alert" role="dialog" centered >
                <Modal.Body>
                    <a href="#" onClick={handleClose} className="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </a>
                    <div className="text-center mb-3">
                        <div className="box-image">
                            <img src={imageModal} width="180" alt="" />
                        </div>
                        <h3>Connect Wallet</h3>
                    </div>
                    <div className="row">
                        <ul className="wallet-adapter-modal-list" style={{ textAlign: 'center'}}>
                            { walletPhantom &&(<WalletListItem
                                style={{ backgroundColor: 'white', color: 'black', borderRadius: '20px' }}
                                key={walletPhantom.name}
                                handleClick={(event) => handleWalletClick(event, walletPhantom)}
                                wallet={walletPhantom}
                            />)}
                            {/* {featured.map((wallet) => (
                                <WalletListItem
                                    style={{width: '100%', backgroundColor: '#865AC2'}}
                                    key={wallet.name}
                                    handleClick={(event) => handleWalletClick(event, wallet)}
                                    wallet={wallet}
                                />
                            ))} */}
                        </ul>
                        {/* {more.length ? (
                            <>
                                <Collapse expanded={expanded} id="wallet-adapter-modal-collapse">
                                    <ul className="wallet-adapter-modal-list">
                                        {more.map((wallet) => (
                                            <WalletListItem
                                                style={{width: '100%', backgroundColor: '#865AC2'}}
                                                key={wallet.name}
                                                handleClick={(event) => handleWalletClick(event, wallet)}
                                                tabIndex={expanded ? 0 : -1}
                                                wallet={wallet}
                                            />
                                        ))}
                                    </ul>
                                </Collapse>
                                <Button
                                    style={{width: '100%', backgroundColor: '#865AC2'}}
                                    aria-controls="wallet-adapter-modal-collapse"
                                    aria-expanded={expanded}
                                    className={`wallet-adapter-modal-collapse-button ${
                                        expanded && 'wallet-adapter-modal-collapse-button-active'
                                    }`}
                                    endIcon={
                                        <svg width="11" height="6" xmlns="http://www.w3.org/2000/svg">
                                            <path d="m5.938 5.73 4.28-4.126a.915.915 0 0 0 0-1.322 1 1 0 0 0-1.371 0L5.253 3.736 1.659.272a1 1 0 0 0-1.371 0A.93.93 0 0 0 0 .932c0 .246.1.48.288.662l4.28 4.125a.99.99 0 0 0 1.37.01z" />
                                        </svg>
                                    }
                                    onClick={handleCollapseClick}
                                >
                                    {expanded ? 'Less' : 'More'} options
                                </Button>
                            </>
                        ) : null} */}
                    </div>
                </Modal.Body>
            </Modal>,
            portal)
        )
    );
};
