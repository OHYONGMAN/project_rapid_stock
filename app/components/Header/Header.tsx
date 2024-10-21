'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  links?: { name: string; url: string }[];
}

const Header: React.FC<HeaderProps> = ({ links = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // 검색어 처리 함수
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      router.push(`/news?search=${encodeURIComponent(searchTerm)}`); // 검색어를 쿼리 파라미터로 추가
    }
  };

  return (
    <header className={'border-b border-g-400 transition-all duration-300'}>
      <div className="max-w-[1700px] w-full mx-auto sm:px-12 xl:px-20 2xl:px-20 flex items-center justify-between py-6">
        <h1>
          <Link href="/">
            <Image
              src="/images/logo.svg"
              alt="rapid stock"
              width={190}
              height={34}
            />
          </Link>
        </h1>
        <nav>
          <ul className="flex gap-12 text-lg font-semibold md:gap-4">
            {links.map((link) => (
              <li key={`${link.name}-${link.url}`}>
                <Link href={link.url}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <form
          onSubmit={handleSearch}
          className="flex h-[45px] w-8/12 rounded-full bg-g-100 px-6 py-2.5"
        >
          <input
            type="text"
            placeholder="검색"
            className="w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="h-full" aria-label="검색하기">
            <Image
              src="/images/ico-search.svg"
              alt="검색 아이콘"
              width={18}
              height={18}
            />
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
