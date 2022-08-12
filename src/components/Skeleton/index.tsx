import React from 'react';
import './index.less';
import { Card, Placeholder } from 'react-bootstrap';

export const Skeleton = () => {
  return (
    <div className='col-lg-3 character'>
      <div className="col-inner" style={{textAlign: 'left', border: 'none'}}>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
        <Placeholder as={Card.Text} animation="glow">
          <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
          <Placeholder xs={6} /> <Placeholder xs={8} />
        </Placeholder>
      </div>
    </div>
  );
};
