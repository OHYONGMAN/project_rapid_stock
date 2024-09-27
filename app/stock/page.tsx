// app/stock/page.tsx
import GetToken from '../components/getToken';

export default async function StockPage() {
    const token = await GetToken();
    const url = 'https://openapivts.koreainvestment.com:29443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice';
    const CLIENT_ID = 'PSdHNByWrAtHQHJdgPni4klEcS2UhsjmyBqn';
    const CLIENT_SECRET = 'd4H+5BzaVvA4EQGe4gUAVfjQF9erxySxkfk8aCRW9TUTShnoKMOY6XqOOotCnD83MUx8RZL6s3h7qNfoOesFdoaW1IOt2e7hjcn24AD996UMFmu1mBE0UIMNxAFv4Ow3Om7MqI4s7x11zEi0fJTDfgPfEwYyc6E77+6Kphmny3F6S9kJaCY=';

    const fetchStockData = async (symbol: string) => {
        const params = new URLSearchParams({
            FID_COND_MRKT_DIV_CODE: 'J',
            FID_INPUT_ISCD: symbol,
            FID_PERIOD_DIV_CODE: 'D',
        });

        try {
            const response = await fetch(`${url}?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    Authorization: `Bearer ${token}`,
                    appkey: CLIENT_ID,
                    appsecret: CLIENT_SECRET,
                    tr_id: 'FHKST01010100',
                    custtype: 'P',
                },
            });

            if (response.ok) {
                const stockData = await response.json();
                console.log('주식 데이터:', stockData);
                return stockData;
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

    const stockData = await fetchStockData('005930');

    return (
        <div>
            <h1>주식 데이터</h1>
            <pre>{JSON.stringify(stockData, null, 2)}</pre>
            <p>Access Token: {token}</p>
        </div>
    );
}
