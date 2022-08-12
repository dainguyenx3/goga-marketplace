import {Connection, Keypair, LAMPORTS_PER_SOL} from "@solana/web3.js";
import { Wallet, web3, ProgramAccount } from '@project-serum/anchor'
import * as anchor from '@project-serum/anchor';

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
