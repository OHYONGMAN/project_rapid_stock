'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    updateRecentNews: () => void;
  }
}
import icoCloseArr from '../../../public/images/ico-closeArr.svg';
import icoOpenArr from '../../../public/images/ico-openArr.svg';
import Chats from './components/Chats';
import UserInfo from '../UserInfo/UserInfo'; // UserInfo 컴포넌트 임포트

export default function SideBar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const [username, setUsername] = useState<string | null>(null); // username 상태 추가
  const [recentNews, setRecentNews] = useState<{ id: number; title: string }[]>(
    [],
  ); // 뉴스 ID와 타이틀을 저장

  // 사용자 정보 업데이트 (username 포함)
  const handleUserChange = (email: string | null, username: string | null) => {
    setUsername(username); // username을 업데이트
  };

  // 로컬 스토리지에서 최근 본 뉴스 가져오기
  const loadRecentNews = () => {
    const storedNewsHistory = JSON.parse(
      localStorage.getItem('newsHistory') || '[]',
    );
    setRecentNews(storedNewsHistory);
  };

  // 컴포넌트가 마운트될 때 최근 본 뉴스 로드 및 전역 함수 설정
  useEffect(() => {
    loadRecentNews();

    // 전역에서 호출할 수 있도록 함수 정의
    window.updateRecentNews = loadRecentNews;

    return () => {
      // 컴포넌트가 언마운트될 때 전역 함수 삭제
      delete window.updateRecentNews;
    };
  }, []);

  return (
    <div>
      {/* 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-[36px] top-[29px] z-50 rounded-lg hover:bg-g-200"
      >
        {isOpen ? (
          <Image src={icoCloseArr} alt="닫기" />
        ) : (
          <Image src={icoOpenArr} alt="열기" />
        )}
      </button>

      {/* 사이드바 */}
      <aside
        className={`fixed right-0 top-0 flex h-full w-[480px] flex-col items-center gap-10 bg-g-100 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 리스트 섹션 */}
        <section className="pt-[36px]">
          {username ? (
            <p className="text-center">{username}님 환영합니다.</p> // username으로 변경
          ) : (
            <p className="text-center">환영합니다.</p>
          )}
          <div className="w-[360px] pt-5">
            <h3 className="mb-2 text-xl font-bold">최근 본 뉴스</h3>
            <ul>
              {/* 최근 본 뉴스 타이틀 표시 */}
              {recentNews.length > 0 ? (
                recentNews.map((news) => (
                  <li key={news.id}>
                    <a className="hover:text-red-500" href={`/news/${news.id}`}>
                      {news.title.length > 28
                        ? `${news.title.slice(0, 28)}...`
                        : news.title}
                    </a>
                  </li>
                ))
              ) : (
                <li>최근 본 뉴스가 없습니다.</li>
              )}
            </ul>
          </div>
        </section>

        {/* UserInfo 컴포넌트 */}
        <UserInfo onUserChange={handleUserChange} />

        <Chats />
      </aside>
    </div>
  );
}
