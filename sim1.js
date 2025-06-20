const createPlan = require("./task-planner");

const initialState = {
  axe_available: true,
  axe_equipped: false,
  wood: 0
};

const actions = {
  chopWood: {
    condition: s => s.axe_equipped,
    effect: s => {
      s.wood++;
      return s;
    },
    cost: s => 1
  },
  getAxe: {
    condition: s => !s.axe_equipped && s.axe_available,
    effect: s => {
      s.axe_equipped = true;
      return s;
    },
    cost: s => 10
  },
  gatherWood: {
    condition: s => true,
    effect: s => {
      s.wood++;
      return s;
    },
    cost: s => 3
  }
};

const validate = (prevState, nextState) => {
      return nextState.wood >8
}

console.log(createPlan(initialState,actions,validate))