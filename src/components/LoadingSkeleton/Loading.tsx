import imageLoading from '../../img/loading.gif'

const Loading = () => {
     return (
        <div className='col-lg text-center'>
        <div className="col-inner" style={{minHeight: '520px',marginTop: '12%', border: 'none'}}>
            <img width={'270px'} src={imageLoading} />
        </div>
        </div>
     )
}

export default Loading;