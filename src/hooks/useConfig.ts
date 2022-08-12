import { useContext } from 'react';
import { ConfigContext, ConfigContextInterface } from '../App';

export const useConfig = (): ConfigContextInterface => {
    return useContext(ConfigContext);
}