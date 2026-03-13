'use client'

import { ArrowRight } from 'lucide-react'

export type Room = {
  id: number
  name: string
  players: number
  max: number
}

type Props = {
  room: Room
  onEnter?: (room: Room) => void
}

const BottleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 200" className={className} fill="currentColor">
    <path d="M30 40 C 30 20, 70 20, 70 40 L 70 60 C 70 80, 90 90, 90 120 L 90 180 C 90 195, 80 200, 50 200 C 20 200, 10 195, 10 180 L 10 120 C 10 90, 30 80, 30 60 Z" />
    <rect x="40" y="10" width="20" height="15" rx="2" />
  </svg>
)

export default function BottleCard({ room, onEnter }: Props) {
  return (
    <div className="group relative flex flex-col items-center justify-end h-80 transition-all duration-300 transform hover:-translate-y-2">
      <div className="absolute bottom-2 w-24 h-4 bg-black/20 blur-xl rounded-full scale-x-150"></div>

      <div className="relative z-10 w-40 drop-shadow-2xl">
        <BottleIcon className="text-white opacity-95 group-hover:text-green-50 transition-colors" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-16 text-slate-900">
          <span className="text-2xl font-black uppercase">{room.name}</span>

          <span className="text-lg font-bold">
            <span className={room.players > 7 ? 'text-red-600' : 'text-green-600'}>
              {room.players}
            </span>
            <span className="text-slate-400">/{room.max}</span>
          </span>
        </div>

        <button
          onClick={() => onEnter?.(room)}
          className="absolute -right-4 bottom-10 bg-green-900 text-white p-3 rounded-2xl shadow-xl"
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}