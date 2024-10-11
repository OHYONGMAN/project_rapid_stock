// app/utils/kisApi/token.ts

import { isServer } from "../utils";

// 토큰 관련 변수
let accessToken: string | null = null; // 발급된 액세스 토큰 저장
let tokenExpiration: number | null = null; // 토큰 만료 시간
let isTokenRefreshing = false; // 토큰 갱신 중 상태 플래그

// 새로운 액세스 토큰을 발급하는 함수
const getNewToken = async (): Promise<string | null> => {
  const body = {
    grant_type: "client_credentials",
    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET,
  };

  // API 자격 증명이 누락된 경우 오류 처리
  if (!body.appkey || !body.appsecret) {
    console.error("API 자격 증명이 누락되었습니다.");
    return null;
  }

  try {
    // 새로운 토큰을 발급 요청
    const response = await fetch(
      `https://openapi.koreainvestment.com:9443/oauth2/tokenP`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    // 응답이 성공적인 경우
    if (response.ok) {
      const data = await response.json();
      accessToken = data.access_token;

      // 만료 시간을 설정 (1분 전으로 설정)
      tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000;

      // 브라우저 저장소에 토큰 저장 (서버일 경우 제외)
      if (!isServer) {
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        localStorage.setItem("tokenExpiration", tokenExpiration.toString());
      }

      console.log("토큰 유효기간 (초):", data.expires_in);
      return accessToken;
    } else {
      // 토큰 발급 실패 시 오류 처리
      const errorDetails = await response.json();
      console.error("토큰 발급 실패:", errorDetails);
      return null;
    }
  } catch (error) {
    // 네트워크 오류 처리
    console.error("토큰 발급 중 네트워크 에러 발생:", error);
    return null;
  }
};

// 유효한 토큰을 가져오는 함수
export const getValidToken = async (): Promise<string | null> => {
  // 이미 토큰을 갱신 중인 경우 대기
  if (isTokenRefreshing) {
    console.log("토큰 발급 중입니다. 기다리세요...");
    while (isTokenRefreshing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return accessToken;
  }

  // 브라우저에 저장된 토큰이 있는지 확인
  if (!isServer) {
    const storedToken = localStorage.getItem("accessToken");
    const storedExpiration = localStorage.getItem("tokenExpiration");
    if (storedToken && storedExpiration) {
      accessToken = storedToken;
      tokenExpiration = parseInt(storedExpiration, 10);
    }
  }

  // 유효한 토큰이 있을 경우 그대로 반환
  if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
    console.log("유효한 토큰이 있습니다. 기존 토큰을 사용합니다.");
    return accessToken;
  }

  // 토큰이 없거나 만료된 경우 새로운 토큰 요청
  console.log("토큰이 만료되었거나 없습니다. 새로운 토큰을 요청합니다.");
  isTokenRefreshing = true;

  try {
    const token = await getNewToken();
    return token;
  } finally {
    isTokenRefreshing = false;
  }
};

// API 호출 시 유효한 토큰을 받아와서 요청을 처리하는 함수
export const makeAuthorizedRequest = async (url: string, options: any) => {
  let token = await getValidToken();
  if (!token) {
    throw new Error("토큰 발급 실패");
  }

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  });

  // 만약 토큰이 만료되었을 경우 새로운 토큰을 받아서 재시도
  if (!response.ok) {
    const errorDetails = await response.json();
    if (errorDetails.msg_cd === "EGW00123") { // 토큰 만료 코드
      console.log("토큰이 만료되었습니다. 새 토큰을 요청 중...");
      token = await getNewToken();

      if (token) {
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            authorization: `Bearer ${token}`,
          },
        });
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류 발생! 상태 코드: ${response.status}`);
    }
  }

  return response.json();
};

// 액세스 토큰을 폐기하는 함수
const revokeToken = async (token: string): Promise<void> => {
  const body = {
    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET,
    token: token,
  };

  try {
    const response = await fetch(
      `https://openapi.koreainvestment.com:9443/oauth2/revokeP`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      console.log("토큰 폐기 성공");
    } else {
      console.error("토큰 폐기 실패:", await response.json());
    }
  } catch (error) {
    console.error("토큰 폐기 중 에러 발생:", error);
  }
};
