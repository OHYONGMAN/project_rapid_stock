'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase.ts';
import Link from 'next/link';

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
    .limit(6);

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  return data as NewsItem[];
}

const handleNewsClick = (newsId: number, newsTitle: string) => {
  const currentHistory = JSON.parse(
    localStorage.getItem('newsHistory') || '[]',
  );

  const updatedHistory = [
    { id: newsId, title: newsTitle },
    ...currentHistory.filter(
      (item: { id: number; title: string }) => item.id !== newsId,
    ),
  ];

  const limitedHistory = updatedHistory.slice(0, 5);

  localStorage.setItem('newsHistory', JSON.stringify(limitedHistory));

  if (typeof window !== 'undefined' && window.updateRecentNews) {
    window.updateRecentNews();
  }
};

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
      <div className="grid grid-cols-3 gap-x-8 gap-y-8">
        {newsItems.map((news) => (
          <div key={news.id} className="flex gap-4">
            <img
              src={news.image}
              alt={news.title}
              className="h-14 w-20 rounded-lg"
            />
            <div className="flex flex-col">
              <Link
                href={`/news/${news.id}`}
                onClick={() => handleNewsClick(news.id, news.title)}
              >
                <h3
                  className="font-semibold line-clamp-2"
                  style={{
                    overflowWrap: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                  onClick={() => handleNewsClick(news.id, news.title)}
                >
                  {news.title}
                </h3>
              </Link>
              <p className="text-g-600 py-2">{news.date}</p>
              <div className="flex gap-2 pt-3 border-t border-g-400">
                <p className="py-1 min-w-14">관련주식</p>
                <div className="flex gap-2 flex-wrap">
                  {news.keyword.map((kw, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 px-2 py-1 rounded-md text-g-900"
                    >
                      {kw}
                    </span>
                  ))}{' '}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
