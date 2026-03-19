import { LogOut } from "lucide-react";

export const GameHeader = ({ turn }) => (
  <div className="flex justify-between w-full max-w-5xl">
    <span>Turno: {turn}</span>
    <button><LogOut size={14}/> Salir</button>
  </div>
);