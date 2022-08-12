import Sidebar from './Sidebar'
import Back from './Back'
import { useEffect, useMemo, useState } from 'react'
import GogaNftHistory from './GogaNftHistory'
import BoxHistory from './BoxHistory';
import TransactionHistory from './TransactionHistory';
import { getTransferHistory, CurrencyBalance, getCurrency } from '../../api';
import { TYPE_NFT_BOX, TYPE_NFT_TUTOR_BOX, TYPE_NFT_HISTORY, TYPE_TOKEN_HISTORY } from '../../constant';
import { getProfile } from '../../api';
import { useProfile } from '../../hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../hooks/useConfig'

const History = () => {
    const [tab, setTab] = useState<string>('box');
    const [page, setPage] = useState<number>(1);
    const [history, setHistory] = useState<any>();
    const [totalPage, setTotalPage] = useState<number>(0);
    const { profile, setProfile } = useProfile();
    const navigate = useNavigate()
    const [currencyBalance, setCurrencyBalance] = useState<CurrencyBalance>();
    const config = useConfig();

    useEffect(() => {
        (async() => {
            let type = ['box', 'nft'].includes(tab) ? TYPE_NFT_HISTORY : TYPE_TOKEN_HISTORY;
            let asset = tab === 'box' ? '2' : (tab === 'nft' ? '1' : '')
            const response = await getTransferHistory(type, asset, page);
            if(response?.data) {
                setHistory(response.data?.records);
                setTotalPage(response.data?.pageCount);
            }
        })()
    }, [tab, page])

    useEffect(() => {
        (async () => {
            const response = await getProfile();
            if(profile && response.data.linked && response.data.linked !== profile.linked) {
                setProfile(response.data)
            }
        })()
    }, [])

    useEffect(() => {
        (async () => {
            if(profile) {
              const response = await getCurrency()
              if(response) {
                const currencyBalanceData = response.find(item => item.currency === config.nftWithdrawCurrency);
                if(currencyBalanceData) {
                  setCurrencyBalance(currencyBalanceData)
                }
              }
            }
        })()
    }, [profile?.email])

    const handleChangeTab = (value: string) => {
        setTab(value)
        setPage(1);
    }

    const handleChangePage = (pageInput: number) => {
        if (pageInput < 1) {
            pageInput = 1
        } else if(pageInput > totalPage) {
            pageInput = totalPage
        }
        setPage(pageInput)
    }

    return (
        <div className="panel-history">
                    <section className="container">
                        <Back />
                        <div className="row pb-5">
                            <Sidebar />
                            <div className="col-lg-9">
                                <section className="container">
                                   <div className="tab-menu mb-4">
                                       <button onClick={() => handleChangeTab('box')} className={`tab ${tab === 'box' ? 'active' : ''}`} data-tab="box-history">Box History</button>
                                       <button onClick={() => handleChangeTab('nft')} className={`tab ${tab === 'nft' ? 'active' : ''}`} data-tab="goga-nfts-history">GOGA NFTs History</button>
                                       <button onClick={() => handleChangeTab('transaction')} className={`tab ${tab === 'transaction' ? 'active' : ''}`} data-tab="transaction-history">Transaction History</button>
                                   </div>
                                    {
                                        profile && profile.linked ? (
                                        (tab === 'nft' ? 
                                        <GogaNftHistory currencyBalance={currencyBalance!} max={totalPage} history={history} page={page} handleChangePage={handleChangePage} /> 
                                        : (tab === 'transaction' ? <TransactionHistory currencyBalance={currencyBalance!} max={totalPage} history={history} page={page} handleChangePage={handleChangePage} /> 
                                        :  <BoxHistory currencyBalance={currencyBalance!} max={totalPage} history={history} page={page} handleChangePage={handleChangePage} />  )))
                                        : (
                                            <div className="py-5 mb-5">
                                                <p className="text-center mb-5 fs-3 fw-bold text-secondary">You haven’t linked to your in-game account</p>
                                                <div className="row justify-content-center">
                                                    <div className="col-6 col-lg-3">
                                                        <button style={{borderRadius: '10px'}} onClick={() => navigate('/account/link-account')} className="btn btn-warning fluid">Link Account</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                </section>
                            </div>
                        </div>
                        
                    </section>       
                </div>
    )
}

export default History;