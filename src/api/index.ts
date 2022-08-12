import api from '../utils/axios-config';
import { TYPE_NFT_HISTORY, TYPE_TOKEN_HISTORY } from '../constant'

export interface TransferTokenPayload {
    currency: number;
    customerId: string;
    amount: string | number;
}

export interface TransferNftPayload {
    customerId: string;
    mintAddress: string;
}

export interface CurrencyBalance {
    address: string;
    currency: number;
    decimal: number;
    id: number;
    name: string;
    scale: number;
    type: number;
    version: number;
    depositFee: string;
    withdrawFee: string;
}

export interface BalanceIngame {
    availableBalance: string;
    balance: string;
    currency: number;
    customerId: string;
    id: string;
    version: number;
}

export interface SignInAccountInterface {
    name: string;
    email: string;
    password: string;
    country?: string | undefined;
    language?: string | undefined;
}

export const login = async (walletAddress: string, time: number, signature: string)  => {
    const response = await api.post('/utility/login', {
        npId: process.env.REACT_APP_NETWORK_ID!,
        loginId: walletAddress,
        timestamp: time,
        signature: signature
    });
    return response.data;
}

export const getConfig = async () => {
    const response = await api.get(`/minting/network/${process.env.REACT_APP_NETWORK_ID}/config`);
    return response.data;
}

export const getCurrency = async (): Promise<CurrencyBalance[]> => {
   const response =  await api.get(`/minting/network/${process.env.REACT_APP_NETWORK_ID}/currency`);
   return response.data?.data;
}

export const sendCode = async (email: string) => {
    const response = await api.post('/customer/send-code', {
        email: email,
        npId: process.env.REACT_APP_NETWORK_ID!
    })
    return response.data?.data;
}

export const linkAccount = async (email: string, code: string) => {
    const response = await api.post('/customer/link-account', {
        npId: parseInt(process.env.REACT_APP_NETWORK_ID!),
        code: code,
        email: email
    });

    return response.data?.data;
}

export const getBalanceIngame = async (): Promise<BalanceIngame[]> => {
    const response = await api.get('/customer/balance');
    return response.data?.data?.balances || [];
}

export const getNftIngame = async () => {
    const response = await api.get('/customer/inventory');
    return response.data?.data?.inventories || [];
}

export const transferToken = async (payload: TransferTokenPayload ) => {
    const response = await api.post('/customer/transfer/token', payload);
    return response.data?.data;
}

export const transferNft = async (payload: TransferNftPayload) => {
    const response = await api.post('/customer/transfer/nft', payload);
    return response.data?.data;
}

export const getTransferHistory = async (type: string, asset: string, pageNo: number) => {
    const response = await api.get('/customer/transfer/history', {
        params: {
            type,
            asset,
            pageNo,
            pageSize: process.env.REACT_APP_PAGE_SIZE
        }
    })

    return response.data;
}

export const getProfile = async () => {
    const response = await api.get('/customer/profile');
    return response.data;
}

export const signInAccount = async (payload: SignInAccountInterface) => {
    const data = {...payload, ...{npId: process.env.REACT_APP_NETWORK_ID!}}
    const response = await api.post('/customer/register-account',data);
    return response.data;
}