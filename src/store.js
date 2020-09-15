import {createStore, combineReducers} from 'redux';
import WsReducer from './wsReducer';
import PlayerReducer from './player/reducers/playerReducer';

const rootReducer = combineReducers({ws: WsReducer, player: PlayerReducer});
const store = createStore(rootReducer);

export default store;