import React from 'react';
import { connect } from 'react-redux';
import Axios from 'axios';
import { UPDATE_PLAYER } from '../../redux/actionTypes';
import { Button, Image, Spinner, Badge, Modal } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import {CARD_ADDA_SERVRE_URL} from '../../url';

class GameComponent extends React.Component {

    constructor() {
        super();
        this.state = { isSubscribed: false };
        this.onMessage = this.onMessage.bind(this);
    }

    componentDidMount() {
        if (!this.state.game) {
            Axios.get(`${CARD_ADDA_SERVRE_URL}/game`).then((res) => {
                this.setState({ game: res.data });
            })
        }
        if(this.props.player && this.props.player.cards.length === 0) {
            const rangaPlayerCookie = Cookies.get('rangaPlayer');
            const headers = { playerid: rangaPlayerCookie };
            Axios.get(`${CARD_ADDA_SERVRE_URL}/player`, {headers})
                .then(res => this.props.dispatch({ type: UPDATE_PLAYER, payload: res.data }))
                .catch((err) => this.setState({ type: UPDATE_PLAYER, payload: null }));
        }
        if (this.props.ws) {
            this.subscribe();
        }

    }


    subscribe() {
        this.setState({ isSubscribed: true });
        this.props.ws.subscribe("/game/called", this.onMessage);
        this.props.ws.subscribe("/game/nextRound", this.onMessage)
        this.props.ws.subscribe("/game/moveAdded", this.onMessage);
    }

    componentDidUpdate() {
        if (!this.state.isSubscribed && this.props.ws) {
            this.subscribe();
        }
    }


    onMessage(msg) {
        const game = JSON.parse(msg.body);
        this.setState({ game });
    }

    submitCalledNumber(value) {
        this.props.player.call = value;
        this.props.ws.publish({ destination: "/game/call", body: JSON.stringify(this.props.player) });
    }

    selectMove(selectedCard) {
        const round = this.state.game.round;
        const player = this.props.player;
        
        if (round.nextTurn === player.name && round.number !== 0) {
            this.setState({ selectedCard });
        }

        //Last card joker scenario missing
        // let validMove = true;
        // const isJoker = selectedCard.type == 'S' && selectedCard.number == 2;
        // console.log('isJoker', isJoker);
        // if (round.nextTurn === player.name) {
        //     if (!isJoker && round.base && round.base.type != selectedCard.type && player.cards.find(card => card.type === round.base.type)) {
        //         alert('No cheating');
        //     } else {
        //         this.setState({ selectedCard });
        //     }
        // }
    }

    handleCloseModal() {
        this.setState({ selectedCard: null });
    }

    confirmMove() {
        const game = this.state.game;
        const player = this.props.player;
        const move = {};
        const selectedCard = this.state.selectedCard
        move[player.name] = selectedCard;
        const rangaPlayerCookie = Cookies.get('rangaPlayer');
        const headers = { playerid: rangaPlayerCookie };

        Axios.post(`${CARD_ADDA_SERVRE_URL}/player/removecard`, selectedCard, { headers }).then(res => {
            if (res.data) {
                this.props.dispatch({ type: UPDATE_PLAYER, payload: res.data });
            }
        });
        this.props.ws.publish({ destination: "/game/submitMove", body: JSON.stringify(move) });
        this.handleCloseModal();
    }

    render() {
        const game = this.state.game;
        const player = this.props.player;
        if (!game) {
            return <div>Loading game...</div>;
        } else if (game.round.number == 14) {
            return <Redirect to='/score'>Gave over</Redirect>
        } else if (!player) {
            return <Redirect to='/'>User not found</Redirect>
        } else {
            const round = game.round;
            const team1 = game.team1;
            const team2 = game.team2;

            const players = [team1.player1, team2.player1, team1.player2, team2.player2];
            const callPhase = round.number === 0;
            const moves = round.moves;

            return (
                <div className='container-fluid'>
                    <div className='row d-flex justify-content-center pb-2'>Welcome {player.name}</div>
                    <div className='row'>
                        <div className='col-4 d-flex flex-column '>
                            <span className='d-flex justify-content-center'>{team1.player1[0]}{team1.player2[0]}</span>
                            <span className='d-flex justify-content-center'>{team1.score}/{team1.call}</span>
                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <span className='d-flex justify-content-center'>Ranga</span>
                            <Image thumbnail src={`../../../static/cards/${round.ranga.type + round.ranga.number}.png`}></Image>
                        </div>
                        <div className='col-2 d-flex flex-column'>
                            <span className='d-flex justify-content-center'>Base</span>
                            <Image thumbnail src={round.base ? `../../../static/cards/${round.base.type + round.base.number}.png` : '../../../static/cards/back.png'} ></Image>
                        </div>
                        <div className='col-4 d-flex flex-column'>
                            <span className='d-flex justify-content-center'>{team2.player1[0]}{team2.player2[0]}</span>
                            <span className='d-flex justify-content-center'>{team2.score}/{team2.call}</span>
                        </div>
                    </div>
                    <div className='row d-flex justify-content-center p-2'>
                        <b>{round.winner ? `Round won by ${round.winner}` : `Round ${round.number}`}</b>
                    </div>
                    <div className='row'>
                        {callPhase ? players.map(player => (
                            <div className='col-3 d-flex flex-column' key={player}>
                                <span className='d-flex justify-content-center'>{player}</span>
                                <div className='d-flex justify-content-center'>
                                    {!round.calls.hasOwnProperty(player) ?
                                        <div>
                                            <span>Calling</span>
                                            <Spinner size='sm' animation="border" variant="primary" />
                                        </div> :
                                        <div>
                                            <span>{round.calls[player] ? round.calls[player] : 'Called'}</span>
                                            <Badge variant="success"><i className="fa fa-check" aria-hidden="true" /></Badge>
                                        </div>
                                    }
                                </div>
                            </div>
                        )) :
                            players.map(player => (
                                <div key={player} className='col-3'>
                                    <div className='d-flex flex-column justify-content-center' >
                                        <span className='d-flex justify-content-center'>{player}</span>
                                        <img className='h-100 w-100' src={moves[player] ? `../../../static/cards/${moves[player].type + moves[player].number}.png` : '../../../static/cards/back.png'}></img>
                                        {round.nextTurn === player && <span className='d-flex justify-content-center text'>
                                            <Spinner size='sm' animation="grow" variant="primary" />
                                        </span>
                                        }
                                    </div>
                                </div>
                            ))}


                    </div>
                    {callPhase && <div className='row p-4'>
                        {player.call < 0 ?
                            <div className="input-group d-flex justify-content-center">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">Call</span>
                                </div>
                                <input type="text" size='2' placeholder="0-13" id='calledNumber' />
                                <div className="input-group-append">
                                    <button className="btn btn-primary" onClick={() => this.submitCalledNumber(document.querySelector('#calledNumber').value)}>Submit</button>
                                </div>
                            </div> :
                            <div className="d-flex justify-content-center">
                                <span className='text-primary'>{`You have called ${player.call}`}</span>
                            </div>
                        }
                    </div>
                    }

                    <div className='row pt-2'>
                        {player.cards.map((card, index) => (
                            <div key={index} className='col-3 col-md-1'>
                                <Image className={player.name === round.nextTurn && !callPhase? 'bg-primary' : 'bg-mute'} onClick={() => this.selectMove(card)} fluid src={`../../../static/cards/${card.type + card.number}.png`}></Image>
                            </div>

                        ))}
                    </div>
                    <Modal show={!!this.state.selectedCard} onHide={() => this.handleCloseModal()} centered size='sm' >
                        <Modal.Body className="d-flex justify-content-center">
                            {this.state.selectedCard &&
                                <img src={`../../../static/cards/${this.state.selectedCard.type + this.state.selectedCard.number}.png`} className='w-75 h-75'></img>
                            }
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => this.handleCloseModal()}>
                                Close
                            </Button>
                            <Button variant="primary" onClick={() => this.confirmMove()}>
                                Confirm
                            </Button>
                        </Modal.Footer>
                    </Modal>

                </div>

            );
        }
    }
}


function mapStateToProps(state) {
    return { player: state.playerReducer.player, ws: state.ws.client };
}

const ConnectedGameComponent = connect(mapStateToProps)(GameComponent);

export default ConnectedGameComponent;