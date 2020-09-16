import {createStore, combineReducers} from 'redux';
import WsReducer from './wsReducer';
import playerReducer from './player/reducers/playerReducer';

const rootReducer = combineReducers({ws: WsReducer, playerReducer});
const store = createStore(rootReducer);

export default store;