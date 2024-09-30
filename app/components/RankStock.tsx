import { getRefreshToken } from './getToken';
import Image from 'next/image';
import stockup from '../../public/images/ico-stockup.svg';
import stockdown from '../../public/images/ico-stockdown.svg';

export default async function StockPage() {
    const token = await getRefreshToken(null);
    const url = 'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/volume-rank';
    const CLIENT_ID = process.env.NEXT_PUBLIC_STOCK_API_KEY;
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_APP_SECRET;

    const fetchTopStock = async () => {
        if (!token) {
            console.error('유효한 토큰이 없습니다.');
            return null;
        }

        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: 'J', // 한국 주식 시장
            FID_COND_SCR_DIV_CODE: '20171', // 특정 화면 조건 코드
            FID_INPUT_ISCD: '0000', // 입력 종목 코드, 전체 종목 조회
            FID_DIV_CLS_CODE: '0', // 분류 구분 코드 = 전체
            FID_BLNG_CLS_CODE: '0', // 평균거래량
            FID_TRGT_CLS_CODE: '111111111', // 증거금 구분
            FID_TRGT_EXLS_CLS_CODE: '0000000000', // 제외할 대상 구분
            FID_INPUT_PRICE_1: '0', // 가격 범위 설정
            FID_INPUT_PRICE_2: '1000000', // 가격 범위 설정
            FID_VOL_CNT: '100000', // 거래량 범위 설정
            FID_INPUT_DATE_1: '', // 공란 입력
        });

        try {
            const response = await fetch(`${url}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${token}`,
                    appkey: CLIENT_ID || '',
                    appsecret: CLIENT_SECRET || '',
                    tr_id: 'FHPST01710000',
                    custtype: 'P',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('주식 데이터:', data);
                return data.output.slice(0, 10);
            } else {
                const errorData = await response.json();
                console.error('주식 데이터 요청 실패:', errorData);
                return null;
            }
        } catch (error) {
            console.error('주식 데이터 요청 중 에러 발생:', error);
            return null;
        }
    };

    const topStock = await fetchTopStock();

    return (
        <div className='max-w-4xl mx-auto mt-16 mx-20'>
            <h2 className='text-2xl font-semibold mb-4'>TOP 종목</h2>
            <h3 className='text-lg font-semibold mb-4'>거래 상위</h3>
            {topStock ? (
                <table className='w-full table-auto border-collapse text-center border-t-2 border-black'>
                    <tbody>
                        {topStock.map((stock: any, index: number) => (
                            <tr key={index} className='border-b hover:bg-g-100'>
                                <td className='py-4 px-2'>{index + 1}</td>
                                <td className='py-4 px-2'>{stock.hts_kor_isnm}</td>
                                <td className='py-4 px-2'>{stock.stck_prpr}</td>
                                <td className='py-4 px-2'>
                                    {stock.prdy_vrss > 0 ? (
                                        <div className='flex items-center justify-center text-primary'>
                                            <Image src={stockup} alt='상승' width={16} height={16} />
                                            <span className='ml-2'>{stock.prdy_vrss}</span>
                                        </div>
                                    ) : (
                                        <div className='flex items-center justify-center text-blue-500'>
                                            <Image src={stockdown} alt='하락' width={16} height={16} />
                                            <span className='ml-2'>{stock.prdy_vrss}</span>
                                        </div>
                                    )}
                                </td>
                                <td className={`py-4 px-2 ${stock.prdy_ctrt > 0 ? 'text-primary' : 'text-blue-500'}`}>{stock.prdy_ctrt > 0 ? `+${stock.prdy_ctrt}%` : `${stock.prdy_ctrt}%`}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>주식 데이터를 불러오는 중입니다...</p>
            )}
        </div>
    );
}
