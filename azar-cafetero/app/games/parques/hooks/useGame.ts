import { useState } from "react";

export const useGame = () => {
  const [turn, setTurn] = useState("Karol");
  const [dice, setDice] = useState([5, 3]);
  const [history, setHistory] = useState([
    { name: "Karol", d1: 5, d2: 3 },
    { name: "Juan", d1: 2, d2: 2 },
  ]);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;

      setDice([d1, d2]);
      setHistory((prev) => [{ name: turn, d1, d2 }, ...prev.slice(0, 5)]);
      setIsRolling(false);
    }, 600);
  };

  return { turn, dice, history, isRolling, rollDice };
};