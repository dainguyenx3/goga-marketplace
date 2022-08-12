import LinkAccount from "../components/Account/LinkAccount";
import History from "../components/Account/History";
import { useParams } from 'react-router-dom';
import Wallet from '../components/Account/Wallet';
import SignIn from '../components/Account/SignIn'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'

const Account = () => {
    const { type } = useParams()
    const { wallet } = useWallet()
    const navigate = useNavigate()
    const { profile } = useProfile()
    useEffect(() => {
        if (!wallet && !profile) {
            navigate('/')
          return;
        }
      }, [wallet]);

    return (
        <>
            { type === 'history' && <History /> }
            { type === 'link-account' && <LinkAccount /> }
            { type === 'sign-in' && <SignIn />}
            { type === 'wallet' && <Wallet /> }
        </>
    )
}

export default Account;