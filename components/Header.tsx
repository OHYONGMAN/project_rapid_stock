'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import logo from '../app/public/images/logo.svg';
import search from '../app/public/images/ico-search.svg';
import Link from 'next/link';

interface HeaderProps {
    links: { name: string; url: string }[];
}

const Header: React.FC<HeaderProps> = ({ links }) => {
    // 검색 기능 추후 구현 예정
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(searchTerm);
    };

    return (
        <header className='border-b border-g-400'>
            <div className='container mx-auto flex items-center justify-between py-5'>
                <h1>
                    <Link href='/'>
                        <Image src={logo} alt='rapid stock' />
                    </Link>
                </h1>

                <nav className='flex gap-x-12 font-semibold md:gap-x-4'>
                    {links.map((link, index) => (
                        <Link key={index} href={link.url}>
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <form onSubmit={handleSearch} className='flex w-5/12 items-center gap-2.5 rounded-full bg-g-100 px-6 py-2.5'>
                    <input type='text' placeholder='검색' className='w-full' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button type='submit'>
                        <Image src={search} alt='검색 아이콘' />
                    </button>
                </form>

                <div className='flex gap-x-12 md:gap-x-4'>
                    <Link href='/login' className='text-g-600'>
                        로그인
                    </Link>
                    <Link href='/signup' className='text-g-600'>
                        회원가입
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
