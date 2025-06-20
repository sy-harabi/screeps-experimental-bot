const createPlan = require("./task-planner")

const roomA = {
    name:'W1N1',
    rcl:6,
    terminal:true,
    energy:100000,
    baricade:150000,
    towers:2,
}

const roomB = {
    name:'W2N1',
    rcl:7,
    terminal:true,
    energy:150000,
    baricade:200000,
    towers:3,
}

const roomC = {
    name:'W3N1',
    rcl:3,
    terminal:false,
    energy:3000,
    baricade:20000,
    towers:1,
    safeMode:10000
}

const rooms = [roomA,roomB,roomC]

const enemy_rooms = {}

rooms.forEach(room => enemy_rooms[room.name] = room)

const initialState = {
    tick:3000,
    quad_available:30,
    enemy_rooms:enemy_rooms
}


function makeSendQuadAction(roomName) {
    const condition = (s) => {
            if (s.quad_available<1) {
                return false
            }

            const room = s.enemy_rooms[roomName]

            if (!room) {
                return false
            }

            if (room.safeMode > s.tick) {
                return false
            }

            return true
        }

    const effect = (s)=> {
            s.quad_available--

            for (const room of Object.values(s.enemy_rooms)) {
                if (room.name===roomName) {
                    continue
                }
                room.energy+=5000
            }

            const room = s.enemy_rooms[roomName]

            const energyDrain = Math.min(room.energy, 10000)

            room.energy -= energyDrain

            const baricadeDamage = Math.min(room.baricade,1000000 - energyDrain*100)

            room.baricade -= baricadeDamage

            if (room.baricade===0) {
                delete s.enemy_rooms[roomName]
            }

            s.tick += 500

            return s
        }

    const cost = s=>2

    return {condition,effect,cost}
}

const actions = {
    wait:{
        condition:s=>true,
        effect:s=>{
            s.quad_available+=2
            s.tick+=500
            for (const room of Object.values(s.enemy_rooms)) {
                room.energy+=5000
            }

            return s
        },
        cost:s=>1
    }
}

for (const roomName in initialState.enemy_rooms) {
    actions[`sendQuadTo${roomName}`] = makeSendQuadAction(roomName)
}

const validate = (prevState, nextState) => {
    return Object.keys(nextState.enemy_rooms).length < Object.keys(prevState.enemy_rooms).length
}

console.log(createPlan(initialState,actions,validate))