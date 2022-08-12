import { ShopStatusType } from '@liqnft/candy-shop-types';

export enum LoadStatus {
  ToLoad = 'ToLoad',
  Loading = 'Loading',
  Loaded = 'Loaded'
}
export const TIMEOUT_EXTRA_LOADING = 3_000;
export const POLLING_SHOP_INTERVAL = 3_000;
export const POLLING_INTERVAL = POLLING_SHOP_INTERVAL + 500;

export const StatActionsStatus = [ShopStatusType.Order];
export const OrdersActionsStatus = [ShopStatusType.Order];
export const SellActionsStatus = [ShopStatusType.Order];
export const ActivityActionsStatus = [ShopStatusType.Trade];

export const TYPE_NFT_BOX = 'GOGA_BOX';
export const TYPE_NFT_TUTOR_BOX = 'GOGA';

export const KEY_PROFILE = 'profile';
export const TIME_HIDDEN_WARNING = 5000;
export const KEY_SUCCESS = 'SUCCESS';
export const TYPE_TOKEN_HISTORY = '2';
export const TYPE_NFT_HISTORY = '3';
export const REGEX_IMAGE = /\.jpg$|.jpeg$/;
export const MESSAGE_SUCCESS = 'Success! Please wait a few minutes while the process is completed';
export const REGEX_NUMBER = /^[^\d.]+/
export const REGEX_FORMAT_INPUT = /^[0-9\b]+$/;
export const TIME_HIDDEN_LOADING = 100000;
export const MESSAGE_TRANSACTION_FAILD = 'Sorry, something went wrong there. Try again.';
export const ROYALTY_FEE = 4;
export const PLATFORM_FEE = 1;