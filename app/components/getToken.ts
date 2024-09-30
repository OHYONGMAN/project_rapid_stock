let accessToken: string | null = null;
let expiredToken: number | null = null;

const GetToken = async (): Promise<string | null> => {
    const url = 'https://openapivts.koreainvestment.com:29443/oauth2/tokenP';
    const CLIENT_ID = process.env.NEXT_PUBLIC_STOCK_API_KEY;
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_APP_SECRET;
    const body = {
        grant_type: 'client_credentials',
        appkey: CLIENT_ID,
        appsecret: CLIENT_SECRET,
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        if (response.ok) {
            console.log('발급된 Access Token:', data.access_token);
            accessToken = data.access_token;
            expiredToken = Date.now() + data.expires_in * 21600000;
            return accessToken;
        } else {
            console.error('토큰 발급 실패:', data);
            return null;
        }
    } catch (error) {
        console.error('토큰 발급 중 에러 발생:', error);
        return null;
    }
};

// Access Token 갱신, 반환
const getRefreshToken = async (response: Response | null): Promise<string | null> => {
    const isTokenExpired = !accessToken || !expiredToken || Date.now() >= expiredToken;

    if ((response && response.status === 401) || isTokenExpired) {
        console.log('Access Token이 만료되어 새로 발급합니다.');
        const newToken = await GetToken();
        if (!newToken) {
            console.error('새로운 토큰을 발급받지 못했습니다.');
            return null;
        }
        return newToken;
    }

    console.log('유효한 Access Token을 사용합니다.');
    return accessToken;
};

export { GetToken, getRefreshToken };
