import axios from "axios";
import { KEY_PROFILE } from '../constant'


const api = axios.create({
    baseURL: process.env.REACT_APP_URL_APP,
    timeout: 18000,
    headers: {
        'content-type': 'application/json'
    },
})

api.interceptors.response.use(response => {
    return response;
 }, error => {
   if (error?.response?.status === 401) {
    if('solana' in window) {
        const solanaWindow = window as any;
        solanaWindow.solana.disconnect().then((res: any) => {
            if(error.response.config.url !== '/customer/profile') {
                localStorage.removeItem(KEY_PROFILE);
                window.location.replace('/')
            }
        }).catch(() => {})
    }
   }
   return error;
 });

export default api;