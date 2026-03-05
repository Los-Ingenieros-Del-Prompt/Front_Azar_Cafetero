
"use client";
import { useState } from "react";
import { Mail, Lock, Info } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando sesión con:", { email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        
      <div className="relative group">
  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
  <input 
    type="email" 
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className="w-full bg-[#B8CBB0] placeholder-gray-600 text-black rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#0B3D13] outline-none transition-all"
    required
  />
</div>

<div className="relative group">
  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
  <input 
    type="password" 
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full bg-[#B8CBB0] placeholder-gray-600 text-black rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#0B3D13] outline-none transition-all"
    required
  />
</div>

      <div className="text-center">
        <button type="button" className="text-[#1A8D44] font-semibold text-sm hover:underline">
          Forgot Password?
        </button>
      </div>

      <button 
        type="submit"
        className="w-full bg-[#0B3D13] text-white font-bold py-4 rounded-xl hover:bg-[#07290d] transition-all transform active:scale-[0.98] mt-2"
      >
        Login
      </button>

      <p className="text-center mt-8 text-sm text-gray-700 font-medium">
        Don't have an account? <button className="text-[#1A8D44] font-bold hover:underline">Create one</button>
      </p>
    </form>
  );
}