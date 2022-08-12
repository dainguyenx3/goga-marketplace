import { OrderSortBy } from '@liqnft/candy-shop-types';

export const ORDER_FETCH_LIMIT = parseInt(process.env.REACT_APP_PAGE_SIZE!) || 16;
export const LOADING_SKELETON_COUNT = 4;

export const SORT_OPTIONS: { value: OrderSortBy; label: string }[] = [
  {
    value: {
      column: 'price',
      order: 'asc'
    },
    label: 'Lowest Price'
  },
  {
    value: {
      column: 'price',
      order: 'desc'
    },
    label: 'Highest Price'
  },
  {
    value: {
      column: 'blockTimeAtCreation',
      order: 'desc'
    },
    label: 'Latest Listed'
  },
  // {
  //   value: {
  //     column: 'blockTimeAtCreation',
  //     order: 'asc'
  //   },
  //   label: 'Oldest'
  // },
  
];

export const FILTER_ATTRIBUTES_MOCK = [
  {
    name: 'Material',
    options: [
      { label: '18k Silver', value: 1 },
      { label: '18k Gold 18k Silver 18k Silver', value: 0 }
    ],
    placeholder: 'Select Material'
  },
  {
    name: 'Background',
    options: [
      { label: '18k Gold 18k Silver', value: 0 },
      { label: '18k Silver', value: 1 }
    ],
    placeholder: 'Select Material'
  },
  {
    name: 'Skin',
    options: [
      { label: '18k Gold', value: 0 },
      { label: '18k Silver', value: 1 }
    ],
    placeholder: 'Select Material'
  },
  {
    name: 'Accessories',
    options: [
      { label: '18k Gold', value: 0 },
      { label: '18k Silver', value: 1 }
    ],
    placeholder: 'Select Material'
  }
];
