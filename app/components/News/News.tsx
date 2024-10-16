'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase.ts';
import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';

interface NewsItem {
  id: number;
  image: string;
  title: string;
  date: string;
  keyword: string[];
}

async function fetchNews() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('date', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  return data as NewsItem[];
}

export default function MainNews() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNews().then((news) => {
      setNewsItems(news);
    });
  }, []);

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-4 text-2xl font-semibold">오늘의 뉴스</h2>
      <div className="grid grid-cols-2 gap-4">
        {newsItems.map((news) => (
          <div key={news.id} className="flex items-center gap-8">
            <img
              src={news.image}
              alt={news.title}
              className="h-20 w-32 rounded-lg object-cover"
            />
            <div className="flex flex-col gap-2">
              <Link href={`/news/${news.id}`}>
                <h3
                  className="font-semibold"
                  onClick={() => handleNewsClick(news.id, news.title)}
                >
                  {news.title}
                </h3>
              </Link>
              <p>{news.date}</p>
              <div>{news.keyword.join(', ')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
