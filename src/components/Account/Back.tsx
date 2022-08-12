import imageBack from '../../img/back.png';
import { useNavigate } from 'react-router-dom';
import { MouseEvent } from 'react';
const Back = () => {
    const navigate = useNavigate();
    const handleBack = (e: MouseEvent) => {
        e.preventDefault()
        navigate(-1);
    }

    return (
        <div className="py-3">
            <a href="#" onClick={handleBack} className="back-link"><img src={imageBack} alt="back" /> Back</a>
        </div>
    )
}

export default Back;