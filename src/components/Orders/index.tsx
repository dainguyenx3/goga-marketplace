import React, { useEffect, useState, useRef, useCallback, MouseEventHandler } from 'react';
import { Dropdown } from '../Dropdown';
import { Empty } from '../Empty';
import { Skeleton } from '../Skeleton';
import { InfiniteOrderList } from '../InfiniteOrderList';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { ORDER_FETCH_LIMIT, LOADING_SKELETON_COUNT, SORT_OPTIONS } from '../../constant/Orders';
import { OrdersActionsStatus } from '../../constant';
import { CandyShop } from '@liqnft/candy-shop-sdk';
import { useValidateStatus } from '../../hooks/useValidateStatus';
import { useUpdateCandyShopContext } from '..//Context';
import { CollectionFilter, ShopFilter, OrderDefaultFilter } from '../../model';
import './index.less';
import Pagination from '../Pagination'
import { LoadingSkeleton } from '../LoadingSkeleton';

interface OrdersProps {
  walletConnectComponent: React.ReactElement;
  wallet?: AnchorWallet;
  url?: string;
  identifiers?: number[];
  filters?: CollectionFilter[];
  defaultFilter?: { [key in OrderDefaultFilter]: string };
  shopFilters?: ShopFilter[];
  style?: { [key: string]: string | number };
  candyShop: CandyShop;
  sellerAddress?: string;
}

/**
 * React component that displays a list of orders
 */
export const Orders: React.FC<OrdersProps> = ({
  walletConnectComponent,
  wallet,
  url,
  identifiers,
  filters,
  style,
  candyShop,
  sellerAddress,
  shopFilters,
  defaultFilter
}) => {
  const [sortedByOption, setSortedByOption] = useState(SORT_OPTIONS[0]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalOrder, setTotalOrder] = useState<number>(0)
  const [isShowDropdown, setIsShowDropdown] = useState<boolean>(false);
  const loadingMountRef = useRef(false);
  const [page, setPage] = useState<number>(1)

  const updateOrderStatus = useValidateStatus(OrdersActionsStatus);
  useUpdateCandyShopContext(candyShop.candyShopAddress);

  const loadData = (page: number, limit: number) => {
    candyShop
      .orders({
        sortBy: sortedByOption.value,
        offset: (page - 1) * limit,
        limit,
        identifiers: getUniqueIdentifiers(identifiers),
        sellerAddress,
      })
      .then((data: any) => {
        if (!data.result) return;
        setTotalOrder(data.totalCount);
        setOrders(data.result);
      })
      .catch((err) => {
        console.info('fetchOrdersByStoreId failed: ', err);
      }).finally(() => {
        setLoading(false);
      });;
  };

  useEffect(() => {
    if (!loadingMountRef.current) {
      setLoading(true);
    }
    loadingMountRef.current = true;
    loadData(page, ORDER_FETCH_LIMIT)
  }, [candyShop, sortedByOption.value, updateOrderStatus, sellerAddress, identifiers]);

  const handleChangePage = (page: number) => {
    if (page < 1) {
      page = 1
    }
    setPage(page)
    loadData(page, ORDER_FETCH_LIMIT)
  }

  const loadingView = (
    <div className="row list-character mb-0"><LoadingSkeleton /></div>
  );

  const emptyView = <Empty description="No results" />;

  const infiniteOrderListView = (
    <InfiniteOrderList
      orders={orders}
      walletConnectComponent={walletConnectComponent}
      wallet={wallet}
      url={url}
      candyShop={candyShop}
    />
  );

  return (
    <>
      <section className="container characters mb-4">
        <div className="before-list-character">
          <div className="results fw-bold">
            { totalOrder } Results
          </div>
          <div className="sortby">
            <div className="dropdown">
              <button onClick={() => setIsShowDropdown(!isShowDropdown)} className="btn btn-sortby dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                {sortedByOption.label}
              </button>
              <ul className={`dropdown-menu ${isShowDropdown ? 'show': ''}`} aria-labelledby="dropdownMenuButton1">
                {SORT_OPTIONS.map((item, index) => {
                  return <li
                    onClick={(e) => {
                      e.preventDefault()
                      setSortedByOption(item)
                      setIsShowDropdown(!isShowDropdown)
                    }}
                    key={index}><a href='#' className={`dropdown-item ${sortedByOption.value == item.value ? 'active' : ''}`}>{item.label}</a></li>
                })}
              </ul>
            </div>
          </div>
        </div>
        {loading ? loadingView : orders.length ? infiniteOrderListView : emptyView}
        <Pagination
          max={(totalOrder % ORDER_FETCH_LIMIT > 0 ? 1 : 0) + parseInt((totalOrder / ORDER_FETCH_LIMIT).toString())}
          handleChangePage={handleChangePage}
          page={page}
        />
      </section>
      {/* <div className="candy-orders-container" style={style}>
        <div className="candy-container">
          <div className="candy-orders-sort">
            <Dropdown
              items={SORT_OPTIONS}
              selectedItem={sortedByOption}
              onSelectItem={(item) => setSortedByOption(item)}
              defaultValue={SORT_OPTIONS[0]}
            />
          </div>
          {loading ? loadingView : orders.length ? infiniteOrderListView : emptyView}
        </div>
      </div> */}
    </>
  );
};

function getUniqueIdentifiers(identifiers: number[] = [], filterIdentifiers: number | number[] = []) {
  let results = [...identifiers, ...(typeof filterIdentifiers === 'number' ? [filterIdentifiers] : filterIdentifiers)]
  return results
}