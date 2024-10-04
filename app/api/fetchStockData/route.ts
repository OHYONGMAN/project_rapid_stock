import { NextResponse } from 'next/server';
import { getValidToken } from '@/app/utils/kisApi/token';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const token = await getValidToken();

  if (!token) {
    return NextResponse.json(
      { error: 'Failed to get valid token' },
      { status: 500 },
    );
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_KIS_API_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}`,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`,
          appkey: process.env.NEXT_PUBLIC_KIS_API_KEY!,
          appsecret: process.env.NEXT_PUBLIC_KIS_API_SECRET!,
          tr_id: 'FHKST01010100',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }

    const data = await response.json();
    return NextResponse.json(data.output);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 },
    );
  }
}

// fetchStockPrice 함수 정의
export async function fetchStockPrice(symbol: string) {
  const response = await fetch(`/api/fetchStockData?symbol=${symbol}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stock price');
  }
  const data = await response.json();
  return data;
}
