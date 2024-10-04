import type { NextApiRequest, NextApiResponse } from 'next';
import { getValidToken } from './token';

const url =
  'https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/volume-rank';
const CLIENT_ID = process.env.NEXT_PUBLIC_KIS_API_KEY;
const CLIENT_SECRET = process.env.NEXT_PUBLIC_KIS_API_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const token = await getValidToken();

  if (!token) {
    res.status(401).json({ message: '유효한 토큰이 없습니다.' });
    return;
  }

  const params = new URLSearchParams({
    FID_COND_MRKT_DIV_CODE: 'J',
    FID_COND_SCR_DIV_CODE: '20171',
    FID_INPUT_ISCD: '0000',
    FID_DIV_CLS_CODE: '0',
    FID_BLNG_CLS_CODE: '0',
    FID_TRGT_CLS_CODE: '111111111',
    FID_TRGT_EXLS_CLS_CODE: '0000000000',
    FID_INPUT_PRICE_1: '0',
    FID_INPUT_PRICE_2: '1000000',
    FID_VOL_CNT: '100000',
    FID_INPUT_DATE_1: '',
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${token}`,
        appkey: CLIENT_ID || '',
        appsecret: CLIENT_SECRET || '',
        tr_id: 'FHPST01710000',
        custtype: 'P',
      },
    });

    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data.output.slice(0, 10));
    } else {
      const errorData = await response.json();
      res
        .status(response.status)
        .json({ message: '주식 데이터 요청 실패', errorData });
    }
  } catch (error) {
    res.status(500).json({ message: '주식 데이터 요청 중 에러 발생', error });
  }
}
