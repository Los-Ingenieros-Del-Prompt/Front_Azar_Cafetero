const gridSize = 19;
const step = 1000 / gridSize;
const offset = step / 2;

const getCoord = (col, row) => ({
  x: Math.round(col * step + offset),
  y: Math.round(row * step + offset)
});

const coords = [];

// Helper to add coords
const add = (col, row) => coords.push(getCoord(col, row));

// Track goes clockwise: Yellow (Top Right) -> Blue (Bottom Right) -> Green (Bottom Left) -> Red (Top Left)

// 0-16: Yellow quadrant (starts at Yellow exit)
// Exit is right arm, top row, 5th from center.
// Right arm: cols 11 to 18. Center is 9. So 5th from center is col 14.
// Wait, center is 9. 1st is 10, 2nd is 11, 3rd is 12, 4th is 13, 5th is 14.
// Rows: top=8, middle=9, bottom=10.
// Let's trace from (14, 8) clockwise.
// 0 to 4: go right on top row
for(let c=14; c<=18; c++) add(c, 8);
// 5, 6: go down end of right arm
add(18, 9); add(18, 10);
// 7 to 14: go left on bottom row of right arm
for(let c=17; c>=10; c--) add(c, 10);
// 15, 16: go down on right row of bottom arm
add(10, 11); add(10, 12);

// 17-33: Blue quadrant
// 17-21: continue down right row of bottom arm
for(let r=13; r<=17; r++) add(10, r);
// 22, 23: go left on end of bottom arm
add(9, 17); add(8, 17); // Wait, grid is 0-18. End is row 18. So 17 to 18:
