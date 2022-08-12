import * as anchor from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SystemProgram } from '@solana/web3.js';
import {
    LAMPORTS_PER_SOL,
    SYSVAR_RENT_PUBKEY,
    TransactionInstruction,
    Connection,
    Keypair
} from '@solana/web3.js';
import { Wallet, web3, ProgramAccount } from '@project-serum/anchor'
export interface AlertState {
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error' | undefined;
    hideDuration?: number | null;
}

export const toDate = (value?: anchor.BN) => {
    if (!value) {
        return;
    }

    return new Date(value.toNumber() * 1000);
};

const numberFormater = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatNumber = {
    format: (val?: number) => {
        if (!val) {
            return '--';
        }

        return numberFormater.format(val);
    },
    asNumber: (val?: anchor.BN) => {
        if (!val) {
            return undefined;
        }

        return val.toNumber() / LAMPORTS_PER_SOL;
    },
};

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID =
    new anchor.web3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export const CIVIC = new anchor.web3.PublicKey(
    'gatem74V238djXdzWnJf94Wo1DcnuGkfijbf3AuBhfs',
);

export const getAtaForMint = async (
    mint: anchor.web3.PublicKey,
    buyer: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
    return await anchor.web3.PublicKey.findProgramAddress(
        [buyer.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    );
};

export const getNetworkExpire = async (
    gatekeeperNetwork: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
    return await anchor.web3.PublicKey.findProgramAddress(
        [gatekeeperNetwork.toBuffer(), Buffer.from('expire')],
        CIVIC,
    );
};

export const getNetworkToken = async (
    wallet: anchor.web3.PublicKey,
    gatekeeperNetwork: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
    return await anchor.web3.PublicKey.findProgramAddress(
        [
            wallet.toBuffer(),
            Buffer.from('gateway'),
            Buffer.from([0, 0, 0, 0, 0, 0, 0, 0]),
            gatekeeperNetwork.toBuffer(),
        ],
        CIVIC,
    );
};

export function createAssociatedTokenAccountInstruction(
    associatedTokenAddress: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey,
    walletAddress: anchor.web3.PublicKey,
    splTokenMintAddress: anchor.web3.PublicKey,
) {
    const keys = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new TransactionInstruction({
        keys,
        programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([]),
    });
}

export interface InfoCandyMachineProps {
    goLiveDate: Date,
    price: number,
    itemsRemaining: number,
    itemsAvailable: number,
    itemsRedeemed: number
}

export async function getInfoCandyMachine<InfoCandyMachineProps>(connection: Connection, candyMachineId: string ) {
    let key = [117,30,95,42,16,239,18,0,196,214,30,164,180,211,46,118,180,72,24,75,103,236,228,171,47,98,197,75,249,217,223,63,110,181,40,59,33,55,227,150,186,230,155,159,251,113,177,68,160,48,60,76,186,200,26,97,168,191,85,94,2,199,26,212];
    const loadedKeypair = Keypair.fromSecretKey(new Uint8Array(key));
    const payerWallet = new Wallet(loadedKeypair);
    const provider = new anchor.Provider(connection, payerWallet, {
        preflightCommitment: 'processed',
    });
    const candy_machine_program = new web3.PublicKey('cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ');
    const idl = await anchor.Program.fetchIdl(candy_machine_program, provider);
    const program = new anchor.Program(idl!, candy_machine_program, provider);
    const state: any = await program.account.candyMachine.fetch(candyMachineId);
    return {
        itemsAvailable: state.data.itemsAvailable.toNumber(),
        itemsRedeemed: state.itemsRedeemed.toNumber(),
        itemsRemaining: state.data.itemsAvailable.toNumber() - state.itemsRedeemed.toNumber(),
        goLiveDate: new Date(state.data.goLiveDate.toNumber() * 1000),
        price: state.data.price.toNumber()/LAMPORTS_PER_SOL
    }
}
