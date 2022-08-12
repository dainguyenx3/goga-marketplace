import React from 'react';
import { LOADING_SKELETON_COUNT } from '../../constant/Orders';

import { Skeleton } from '../Skeleton';

export const LoadingSkeleton: React.FC = () => {
  return (
    <>
      {Array(LOADING_SKELETON_COUNT)
        .fill(0)
        .map((_, key) => (
            <Skeleton key={key} />
        ))}
    </>
  );
};