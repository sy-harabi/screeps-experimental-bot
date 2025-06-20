const generatePlan = require("./task-planner")

const ENERGY = "energy"
const BARICADE = "baricade"
const SAFE_MODE = "safeMode"
const roomKeys = [ENERGY, BARICADE, SAFE_MODE]

/**
 * Generates a war plan using the task planner.
 * @param {number} tick - The current game tick.
 * @param {number} quads - Number of available quads.
 * @param {Array<Object>} rooms - Array of room objects with properties: name, energy, baricade, safeMode.
 */
function generateWarPlan(tick, quads, rooms) {
  const initialState = {
    tick,
    quad_available: quads,
  }

  // Initialize state for each room
  rooms.forEach((room) =>
    roomKeys.forEach((key) => {
      const stateKey = getRoomKey(room.name, key)
      const value = room[key] || 0
      initialState[stateKey] = value
    }),
  )

  /**
   * Creates an action for sending a quad to a specific room.
   * @param {string} roomName
   * @returns {Object} Action object
   */
  function createSendQuadAction(roomName) {
    return {
      condition: (state) =>
        state.quad_available >= 1 &&
        state[getRoomKey(roomName, SAFE_MODE)] <= state.tick &&
        state[getRoomKey(roomName, BARICADE)] > 0,
      effect: (state) => {
        const damage = 300000
        const delta = { quad_available: -1 }
        const energyKey = getRoomKey(roomName, ENERGY)
        const roomEnergy = state[energyKey]
        const energyDrain = Math.min(roomEnergy, Math.floor(damage / 100))
        delta[energyKey] = -energyDrain

        const baricadeKey = getRoomKey(roomName, BARICADE)
        const baricade = state[baricadeKey]
        const baricadeDamage = Math.min(baricade, damage - energyDrain * 100)
        delta[baricadeKey] = -baricadeDamage

        // Increase baricade for other rooms
        for (const room of rooms) {
          if (room.name === roomName || state[getRoomKey(room.name, BARICADE)] === 0) continue
          delta[getRoomKey(room.name, BARICADE)] = 100000
        }

        delta.tick = 500
        return delta
      },
      cost: () => 3,
    }
  }

  // Define all possible actions
  const actions = {
    wait: {
      condition: () => true,
      effect: (state) => {
        const delta = { quad_available: 2, tick: 500 }
        for (const room of rooms) {
          if (state[getRoomKey(room.name, BARICADE)] === 0) continue
          delta[getRoomKey(room.name, BARICADE)] = 100000
        }
        return delta
      },
      cost: () => 1,
    },
  }

  // Add sendQuadTo actions for each room
  rooms.forEach((room) => {
    actions[`sendQuadTo${room.name}`] = createSendQuadAction(room.name)
  })

  /**
   * Checks if all baricades are destroyed.
   * @param {Object} state
   * @returns {boolean}
   */
  const validate = (state) => rooms.every((room) => state[getRoomKey(room.name, BARICADE)] <= 0)

  // Output the generated plan
  console.log(generatePlan(initialState, actions, validate))
}

/**
 * Generates a unique key for a room property.
 * @param {string} roomName
 * @param {string} key
 * @returns {string}
 */
function getRoomKey(roomName, key) {
  return `${roomName}_${key}`
}

module.exports = generateWarPlan
