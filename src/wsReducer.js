
import {ADD_WS} from './redux/actionTypes'

const WsReducer = (state={}, action) => {
    if(action.type == ADD_WS) {
        return {
            client: action.payload
        }
    } else {
        return state;
    }
}

export default WsReducer;