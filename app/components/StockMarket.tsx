import { GetRefreshToken } from './getToken';

export default async function StockMarket() {
    const url = 'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-vi-status';
    const CLIENT_ID = process.env.NEXT_PUBLIC_STOCK_API_KEY;
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_APP_SECRET;

    const fetchTopStock = async () => {
        let token = await GetRefreshToken(null);

        if (!token) {
            console.error('유효한 토큰이 없습니다.');
            return null;
        }

        const params = new URLSearchParams({
            FID_DIV_CLS_CODE: '0',
            FID_COND_SCR_DIV_CODE: '20139',
            FID_MRKT_CLS_CODE: '0',
            FID_INPUT_ISCD: '',
            FID_RANK_SORT_CLS_CODE: '0',
            FID_INPUT_DATE_1: '20240126',
            FID_TRGT_CLS_CODE: '',
            FID_TRGT_EXLS_CLS_CODE: '',
        });

        try {
            let response = await fetch(`${url}?${params.toString()}`, {
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

            // 401 오류 처리
            if (response.status === 401) {
                console.log('토큰이 만료되어 새로 발급합니다.');
                token = await GetRefreshToken(response);
                response = await fetch(`${url}?${params.toString()}`, {
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
            }

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
                    <thead>
                        <tr className='border-b'>
                            <th className='py-4'>종목명</th>
                            <th className='py-4'>종목 코드</th>
                            <th className='py-4'>현재가</th>
                            <th className='py-4'>전일 대비</th>
                            <th className='py-4'>변동률</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topStock.map((stock: any, index: number) => (
                            <tr key={index} className='border-b hover:bg-g-100'>
                                <td className='py-4 px-2'>{stock.hts_kor_isnm}</td>
                                <td className='py-4 px-2'>{stock.mksc_shrn_iscd}</td>
                                <td className='py-4 px-2'>{stock.vi_prc}</td>
                                <td className={`py-4 px-2 ${stock.vi_dmc_dprt > 0 ? 'text-primary' : 'text-blue-500'}`}>{stock.vi_dmc_dprt > 0 ? `+${stock.vi_dmc_dprt}%` : `${stock.vi_dmc_dprt}%`}</td>
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
