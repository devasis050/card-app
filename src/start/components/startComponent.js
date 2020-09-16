import React from 'react';
import { connect } from 'react-redux';
import { ADD_WS } from '../../redux/actionTypes'
import Axios from 'axios';

import { Client } from '@stomp/stompjs'
import { Redirect } from 'react-router-dom';
import { Table, Button } from 'react-bootstrap';
//https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html
class StartGame extends React.Component {

    constructor() {
        super()
        this.state = {};
        this.onMessage = this.onMessage.bind(this);
    }


    onMessage(msg) {
        console.log('Received message from server', msg.body)
        const game = JSON.parse(msg.body);
        this.setState({ game: game});

    }

    joinGame(teamNumber) {
        console.log('join game', this.props.player);
        const joinRequest = {
            playerName: this.props.player.name,
            teamNumber
        }
        this.props.ws.publish({ destination: "/game/join", body: JSON.stringify(joinRequest) });
    }

    startGame() {
        this.props.ws.publish({ destination: "/game/start", body: this.props.player.name });
    }

    componentDidUpdate() {
        if (!this.state.isSubscribed && this.props.ws) {
            console.log('subscribe');
            this.props.ws.subscribe("/game/playerJoined", this.onMessage);
            this.props.ws.subscribe("/game/started", this.onMessage);
            this.setState({ isSubscribed: true });
        }
    }

    componentDidMount() {
        if (!this.props.ws) {
            const ws = new Client({
                brokerURL: "ws://localhost:8080/ws"
            });
            //https://stomp-js.github.io/guide/stompjs/using-stompjs-v5.html
            ws.onConnect = (msg) => {
                console.log('WS connected');
                this.props.dispatch({ type: ADD_WS, payload: ws });
            };
            ws.onStompError = (err) => {
                console.log('WS connection error', err);
            }
            ws.activate();
        }

        if (!this.state.game) {
            console.log('Loading game in component did mount');
            Axios.get('http://localhost:8080/game').then((res) => {
                this.setState({ game: res.data });
            })
        }
    }



    render() {
        const game = this.state.game;
        const player = this.props.player;
        console.log('game in start', game);
        const renderPlayer = (image, player) => {
            return <div className='d-flex flex-column'>
                <div className='d-flex justify-content-center'><img src={`../../../static/avatars/${image}.png`} className='w-50 h-80'></img></div>
                <span className='d-flex justify-content-center'>{player}</span>
            </div>
        }
        if (!player) {
            return <Redirect to='/'>Loding player</Redirect>
        } else if (game) {
            const { team1, team2 } = game;
            return (
                <>
                    <div className='d-flex justify-content-center'>Welcome {player.name}</div>
                    <div className='w-auto p-4 mx-auto'>
                        <Table bordered>
                            <thead>
                                <tr className=''>
                                    <th><span className='d-flex justify-content-center'>Team1</span></th>
                                    <th><span className='d-flex justify-content-center'>Team2</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className='d-flex flex-row'>
                                            {team1.player1 ? renderPlayer('first', team1.player1) : renderPlayer('default', 'Waiting')}
                                            {team1.player2 ? renderPlayer('second', team1.player2) : renderPlayer('default', 'Waiting')}
                                        </div>
                                    </td>
                                    <td>
                                        <div className='d-flex flex-row'>
                                            {team2.player1 ? renderPlayer('first', team2.player1) : renderPlayer('default', 'Waiting')}
                                            {team2.player2 ? renderPlayer('second', team2.player2) : renderPlayer('default', 'Waiting')}
                                        </div>
                                    </td>
                                </tr>
                                { player.name !== team1.player1 && player.name !== team1.player2 && player.name !== team2.player1 && player.name !== team2.player2 &&
                                    <tr>
                                    <td>
                                        <div className='d-flex justify-content-center'>
                                            <Button disabled={team1.player1 && team1.player2} onClick={() => this.joinGame(1)}>Join</Button>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='d-flex justify-content-center'>
                                            <Button disabled={team2.player1 && team2.player2} onClick={() => this.joinGame(2)}>Join</Button>
                                        </div>
                                    </td>
                                </tr>
                                }
                                
                            </tbody>
                        </Table>
                    </div>
                    {game.gameStartedBy ? <Redirect to='/game'>game started by {game.gameStartedBy}</Redirect>
                        : <div className='d-flex justify-content-center'><Button disabled={!team1.player1 || !team1.player2 || !team2.player1 || !team2.player2} onClick={() => this.startGame()}>Start</Button></div>
                    }
                </>

            )
        } else {
            return <div>Loading start screen</div>
        }
    }
}

function mapStateToProps(state) {
    return { ws: state.ws.client, player: state.playerReducer.player };
}

const ConnectedComponent = connect(mapStateToProps)(StartGame);
export default ConnectedComponent;