'use client';
import React, { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
  links?: { name: string; url: string }[];
}

const Header: React.FC<HeaderProps> = ({ links = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(searchTerm); // 현재 상태에서는 콘솔에만 출력
    // 추후 검색 기능 로직 추가 가능
  };

  return (
    <header className="border-b border-g-400">
      <div className="container mx-auto flex items-center justify-between py-6">
        <h1>
          <Link href="/">
            <img
              src="/images/logo.svg"
              alt="rapid stock"
              className="w-[190px] h-[34px]"
            />
          </Link>
        </h1>
        <nav>
          <ul className="flex gap-12 md:gap-4 text-lg font-semibold">
            {links.length > 0 ? (
              links.map((link) => (
                <li key={`${link.name}-${link.url}`}>
                  <Link href={link.url}>{link.name}</Link>
                </li>
              ))
            ) : (
              <li>No links available</li> // 링크가 없을 때 표시
            )}
          </ul>
        </nav>
        <form
          onSubmit={handleSearch}
          className="flex w-5/12 h-[45px] rounded-full bg-g-100 px-6 py-2.5"
        >
          <input
            type="text"
            placeholder="검색"
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="h-full" aria-label="검색하기">
            <img
              src="/images/ico-search.svg"
              alt="검색 아이콘"
              className="size-4.5 "
            />
          </button>
        </form>
        <div className="text-g-600">
          <Link href="/login" className=" mr-12 md:mr-4">
            로그인
          </Link>
          <Link href="/signup">회원가입</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;