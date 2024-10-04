"use client"; // this is a client component

import { supabase } from "@/app/utils/supabase";
import router from "next/router";
import { FormEvent, useState } from "react";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginHandler = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error(error);
      }
      if (data) {
        dispatch({
          type: "LOGIN",
          payload: { email: data.user?.email, id: data.user?.id },
        });
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    }
  };

  function dispatch(arg0: { type: string; payload: { email: string | undefined; id: string | undefined } }) {
    console.log("Dispatch action:", arg0); // 실제 사용 시 이 부분을 구현해야 합니다.
  }
}





  export default function SignupPage() {
    return (
      <div className="flex items-start justify-center h-screen mt-10 bg-white">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[980px] max-h-[640px] grid grid-cols-2">
          {/* 왼쪽 - 회원가입 폼 */}
          <div className="p-4">
            <h1 className="text-2xl font-bold mb-2 text-black">Welcome to Rapid Stock!</h1>
            <p className="text-gray-600 mb-10">가장 빠르게 주식 뉴스를 전달드립니다.</p>
  
            <form className="space-y-6">
              <div>
                <label className="text-black font-medium" >이메일</label>
                <input
                  type="email"
                  placeholder="이메일을 입력해주세요."
                  className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-black font-medium">비밀번호</label>
                <input
                  type="password"
                  placeholder="비밀번호를 입력해주세요."
                  className="w-full h-12 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-black text-white rounded-md hover:bg-gray-800 transition duration-200"
              >
               로그인
              </button>
            </form>
          </div>
  
          {/* 오른쪽 - 로고 이미지 */}
          <div className="flex items-center justify-center bg-gray-50 p-8 rounded-r-lg">
            <div className="text-center">
            <img src="/images/logo.svg" alt="Rapid Stock Logo" className="w-[500px] mx-auto mb-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }
