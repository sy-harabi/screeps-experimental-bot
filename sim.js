const generateWarPlan = require("./war-planner")

const roomA = {
  name: "W1N1",
  rcl: 6,
  terminal: true,
  energy: 7000,
  baricade: 500000,
  towers: 2,
}

const roomB = {
  name: "W2N1",
  rcl: 7,
  terminal: true,
  energy: 10000,
  baricade: 1000000,
  towers: 3,
}

const roomC = {
  name: "W3N1",
  rcl: 3,
  terminal: false,
  energy: 2000,
  baricade: 20000,
  towers: 1,
  safeMode: 10000,
}

generateWarPlan(3000, 30, [roomA, roomB, roomC])
