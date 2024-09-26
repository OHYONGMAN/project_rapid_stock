'use client';
import React, { useEffect, useState } from 'react';

const Tables: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    const [topTradedStocks, setTopTradedStocks] = useState([]);

    const appKey = 'PSdHNByWrAtHQHJdgPni4klEcS2UhsjmyBqn';
    const appSecret = 'd4H+5BzaVvA4EQGe4gUAVfjQF9erxySxkfk8aCRW9TUTShnoKMOY6XqOOotCnD83MUx8RZL6s3h7qNfoOesFdoaW1IOt2e7hjcn24AD996UMFmu1mBE0UIMNxAFv4Ow3Om7MqI4s7x11zEi0fJTDfgPfEwYyc6E77+6Kphmny3F6S9kJaCY=';

    const getAccessToken = async () => {
        const url = 'https://openapi.koreainvestment.com:9443/oauth2/token';

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('appkey', appKey);
        params.append('appsecret', appSecret);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                },
                body: params.toString(),
            });

            const data = await response.json();
            setToken(data.access_token);
            fetchTopStocks(data.access_token);
            console.log(response);
        } catch (err) {
            console.error(`토큰을 불러오는 데 실패했습니다: ${err.message}`);
        }
    };

    const fetchTopStocks = async (accessToken: string) => {
        const url = 'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/volume-rank';

        const headers = {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${accessToken}`,
            appkey: appKey,
            appsecret: appSecret,
        };
        const queryParams = new URLSearchParams({
            tr_id: 'FHPST01710000',
        });

        try {
            const response = await fetch(`${url}?${queryParams.toString()}`, {
                method: 'GET',
                headers: headers,
                // body: JSON.stringify({
                //     FID_COND_MRKT_DIV_CODE: 'J',
                //     FID_COND_SCR_DIV_CODE: '20171',
                //     FID_INPUT_ISCD: '0000',
                //     FID_DIV_CLS_CODE: '0',
                //     FID_BLNG_CLS_CODE: '0',
                //     FID_TRGT_CLS_CODE: '111111111',
                //     FID_TRGT_EXLS_CLS_CODE: '000000',
                //     FID_INPUT_PRICE_1: '0',
                //     FID_INPUT_PRICE_2: '0',
                //     FID_VOL_CNT: '0',
                //     FID_INPUT_DATE_1: '0',
                // }),
            });

            const data = await response.json();
            setTopTradedStocks(data);
        } catch (err) {
            console.error(`거래 상위량을 불러오는 데 실패했습니다: ${err.message}`);
        }
    };

    useEffect(() => {
        getAccessToken();
    }, []);

    return (
        <div className='p-4'>
            {token && <div className='text-green-500'>Access Token: {token}</div>}
            <ul>
                {topTradedStocks.map((stock, index) => (
                    <li key={index}>
                        {stock.name}: {stock.volume}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Tables;
