import { useContext, createContext } from 'react';
export const AlterContext = createContext({} as any)
export const useAlter = () => {
    return useContext(AlterContext);
}