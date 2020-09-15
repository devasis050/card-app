
import ReactDOM from 'react-dom';
import React from 'react';

import Cards from '../card-app/src/cards/components/cardComponent'
import GameComponent from '../card-app/src/game/components/gameComponent';
import StartGame from '../card-app/src/start/components/startComponent';
import AdminComponent from '../card-app/src/game/components/adminComponent';
import ScoreComponent from '../card-app/src/game/components/scoreComponent';
import {Provider} from 'react-redux';
import store from './src/store';
import PlayerComponent from './src/player/components/playerComponent';
import {BrowserRouter, Route, Switch} from 'react-router-dom'; 

const App = () => {
    return (<Provider store={store}>
                <BrowserRouter>
                    <Switch>
                        <Route path='/' component={PlayerComponent} exact />
                        <Route path='/start' component={StartGame} exact />
                        <Route path='/game' component={GameComponent} />
                        <Route path='/admin' component={AdminComponent} />
                        <Route path='/score' component={ScoreComponent} />
                    </Switch>
                </BrowserRouter>
            </Provider>);
}


ReactDOM.render( <App/>, document.querySelector("#app"));