import { useContext, createContext } from 'react';
import { CurrencyBalance } from '../api'

export const CurrencyBalanceContext = createContext({} as CurrencyBalance);

export const useCurrencyBalance = (): CurrencyBalance => {
    return useContext(CurrencyBalanceContext);
}