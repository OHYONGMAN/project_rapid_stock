let accessToken: string | null = null;
let expiredToken: number | null = null;

// 새로운 토큰 발급 함수
const GetToken = async (): Promise<string | null> => {
    const url = 'https://openapi.koreainvestment.com:9443/oauth2/tokenP';
    const CLIENT_ID = process.env.NEXT_PUBLIC_KIS_API_KEY;
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_KIS_API_SECRET;
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
        console.log('토큰 요청 응답:', data); // 응답 데이터 로깅

        if (response.ok && data.access_token) {
            accessToken = data.access_token;
            expiredToken = Date.now() + data.expires_in * 1000; // expires_in을 초 단위로 계산
            console.log('발급된 Access Token:', accessToken);
            console.log('토큰 만료 시간:', new Date(expiredToken)); // 만료 시간 로깅
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

// Access Token 갱신 및 반환 함수
const GetRefreshToken = async (response: Response | null = null): Promise<string | null> => {
    // 이미 발급된 토큰이 있는지 확인
    if (accessToken && expiredToken && Date.now() < expiredToken - 5 * 60 * 1000) {
        console.log('유효한 Access Token을 사용합니다:', accessToken);
        return accessToken; // 만료되지 않은 토큰을 반환
    }

    // 응답에 따라 토큰 만료 처리 (401 에러 확인)
    if (response && response.status === 401) {
        console.log('서버 응답으로 토큰이 만료되었습니다. 새 토큰을 발급합니다.');
    } else {
        console.log('토큰이 만료되었거나 유효한 토큰이 없습니다. 새 토큰을 발급합니다.');
    }

    // 새로운 토큰 요청
    const newToken = await GetToken();
    if (!newToken) {
        console.error('새로운 토큰을 발급받지 못했습니다.');
        return null;
    }

    console.log('새로 발급된 Access Token:', newToken);
    return newToken;
};

export { GetToken, GetRefreshToken };
