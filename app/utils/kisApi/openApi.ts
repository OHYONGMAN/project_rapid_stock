import type { NextApiRequest, NextApiResponse } from 'next';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { idxNm, resultType = 'json', pageNo = 1, numOfRows = 10 } = req.query;

  const endpoint = `https://apis.data.go.kr/1160100/service/GetMarketIndexInfoService`;
  const url = `${endpoint}?serviceKey=${API_KEY}&resultType=${resultType}&pageNo=${pageNo}&numOfRows=${numOfRows}&idxNm=${idxNm}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
}
