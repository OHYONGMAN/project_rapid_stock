import { GetRefreshToken } from './getToken';

export default async function StockMarket() {
    const url = 'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-indexchartprice';
    const CLIENT_ID = process.env.NEXT_PUBLIC_KIS_API_KEY;
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_KIS_API_SECRET;

    const fetchTopStock = async () => {
        const token = await GetRefreshToken(null);

        if (!token) {
            console.error('유효한 토큰이 없습니다.');
            return null;
        }

        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: 'U',
            FID_INPUT_ISCD: '0001',
            FID_INPUT_DATE_1: '2024-10-01',
            FID_INPUT_DATE_2: '2024-10-02',
            FID_PERIOD_DIV_CODE: 'D',
        });

        try {
            const response = await fetch(`${url}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${token}`,
                    appkey: CLIENT_ID || '',
                    appsecret: CLIENT_SECRET || '',
                    tr_id: 'FHPST01390000',
                    custtype: 'P',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('주식 데이터:', data); // 전체 데이터 확인
                return data.output2;
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

    const StockMarketData = await fetchTopStock();

    return (
        <div className='max-w-4xl mx-auto mt-16'>
            <h2 className='text-2xl font-semibold mb-4'>업종별 차트 데이터</h2>
            <h3 className='text-lg font-semibold mb-4'>일자별 매도량</h3>
            {StockMarketData ? (
                <table className='w-full table-auto border-collapse text-center border-t-2 border-black'>
                    <thead>
                        <tr className='border-b'>
                            <th className='py-4'>일자</th>
                            <th className='py-4'>매도량</th>
                            <th className='py-4'>매도량 비율</th>
                            <th className='py-4'>매도금액</th>
                            <th className='py-4'>매도금액 비율</th>
                        </tr>
                    </thead>
                    <tbody>
                        {StockMarketData.map((stock: any, index: number) => (
                            <tr key={index} className='border-b hover:bg-gray-100'>
                                <td className='py-4 px-2'>{stock.stck_bsop_date}</td>
                                <td className='py-4 px-2'>{stock.arbt_entm_seln_vol}</td> {/* 매도량 */}
                                <td className='py-4 px-2'>{stock.arbt_entm_seln_vol_rate}%</td> {/* 매도량 비율 */}
                                <td className='py-4 px-2'>{stock.arbt_entm_seln_tr_pbmn}</td> {/* 매도금액 */}
                                <td className='py-4 px-2'>{stock.arbt_entm_seln_tr_pbmn_rate}%</td> {/* 매도금액 비율 */}
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
