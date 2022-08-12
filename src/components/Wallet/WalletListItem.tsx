import { Wallet } from '@solana/wallet-adapter-wallets';
import React, { FC, MouseEventHandler } from 'react';
import { Button } from './Button';
import { WalletIcon } from './WalletIcon';

export interface WalletListItemProps {
    handleClick: MouseEventHandler<HTMLButtonElement>;
    tabIndex?: number;
    wallet: Wallet;
    style?: object
}

export const WalletListItem: FC<WalletListItemProps> = ({ handleClick, tabIndex, wallet, style }) => {
    return (
        <li style={{display: 'inline-block'}}>
            <Button
                style={style}
                onClick={handleClick} endIcon={<WalletIcon wallet={wallet} />} tabIndex={tabIndex}>
                {wallet.name}
            </Button>
        </li>
    );
};
