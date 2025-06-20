const MinHeap = require("./util-min-heap")

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
  const indexMap = Object.fromEntries(keys.map((key, i) => [key, i]))

  /**
   * Represents a state in the planning process.
   */
  class State {
    /**
     * Creates a State instance from a hash key string.
     * @param {string} hashKey - The hash key representing the state.
     * @returns {State}
     */
    static fromHashKey(hashKey) {
      const array = hashKey.split("|").map(Number)
      return new State(array)
    }

    /**
     * Constructs a State.
     * @param {Object|Array<number>} object - State as an object or array.
     */
    constructor(object) {
      if (Array.isArray(object)) {
        this.state = object
      } else {
        this.state = keys.map((key) => object[key])
      }
    }

    /**
     * Checks if this state is equal to another state.
     * @param {State} anotherState
     * @returns {boolean}
     */
    isEqualTo(anotherState) {
      return this.state.every((v, i) => v === anotherState.state[i])
    }

    /**
     * Returns a string hash key for the state.
     * @returns {string}
     */
    getHashKey() {
      return this.state.join("|")
    }

    /**
     * Applies a delta to the state and returns a new State.
     * @param {Object} delta - Object with key-value changes.
     * @returns {State}
     */
    apply(delta) {
      const result = [...this.state]
      for (const key in delta) {
        const index = indexMap[key]
        result[index] += delta[key]
      }
      return new State(result)
    }

    toObject() {
      return Object.fromEntries(this.state.map((value, index) => [keys[index], value]))
    }
  }

  actions = mapActions(actions)

  const start = new State(initialState)
  const dist = new Map()
  const prev = new Map()
  const visited = new Map()
  const actionTaken = new Map()
  const queue = new MinHeap((state) => dist.get(state.getHashKey()))

  dist.set(start.getHashKey(), 0)
  queue.insert(start)

  while (queue.getSize() > 0) {
    // Get the state with the lowest cost

    const state = queue.remove()
    const hash = state.getHashKey()

    if (visited.get(hash)) continue

    visited.set(hash, true)

    const stateObject = state.toObject()

    // Check if this state is valid (goal)
    if (validate(stateObject)) {
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
      if (!action.condition(stateObject)) continue

      const cost = action.cost(stateObject)

      const nextState = state.apply(action.effect(stateObject))
      const nextHash = nextState.getHashKey()

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
