import {UPDATE_PLAYER} from '../../redux/actionTypes'

const PlayerReducer = (state={}, action) => {
    if(action.type == UPDATE_PLAYER) {
        return action.payload;
    } else {
        return state;
    }
}

export default PlayerReducer;