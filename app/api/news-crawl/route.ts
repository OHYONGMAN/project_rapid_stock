import main from './crawl/crawl.ts';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await main(); // 비동기 함수 호출
    return NextResponse.json({ message: '크롤링이 완료되었습니다.' });
  } catch (error) {
    console.error('크롤링 중 오류 발생:', error);
    return NextResponse.json(
      { message: '크롤링 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
