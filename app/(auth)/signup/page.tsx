'use client';

import { supabase } from '../../utils/supabase.ts';
import React, { FormEvent, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가
  const router = useRouter();

  const signupHandler = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // 에러 메시지 초기화

    try {
      // Supabase 회원가입 시도
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('회원가입 오류:', error.message);
        setErrorMessage('이메일이 이미 존재합니다.'); // 에러 메시지 출력
        return;
      }

      console.log('회원가입 성공:', data);

      const { user } = data;
      if (!user) {
        setErrorMessage('회원가입에 실패했습니다. 다시 시도해주세요.');
        return;
      }

      // 회원가입 후 사용자 정보를 users 테이블에 저장
      const { error: userError } = await supabase.from('users').insert([
        {
          id: user.id, // Supabase 사용자 ID
          username,
          email,
        },
      ]);

      if (userError) {
        console.error('사용자 정보 저장 오류:', userError.message);
        setErrorMessage(userError.message);
      } else {
        console.log('사용자 정보 저장 성공');
        router.push('/'); // 성공 시 로그인 페이지로 리다이렉트
      }
    } catch (error) {
      console.error('오류 발생:', error);
      setErrorMessage('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="grid items-center max-h-full h-[640px] w-full max-w-[980px] grid-cols-2 rounded-xl border border-g-400 bg-white shadow-xl">
        {/* 왼쪽 - 회원가입 폼 */}
        <div className="p-8">
          <h1 className="mb-2 text-2xl font-bold text-black">
            Welcome to Rapid Stock!
          </h1>
          <p className="mb-14 text-gray-600">
            가장 빠르게 주식 뉴스를 전달드립니다.
          </p>

          <form className="space-y-6" onSubmit={signupHandler}>
            <div>
              <label className="block font-medium text-black mb-[10px]">
                이메일
              </label>
              <input
                type="email"
                placeholder="이메일을 입력해주세요."
                className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-black mb-[10px]">
                비밀번호
              </label>
              <input
                type="password"
                placeholder="비밀번호를 입력해주세요."
                className="h-12 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-medium text-black mb-[10px]">
                닉네임
              </label>
              <input
                type="text"
                placeholder="닉네임을 입력해주세요."
                className="h-12 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            {errorMessage && (
              <p className="text-red-600 mt-2">{errorMessage}</p>
            )}
            <div className="block mt-14">
              <button
                type="submit"
                className="h-12 w-full rounded-md bg-black text-white transition duration-200 hover:bg-gray-800"
              >
                회원가입
              </button>
            </div>
          </form>
        </div>

        {/* 오른쪽 - 로고 이미지 */}
        <div className="flex items-center justify-center h-[640px] rounded-r-xl bg-gray-50 p-8">
          <div className="text-center">
            <Image
              src="/images/logo-2.svg"
              alt="Rapid Stock Logo"
              width={300}
              height={300}
              className="mx-auto mb-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
