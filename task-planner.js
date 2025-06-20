const _ = require('lodash');

const MinHeap = require("./util-min-heap")

/**
 * Represents a node in the planning search tree.
 */
class Node {
    /**
     * Creates a new Node.
     * @param {Node|null} [parent=null] - The parent node in the search tree.
     * @param {number} [cost=0] - The cumulative cost to reach this node.
     * @param {object} [state={}] - The state represented by this node.
     * @param {object} [action=null] - The action taken to reach this node from the parent.
     */
    constructor(parent = null, cost = 0, state = {}, action = null) {
        this.cost = cost
        this.parent = parent
        this.state = state
        this.action = action
    }
}

const mapActions = actions => {
    const result = []

    Object.keys(actions).forEach(key=>{
        const action = actions[key]
        action.key=key
        result.push(action)
    })

    return result
};

function createPlan(currentState, actions, validate, maxIterate = 15) {
    actions = mapActions(actions)

    const root = new Node(null,0,currentState,null)

    const leaves = new MinHeap(node => node.cost)

    dfs(root, leaves, actions, validate, maxIterate,1)

    if (leaves.getSize()) {
        const last = leaves.getMin()

        return getPlanFromLeaf(last)
    }

    return 'Could not find a valid plan'
}

function dfs(current, leaves, actions, validate,maxIterate, iterate) {
    if (iterate > maxIterate) {
        return
    }

    iterate ++ 

    for (const action of actions) {
        if (!action.condition(current.state)) {
            continue
        }

        const nextState = action.effect(_.cloneDeep(current.state))

        const cost = current.cost + action.cost(current.state)

        const node = new Node(current, cost, nextState, action)

        if (validate(current.state, nextState)) {
            console.log(getPlanFromLeaf(node))
            leaves.insert(node)
            continue
        }

        dfs(node, leaves, actions, validate, maxIterate, iterate)
    }
}

function getPlanFromLeaf(last) {
    const plan = []

    while (last) {
        if (last.action) {
            plan.unshift(last.action.key)
        }

        last = last.parent
    }

    return plan
}

module.exports = createPlan