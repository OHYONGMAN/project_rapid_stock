'use client';

import React from 'react';
import Image from 'next/image';
import dev from '../../public/images/Dev.png';
import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>
        <Image src={dev} alt="개발중 페이지" />
      </h1>
      <Link
        href="/"
        className="font-semibold text-white py-[12.5px] px-[54.5px] text-lg bg-primary rounded-xl mt-8"
      >
        메인으로
      </Link>
    </div>
  );
}
