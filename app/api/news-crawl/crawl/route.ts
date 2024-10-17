import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

//  설명
// 아래의 코드는 data.json 파일의 내용을 GET 요청을 통해 반환하는 코드입니다.
export async function GET() {
  const filePath = path.join(
    process.cwd(),
    'app/api/news-crawl/crawl/data.json',
  );
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json(
      { message: '파일을 읽을 수 없습니다.' },
      { status: 500 },
    );
  }
}
