import imagePrev from '../../img/pagination/prev.png';
import imageNext from '../../img/pagination/next.png';
import { useEffect, useState } from 'react';

interface PaginationProps {
    max: number;
    handleChangePage: (page: number) => void;
    page: number;
}

const Pagination = ({ max = 0, handleChangePage, page }: PaginationProps) => {
    const [current, setCurrent] = useState(page)

    useEffect(() => {
        if (current !== page) {
            setCurrent(page)
        }
    }, [page])

    const handlePage = (e: any) => {
        if (e.key === 'Enter') {
            let pageCurrent = e.target.value;
            if (pageCurrent < 1) {
                pageCurrent = 1;
            } else if (pageCurrent > max) {
                pageCurrent = max
            }
            setCurrent(pageCurrent)
            handleChangePage(pageCurrent)
        }
    }

    const handleOnChange = (e: any) => {
        let value = e.target.value;
        if (value < 1) {
            setCurrent(value)
        } else if (value) {
            setCurrent(value)
        }
    }
    return (
        <div className="wrap-pagination">
            <div className="pagination">
                <span onClick={() => handleChangePage(current <= 1 ? 1: current - 1)} className={`previous ${current <= 1 ? 'disable' : ''}`}><img src={imagePrev} alt="previous" /></span>
                    <input type="number" onKeyDown={handlePage} onChange={handleOnChange} className="paged" value={current} />
                <span>of { max }</span>
                <span onClick={() => handleChangePage(current >= max ? max: current + 1)} className={`next ${current >= max ? 'disable' : ''}`}><img src={imageNext} alt="next" /></span>
            </div>
        </div>
    )
}
export default Pagination