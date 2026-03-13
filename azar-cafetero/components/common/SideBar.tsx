'use client'

import { User, DollarSign, Home, LogOut } from 'lucide-react'

export default function Sidebar() {
  return (
    <nav className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-8 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full shadow-2xl">
      <button className="p-2 hover:bg-white/20 rounded-full"><User size={24} /></button>
      <button className="p-2 hover:bg-white/20 rounded-full"><DollarSign size={24} /></button>
      <button className="p-2 hover:bg-white/20 rounded-full"><Home size={24} /></button>
      <div className="h-px bg-white/20 w-8 self-center my-2" />
      <button className="p-2 hover:bg-white/20 rounded-full text-red-400"><LogOut size={24} /></button>
    </nav>
  )
}