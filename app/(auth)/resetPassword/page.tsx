'use client'; // this is a client component

import { useState } from 'react';
import { supabase } from '@/app/utils/supabase';

const ResetPassword = () => {
  const [email, setEmail] = useState(''); // 이메일 상태 관리

  const resetPasswordHandler = async () => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3001/resetPassword', // 비밀번호 재설정 완료 후 리디렉션 경로
      });
      console.log(data);
      if (!error) {
        alert('Please check your email');
        setEmail(''); // 이메일 입력 필드 초기화
      } else {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          resetPasswordHandler();
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} // 이메일 입력값 업데이트
          placeholder="Enter your email"
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
