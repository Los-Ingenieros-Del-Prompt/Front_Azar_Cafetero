type Props = {
  direction: "horizontal" | "vertical";
};

export const Path = ({ direction }: Props) => {
  const isHorizontal = direction === "horizontal";

  return (
    <div
      className={`grid ${
        isHorizontal ? "grid-cols-8 grid-rows-3" : "grid-cols-3 grid-rows-8"
      }`}
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="border"></div>
      ))}
    </div>
  );
};