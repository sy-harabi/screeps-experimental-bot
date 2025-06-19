const createPlan = require("./task-planner");

const initialState = {
  axe_available: true,
  player: {
    axe_equipped: false,
    wood: 0
  }
};

const actions = {
  chopWood: {
    condition: s => s.player.axe_equipped,
    effect: s => {
      s.player.wood++;
      return s;
    },
    cost: s => 2
  },
  getAxe: {
    condition: s => !s.player.axe_equipped && s.axe_available,
    effect: s => {
      s.player.axe_equipped = true;
      return s;
    },
    cost: s => 2
  },
  gatherWood: {
    condition: s => true,
    effect: s => {
      s.player.wood++;
      return s;
    },
    cost: s => 5
  }
};

const validate = (prevState, nextState) => {
      return nextState.player.wood > prevState.player.wood;
}

console.log(createPlan(initialState,actions,validate))