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

  return (
    <form onSubmit={loginHandler}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Log In</button>
    </form>
  );
};

export default LoginForm;
