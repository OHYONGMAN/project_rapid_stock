"use client"; // this is a client component

import { supabase } from "@/app/utils/supabase"; 
import { FormEvent, useState } from "react";


const { data, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
})

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupHandler = async (e: FormEvent) => {
    e.preventDefault();
    console.log("Signup handler called"); 
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        console.error(error);
      } else {
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <div className="signup-box">
        <form onSubmit={signupHandler} className="form-section">
          <h1>Sign Up</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Sign Up</button>
        </form>
        <div className="image-section">
          <img src="/images/logo.svg" alt="Signup Logo" />
        </div>
      </div>
    </div>
  );
};

export default SignupForm;