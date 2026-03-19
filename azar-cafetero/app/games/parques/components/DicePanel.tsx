const Die = ({ value }) => (
  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
    <span className="text-black font-bold">{value}</span>
  </div>
);

export const DicePanel = ({ dice, rollDice, isRolling }) => (
  <button onClick={rollDice} disabled={isRolling} className="flex gap-4">
    <Die value={dice[0]} />
    <Die value={dice[1]} />
  </button>
);