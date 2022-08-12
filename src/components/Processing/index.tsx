import React from 'react';
import imageLoading from '../../img/loading.gif'
export interface ProcessingProps {
  text?: string;
}
export const Processing = ({ text = '' }: ProcessingProps): JSX.Element => {
  return (
    <div className="candy-processing" style={{margin: '30px auto', textAlign: 'center'}}>
      {/* <div className="candy-loading" /> */}
      <img style={{width: '190px', height: '190px', objectFit: 'cover'}} src={imageLoading} />
      {text ? <div style={{color: 'white', fontSize: '30px', fontWeight: 600, marginTop: '40px'}}>{text}</div> : null}
    </div>
  );
};
