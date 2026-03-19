import { MessageSquare, Send } from "lucide-react";

export const GameChat = ({ history }) => (
  <div className="bg-[#1a1a1a] p-4 rounded-xl">
    <div className="flex gap-2 text-xs mb-2">
      <MessageSquare size={12} /> Chat
    </div>

    <div className="h-20 overflow-y-auto text-xs">
      {history.map((h, i) => (
        <div key={i}>
          <b>{h.name}</b>: lanzó {h.d1} y {h.d2}
        </div>
      ))}
    </div>

    <div className="flex gap-2 mt-2">
      <input className="flex-1 bg-black text-xs" />
      <button><Send size={14} /></button>
    </div>
  </div>
);