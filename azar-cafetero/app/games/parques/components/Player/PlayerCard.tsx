import { User } from "lucide-react";
import { PLAYER_COLORS } from "../../constants/colors";

export const PlayerCard = ({ player, isTurn }) => (
  <div className={`flex flex-col items-center gap-1 ${isTurn ? 'scale-110' : 'opacity-60 grayscale'}`}>
    <div className="relative">
      <div className={`w-14 h-14 rounded-xl border-[3px] ${isTurn ? 'border-yellow-500 bg-stone-800' : 'border-stone-800 bg-[#1a1a1a]'}`}>
        <User size={30} />
        <div className={`absolute top-0 right-0 w-3.5 h-3.5 ${PLAYER_COLORS[player.color].bg}`} />
      </div>
    </div>
    <span className="text-xs">{player.name}</span>
  </div>
);