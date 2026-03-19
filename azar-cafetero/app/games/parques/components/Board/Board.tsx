export const Board = () => (
  <div className="grid grid-cols-3 grid-rows-3 w-[500px] h-[500px]">
    <Jail color="blue" />
    <Path direction="horizontal" />
    <Jail color="green" />

    <Path direction="vertical" />
    <Center />
    <Path direction="vertical" />

    <Jail color="yellow" />
    <Path direction="horizontal" />
    <Jail color="red" />
  </div>
);