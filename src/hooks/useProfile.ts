import { useContext, createContext } from 'react';

export const ProfileContex = createContext({} as any);

export const useProfile = (): any => {
    return useContext(ProfileContex);
}