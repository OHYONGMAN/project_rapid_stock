// import type { NextApiRequest, NextApiResponse } from 'next';

const GetToken = async () => {
    const url = 'https://openapivts.koreainvestment.com:29443/oauth2/tokenP';
    const CLIENT_ID = 'PSdHNByWrAtHQHJdgPni4klEcS2UhsjmyBqn';
    const CLIENT_SECRET = 'd4H+5BzaVvA4EQGe4gUAVfjQF9erxySxkfk8aCRW9TUTShnoKMOY6XqOOotCnD83MUx8RZL6s3h7qNfoOesFdoaW1IOt2e7hjcn24AD996UMFmu1mBE0UIMNxAFv4Ow3Om7MqI4s7x11zEi0fJTDfgPfEwYyc6E77+6Kphmny3F6S9kJaCY=';
    const body = {
        grant_type: 'client_credentials',
        appkey: CLIENT_ID,
        appsecret: CLIENT_SECRET,
    };
    try {
        const response = await fetch(url, {
            cache: 'no-store',
            next: { revalidate: 3 },
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (response.ok) {
            console.log('발급된 Access Token:', data.access_token);
            return data.access_token;
        } else {
            console.error('토큰 발급 실패:', data);
            return null;
        }
    } catch (error) {
        console.error('토큰 발급 중 에러 발생:', error);
        return null;
    }
};

export default GetToken;
