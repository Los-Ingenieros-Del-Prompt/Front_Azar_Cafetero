"use client";

import { useGame } from "../hooks/useGame";
import { Board } from "./Board/Board";
import { PlayerCard } from "./Player/PlayerCard";
import { GameHeader } from "./GameHeader";
import { GameChat } from "./GameChat";
import { DicePanel } from "./DicePanel";

export const GameBoard = () => {
  const { turn, dice, history, isRolling, rollDice } = useGame();

  const players = [
    { id: 1, name: "Jugador 2", color: "blue" },
    { id: 2, name: "Jugador 3", color: "green" },
    { id: 3, name: "Jugador 4", color: "yellow" },
    { id: 4, name: "Karol", color: "red" },
  ];

  return (
    <div className="flex flex-col items-center p-6 text-white">

      <GameHeader turn={turn} />

      <div className="relative mt-6">
        <Board />

        <div className="absolute -top-10 -left-10">
          <PlayerCard player={players[0]} isTurn={turn === players[0].name} />
        </div>

        <div className="absolute -top-10 -right-10">
          <PlayerCard player={players[1]} isTurn={turn === players[1].name} />
        </div>

        <div className="absolute -bottom-10 -left-10">
          <PlayerCard player={players[2]} isTurn={turn === players[2].name} />
        </div>

        <div className="absolute -bottom-10 -right-10">
          <PlayerCard player={players[3]} isTurn={turn === players[3].name} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-10 w-full max-w-4xl">
        <GameChat history={history} />
        <DicePanel dice={dice} rollDice={rollDice} isRolling={isRolling} />
      </div>

    </div>
  );
};