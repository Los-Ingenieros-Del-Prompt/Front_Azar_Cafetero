import { PLAYER_COLORS } from "../../constants/colors";

export const Jail = ({ color }) => (
  <div className={`${PLAYER_COLORS[color].bg} flex justify-center items-center`}>
    {[1,2,3,4].map(i => (
      <div key={i} className="w-6 h-6 bg-white/30 rounded-full m-1" />
    ))}
  </div>
);