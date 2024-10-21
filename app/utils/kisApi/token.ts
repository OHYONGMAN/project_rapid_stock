import { isServer } from '../utils';
import { supabase } from '../supabase';

let accessToken = null;
let tokenExpiration = null;
const REFRESH_MARGIN = 5 * 60 * 60 * 1000; // 만료 2시간전 갱신
const TOKEN_ID = 'default_token'; // 단일 토큰 관리용 고정 ID

// Supabase에서 토큰을 가져오는 함수
const fetchTokenFromSupabase = async () => {
  const { data, error } = await supabase
    .from('tokens')
    .select('access_token, expires_at')
    .eq('id', TOKEN_ID)
    .single();

  if (error) {
    console.error('Supabase에서 토큰을 가져오는 중 오류:', error);
    return null;
  }

  if (data) {
    accessToken = data.access_token;
    tokenExpiration = new Date(data.expires_at).getTime();
    console.log('Supabase에서 기존의 토큰을 가져왔습니다.');
    return accessToken;
  }

  return null;
};

// Supabase에 새 토큰을 저장하는 함수
const saveTokenToSupabase = async (token, expiresIn) => {
  const expirationTime = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error } = await supabase.from('tokens').upsert(
    {
      id: TOKEN_ID, // 고정된 ID 사용
      access_token: token,
      expires_at: expirationTime,
    },
    { onConflict: 'id' }, // 'id' 기준으로 중복 시 업데이트
  );

  if (error) {
    console.error('Supabase에 토큰을 저장하는 중 오류:', error);
  } else {
    console.log('새로운 토큰을 Supabase에 저장했습니다.');
  }
};

// 새로운 액세스 토큰을 API에서 가져오는 함수
const getNewToken = async () => {
  const body = {
    grant_type: 'client_credentials',
    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET,
  };

  if (!body.appkey || !body.appsecret) {
    console.error('API 자격 증명이 누락되었습니다.');
    return null;
  }

  try {
    const response = await fetch(
      'https://openapi.koreainvestment.com:9443/oauth2/tokenP',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      const data = await response.json();
      accessToken = data.access_token;
      const expiresIn = data.expires_in;

      // 만료 시간을 계산하여 Supabase에 저장
      tokenExpiration = Date.now() + expiresIn * 1000 - 60000; // 1분 안전마진
      await saveTokenToSupabase(accessToken, expiresIn);

      console.log('토큰 유효 시간 (초):', expiresIn);
      return accessToken;
    } else {
      const errorDetails = await response.json();
      console.error('토큰 발급 실패:', errorDetails);
      return null;
    }
  } catch (error) {
    console.error('새 토큰 요청 중 오류 발생:', error);
    return null;
  }
};

// 유효한 토큰을 가져오는 함수
export const getValidToken = async () => {
  if (!accessToken || Date.now() >= tokenExpiration - REFRESH_MARGIN) {
    console.log(
      '토큰이 만료되었거나 없습니다. Supabase에서 토큰을 가져옵니다.',
    );
    const token = await fetchTokenFromSupabase();

    if (token && Date.now() < tokenExpiration - REFRESH_MARGIN) {
      console.log('Supabase에서 가져온 토큰이 유효합니다.');
      return token;
    } else {
      console.log(
        'Supabase에서 유효한 토큰을 찾지 못했습니다. 새로운 토큰을 요청합니다.',
      );
      return await getNewToken();
    }
  }

  console.log('기존의 유효한 토큰을 사용합니다.');
  return accessToken;
};

// 유효한 토큰을 사용해 API 호출하는 함수
export const makeAuthorizedRequest = async (url, options) => {
  let token = await getValidToken();

  if (!token) {
    throw new Error('유효한 토큰을 얻지 못했습니다.');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorDetails = await response.json();
    if (errorDetails.msg_cd === 'EGW00123') {
      console.log('토큰이 만료되었습니다. 새 토큰을 요청 중...');
      token = await getNewToken();

      if (token) {
        return await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }

    throw new Error(`HTTP 오류 발생! 상태 코드: ${response.status}`);
  }

  return response.json();
};

// 초기 토큰 가져오기 (클라이언트 사이드)
if (!isServer) {
  getValidToken();
}
