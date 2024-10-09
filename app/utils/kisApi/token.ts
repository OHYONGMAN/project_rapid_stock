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
    console.error("Missing API credentials");
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
      tokenExpiration = Date.now() + data.expires_in * 1000 - 60000; // 만료 시간을 1분 빼서 설정

      if (!isServer) {
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        localStorage.setItem("tokenExpiration", tokenExpiration.toString());
      }

      console.log("토큰 유효기간 (초):", data.expires_in);
      console.log(
        "새 토큰 발급 완료. 만료 시간:",
        new Date(tokenExpiration).toLocaleString(),
      );

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

  if (!isServer) {
    const storedToken = localStorage.getItem("accessToken");
    const storedExpiration = localStorage.getItem("tokenExpiration");
    if (storedToken && storedExpiration) {
      accessToken = storedToken;
      tokenExpiration = parseInt(storedExpiration, 10);
    }
  }

  if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
    console.log("유효한 토큰이 있습니다. 기존 토큰을 사용합니다.");
    return accessToken;
  }

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
  const token = await getValidToken();
  if (!token) {
    throw new Error("토큰 발급 실패");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

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

export const cleanupToken = async (): Promise<void> => {
  if (accessToken) {
    await revokeToken(accessToken);
    accessToken = null;
    tokenExpiration = null;

    if (!isServer) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("tokenExpiration");
    }

    console.log("토큰이 폐기되었습니다.");
  }
};
