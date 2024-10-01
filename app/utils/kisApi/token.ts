// KIS API 토큰 관리

let accessToken: string | null = null;
let tokenExpiration: number | null = null;

// 새 토큰을 발급하는 함수
const getNewToken = async (): Promise<string | null> => {
  // 기존 토큰이 있다면 먼저 폐기
  if (accessToken) {
    await revokeToken(accessToken);
  }

  const body = {
    grant_type: 'client_credentials',
    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET,
  };

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_KIS_API_TOKEN_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const data = await response.json();
      accessToken = data.access_token;
      tokenExpiration = Date.now() + data.expires_in * 1000 - 60000;
      console.log(
        '새 토큰 발급 완료. 만료 시간:',
        new Date(tokenExpiration).toLocaleString(),
      );
      return accessToken;
    } else {
      console.error('토큰 발급 실패:', await response.json());
      return null;
    }
  } catch (error) {
    console.error('토큰 발급 중 에러 발생:', error);
    return null;
  }
};

// 유효한 토큰을 반환하는 함수
export const getValidToken = async (): Promise<string | null> => {
  if (!accessToken || !tokenExpiration || Date.now() >= tokenExpiration) {
    console.log('토큰이 만료되었거나 곧 만료됩니다. 새로운 토큰을 발급합니다.');
    return await getNewToken();
  }

  console.log('유효한 토큰이 있습니다. 기존 토큰을 사용합니다.');
  return accessToken;
};

// 토큰 갱신을 강제로 실행하는 함수
export const forceTokenRefresh = async (): Promise<string | null> => {
  console.log('토큰 갱신을 강제로 실행합니다.');
  if (accessToken) {
    await revokeToken(accessToken);
  }
  accessToken = null;
  tokenExpiration = null;
  return await getNewToken();
};

// 토큰 폐기 함수
const revokeToken = async (token: string): Promise<void> => {
  const body = {
    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET,
    token: token,
  };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_KIS_API_BASE_URL}/oauth2/revokeP`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      console.log('토큰 폐기 성공');
    } else {
      console.error('토큰 폐기 실패:', await response.json());
    }
  } catch (error) {
    console.error('토큰 폐기 중 에러 발생:', error);
  }
};

// 토큰 폐기 함수를 호출하는 함수
export const cleanupToken = async (): Promise<void> => {
  if (accessToken) {
    await revokeToken(accessToken);
    accessToken = null;
    tokenExpiration = null;
    console.log('토큰이 폐기되었습니다.');
  } else {
    console.log('폐기할 토큰이 없습니다.');
  }
};
