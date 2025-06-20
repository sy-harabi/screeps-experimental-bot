const MinHeap = require("./util-min-heap")

class StateHandler {
  constructor(keys) {
    keys = keys.sort()
    this.keys = keys
  }

  isEqual(state1, state2) {
    return this.keys.every((key) => state1[key] === state2[key])
  }

  getHashKey(state) {
    return this.keys.map((key) => state[key]).join("|")
  }

  fromHashKey(hashKey) {
    const result = {}
    const array = hashKey.split("|").map(Number)
    this.keys.forEach((key, index) => (result[key] = array[index]))
    return result
  }

  apply(state, delta) {
    const result = { ...state }
    for (const [key, value] of Object.entries(delta)) {
      result[key] += value
    }

    return result
  }
}

/**
 * Generates a plan based on the initial state, available actions, and a validation function.
 * @param {Object} initialState - The initial state as a key-value object.
 * @param {Array<Object>} actions - List of possible actions, each as a delta object.
 * @param {Function} validate - Function to validate a state. Receives a state object, returns boolean.
 * @param {Object} [options={}] - Optional configuration.
 * @returns {void}
 */
function generatePlan(initialState, actions, validate, options = {}) {
  const keys = Object.keys(initialState).sort()

  const handler = new StateHandler(keys)

  actions = mapActions(actions)

  const dist = new Map()
  const prev = new Map()
  const visited = new Map()
  const actionTaken = new Map()
  const queue = new MinHeap((state) => dist.get(handler.getHashKey(state)))

  dist.set(handler.getHashKey(initialState), 0)
  queue.insert(initialState)

  while (queue.getSize() > 0) {
    // Get the state with the lowest cost

    const state = queue.remove()
    const hash = handler.getHashKey(state)

    if (visited.get(hash)) continue

    visited.set(hash, true)

    // Check if this state is valid (goal)
    if (validate(state)) {
      // Reconstruct path
      const plan = []
      let currentHash = hash
      while (actionTaken.has(currentHash)) {
        plan.push(actionTaken.get(currentHash))
        currentHash = prev.get(currentHash)
      }
      return plan.reverse()
    }

    for (const action of actions) {
      if (!action.condition(state)) continue

      const cost = action.cost(state)

      const nextState = handler.apply(state, action.effect(state))
      const nextHash = handler.getHashKey(nextState)

      if (dist.get(nextHash) === undefined || dist.get(hash) + cost < dist.get(nextHash)) {
        dist.set(nextHash, dist.get(hash) + cost)
        prev.set(nextHash, hash)
        actionTaken.set(nextHash, action.key)
        queue.insert(nextState)
      }
    }
  }

  return null
}

function mapActions(actions) {
  const result = []

  Object.keys(actions).forEach((key) => {
    const action = actions[key]
    action.key = key
    result.push(action)
  })

  return result
}

module.exports = generatePlan
