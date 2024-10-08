// KIS API 토큰 관리

// 현재 액세스 토큰과 만료 시간 변수
let accessToken: string | null = null;
let tokenExpiration: number | null = null;

// 새 토큰을 발급하는 함수
// 이 함수는 토큰이 없거나 만료되었을 때 호출됩니다.
const getNewToken = async (): Promise<string | null> => {
  // 기존 토큰이 있다면 먼저 폐기
  if (accessToken) {
    await revokeToken(accessToken);
  }

  // 토큰 발급 요청에 필요한 데이터
  const body = {
    grant_type: 'client_credentials',
    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET,
  };

  try {
    // 토큰 발급 요청
    const response = await fetch(process.env.NEXT_PUBLIC_KIS_API_TOKEN_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      // 토큰 발급 성공 시
      const data = await response.json();
      accessToken = data.access_token;
      tokenExpiration = Date.now() + data.expires_in * 1000 - 60000; // 만료 시간 설정
      console.log(
        '새 토큰 발급 완료. 만료 시간:',
        new Date(tokenExpiration).toLocaleString(),
      );
      return accessToken;
    } else {
      // 토큰 발급 실패 시
      console.error('토큰 발급 실패:', await response.json());
      return null;
    }
  } catch (error) {
    // 요청 중 에러 발생 시
    console.error('토큰 발급 중 에러 발생:', error);
    return null;
  }
};

// 유효한 토큰을 반환하는 함수
// 이 함수는 항상 유효한 토큰을 반환하기 위해 호출됩니다.
export const getValidToken = async (): Promise<string | null> => {
  // 토큰이 없거나 만료되었으면 새 토큰 발급
  if (!accessToken || !tokenExpiration || Date.now() >= tokenExpiration) {
    console.log('토큰이 만료되었거나 곧 만료됩니다. 새로운 토큰을 발급합니다.');
    return await getNewToken();
  }

  // 유효한 토큰이 있으면 기존 토큰 사용
  console.log('유효한 토큰이 있습니다. 기존 토큰을 사용합니다.');
  return accessToken;
};

// 토큰 폐기 함수
// 이 함수는 기존 토큰을 폐기할 때 호출됩니다.
const revokeToken = async (token: string): Promise<void> => {
  // 토큰 폐기 요청에 필요한 데이터
  const body = {
    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET,
    token: token,
  };

  try {
    // 토큰 폐기 요청
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_KIS_API_BASE_URL}/oauth2/revokeP`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      // 토큰 폐기 성공 시
      console.log('토큰 폐기 성공');
    } else {
      // 토큰 폐기 실패 시
      console.error('토큰 폐기 실패:', await response.json());
    }
  } catch (error) {
    // 요청 중 에러 발생 시
    console.error('토큰 폐기 중 에러 발생:', error);
  }
};
