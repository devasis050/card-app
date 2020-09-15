import React from 'react';
import { connect } from 'react-redux';
import { ADD_WS } from '../../redux/actionTypes'
import Axios from 'axios';

import { Client } from '@stomp/stompjs'
import { Redirect } from 'react-router-dom';
//https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html
class StartGame extends React.Component {

    constructor() {
        super()
        this.state = {};
        this.onMessage = this.onMessage.bind(this);
    }


    onMessage(msg) {
        const game = JSON.parse(msg.body);
        console.log('Recieved message from server', game);
        this.setState({game});
        
    }

    joinGame(teamNumber) {
        console.log('Join game called');
        console.log(this.props);
        const joinRequest = {
            playerName: this.props.player.name,
            teamNumber

        }
        this.props.ws.publish({destination:"/game/join", body:JSON.stringify(joinRequest)});
    }

    startGame() {
        this.props.ws.publish({destination:"/game/start", body:this.props.player.name});
    }

    componentDidMount() {
        console.log('COmponentDidMount startComponent', this.props);
        if (!this.props.ws) {
            // var ws = new WebSocket("ws://localhost:8080/ws");
            // var sc = Stomp.over('ws://localhost:8080/ws');
            // 
            // function onConnected() {
            //     console.log("Connected successfully");
            //     sc.subscribe("/stream/join", onMessage);
            // }
            // function onError() {
            //     console.log("Error occurred")
            // }
            // sc.connect({}, onConnected, onError);

            // this.props.dispatch({type: ADD_WS, payload:sc});

            const ws = new Client({
                brokerURL: "ws://localhost:8080/ws"
            });
            //https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html

            ws.onConnect = (msg) => {
                console.log('WS Connected');
                ws.subscribe("/stream/join", this.onMessage);
                ws.subscribe("/game/started", this.onMessage);
                this.props.dispatch({ type: ADD_WS, payload: ws });
            };
            ws.onStompError = (err) => {
                console.log('WS connection error', err);
            }
            ws.activate();
            ws.publish
        }

        if (!this.state.game) {
            Axios.get('http://localhost:8080/game').then((res) => {
                this.setState({ game: res.data });
            })
        }
    }



    render() {

        const game = this.state.game;
        console.log('game in render', game);

        const defaultPlayer = <div>
            <img src='../../../static/avatars/default.png' className='w-50 h-80'></img><br />
            <span>Waiting for player</span>
        </div>;

        if (game) {
            return (<div>
                <div className='row d-flex justify-content-center'>Welcome {this.props.player.name}</div>
                <div className='d-flex flex-row pt-4'>
                    <div className='w-50 d-flex flex-column justify-content-center'>
                        <div className='d-flex justify-content-center'>Team1</div>

                        <div className='d-flex justify-content-center'>
                            {game.team1.player1 ? <div>
                                <img src='../../../static/avatars/first.png' className='w-50 h-80'></img><br />
                                <span>{game.team1.player1}</span>
                            </div> : defaultPlayer}
                            {game.team1.player2 ? <div>
                                <img src='../../../static/avatars/second.png' className='w-50 h-80'></img><br />
                                <span>{game.team1.player2}</span>
                            </div> : defaultPlayer}
                        </div>
                        <div className='d-flex justify-content-center'><button onClick={() => this.joinGame(1)}>Join</button></div>

                    </div>

                    <div className='w-50 d-flex flex-column justify-content-center'>
                        <div className='d-flex justify-content-center'>Team2</div>

                        <div className='d-flex justify-content-center'>
                            {game.team2.player1 ? <div>
                                <img src='../../../static/avatars/first.png' className='w-50 h-80'></img><br />
                                <span>{game.team2.player1}</span>
                            </div> : defaultPlayer}
                            {game.team2.player2 ? <div>
                                <img src='../../../static/avatars/second.png' className='w-50 h-80'></img><br />
                                <span>{game.team2.player2}</span>
                            </div> : defaultPlayer}
                        </div>
                        <div className='d-flex justify-content-center'><button onClick={() => this.joinGame(2)}>Join</button></div>
                    </div>


                </div>
                <div className='d-flex justify-content-center'>
                    {game.gameStartedBy?<Redirect to='/game'>game started by {game.gameStartedBy}</Redirect>
                    :<button onClick={() => this.startGame()}>Start</button>
                }
                </div>
            </div>);
        } else {
            return <div>Loading start screen</div>
        }
    }
}

function mapStateToProps(state) {
    return { ws: state.ws.client, player: state.player };
}

const ConnectedComponent = connect(mapStateToProps)(StartGame);
export default ConnectedComponent;