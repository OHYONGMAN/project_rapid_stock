'use client';

// _app.tsx
import { useEffect } from 'react';

function Home() {
  useEffect(() => {
    // 서버의 API 라우트를 호출하여 크롤링 작업을 실행
    fetch('/api/news-crawl')
      .then((response) => response.json())
      .then((data) => console.log(data.message))
      .catch((error) => console.error('Error:', error));
  }, []);

  return <div>뉴스 크롤링 실행 중...</div>;
}

export default Home;
