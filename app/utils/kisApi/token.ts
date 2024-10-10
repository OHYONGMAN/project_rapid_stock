// app/utils/kisApi/token.ts

import { isServer } from "../utils";

let accessToken: string | null = null;
let tokenExpiration: number | null = null;
let isTokenRefreshing = false;

const getNewToken = async (): Promise<string | null> => {
  const body = {
    grant_type: "client_credentials",
    appkey: process.env.NEXT_PUBLIC_KIS_API_KEY,
    appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET,
  };

  if (!body.appkey || !body.appsecret) {
    console.error("API 자격 증명이 누락되었습니다.");
    return null;
  }

  try {
    const response = await fetch(
      `https://openapi.koreainvestment.com:9443/oauth2/tokenP`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      const data = await response.json();
      accessToken = data.access_token;

      // API 응답의 만료 시간을 설정
      tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000; // 만료 시간을 1분 빼서 설정

      // 토큰을 브라우저에 저장
      if (!isServer) {
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        localStorage.setItem("tokenExpiration", tokenExpiration.toString());
      }

      console.log("토큰 유효기간 (초):", data.expires_in);
      return accessToken;
    } else {
      const errorDetails = await response.json();
      console.error("토큰 발급 실패:", errorDetails);
      return null;
    }
  } catch (error) {
    console.error("토큰 발급 중 네트워크 에러 발생:", error);
    return null;
  }
};

export const getValidToken = async (): Promise<string | null> => {
  if (isTokenRefreshing) {
    console.log("토큰 발급 중입니다. 기다리세요...");
    while (isTokenRefreshing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return accessToken;
  }

  // 브라우저 저장된 토큰이 있는지 확인
  if (!isServer) {
    const storedToken = localStorage.getItem("accessToken");
    const storedExpiration = localStorage.getItem("tokenExpiration");
    if (storedToken && storedExpiration) {
      accessToken = storedToken;
      tokenExpiration = parseInt(storedExpiration, 10);
    }
  }

  // 유효한 토큰이 있으면 사용
  if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
    console.log("유효한 토큰이 있습니다. 기존 토큰을 사용합니다.");
    return accessToken;
  }

  // 토큰이 없거나 만료되었을 때 새로운 토큰을 요청
  console.log("토큰이 만료되었거나 없습니다. 새로운 토큰을 요청합니다.");
  isTokenRefreshing = true;

  try {
    const token = await getNewToken();
    return token;
  } finally {
    isTokenRefreshing = false;
  }
};

// API 호출 시 유효한 토큰을 받아와서 사용
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

  // 토큰이 만료되어 500 에러가 발생했을 때, 새로운 토큰을 발급받고 재시도
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  return response.json();
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
