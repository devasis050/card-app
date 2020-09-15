import React from 'react';
import { connect } from 'react-redux';
import Axios from 'axios';
import { UPDATE_PLAYER } from '../../redux/actionTypes';
import {Modal, Button, Card, Image } from 'react-bootstrap';
import ReactConfirmAlert from 'react-confirm-alert';
import {Redirect} from 'react-router-dom';
// import { Card } from 'react-bootstrap'
// import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';


class GameComponent extends React.Component {

    constructor() {
        super();
        this.state = { isSubscribed: false };
        this.onMessage = this.onMessage.bind(this);
    }

    componentDidMount() {
        if (this.props.player.cards.length === 0) {
            Axios.post(`http://localhost:8080/player/${this.props.player.name}`)
                .then((res) => {
                    if (res.data) {
                        this.props.dispatch({ type: UPDATE_PLAYER, payload: res.data });
                    }
                })
        }

        if (!this.state.game) {
            console.log('Updating game');
            Axios.get('http://localhost:8080/game').then((res) => {
                this.setState({ game: res.data });
            })
        }
        console.log('Subscribing to /game/called', this.props);
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
        // if (this.state.game) {
        //     this.checkAndStartRound()
        // }
    }


    onMessage(msg) {
        console.log('Recieved message from server', msg.body);
        const game = JSON.parse(msg.body);
        this.setState({ game });
    }

    submitCalledNumber(value) {
        console.log('Type of value', typeof value);
        this.props.player.call = value;
        this.props.ws.publish({ destination: "/game/call", body: JSON.stringify(this.props.player) });
    }

    // checkAndStartRound() {
    //     console.log('checkAndStartRound', this.state.game);
    //     const calls = this.state.game.round.calls;
    //     const {team1, team2} = this.state.game;
    //     const players = [team1.player1, team2.player1, team1.player2, team2.player2];
    //     const everyOneCalled = !players.find(player => !calls.hasOwnProperty(player))
    //     console.log('everyOneCalled', everyOneCalled);
    //     if (everyOneCalled) {
    //         setTimeout(() => { this.props.ws.publish({ destination: "/game/submitRound", body: JSON.stringify(this.props.player) }) }, 5000);
    //     }

    // }

    selectMove(card) {
        // console.log('select move', card);
        // this.setState({selectedCard:card});
        this.confirmMove(card);
    }

    handleCloseModal() {
        this.setState({selectedCard:null});
    }

    confirmMove(selectedCard) {
        const game = this.state.game;
        const round = game.round;
        const player = this.props.player;
        const move = {};
        // const selectedCard = this.state.selectedCard
        move[player.name] = selectedCard;
        
        console.log('handle confirm', move);
        Axios.post(`http://localhost:8080/player/${this.props.player.name}/removecard`, selectedCard).then(res=> {
            if(res.data) {
                this.props.dispatch({type:UPDATE_PLAYER, payload:res.data});
            }
        });
        this.props.ws.publish({ destination: "/game/submitMove", body: JSON.stringify(move) });
        this.handleCloseModal();
    }

    render() {

        console.log('player render', this.props.player);

        const game = this.state.game;

        if (!game) {
            return <div>Loading game...</div>;
        } else if(game.round.number == 14) {
            return <Redirect to='/score'>Gave over</Redirect>
        } else {
            const player = this.props.player;
            const round = game.round;
            const team1 = game.team1;
            const team2 = game.team2;

            const players = [team1.player1, team2.player1, team1.player2, team2.player2];
            const callPhase = round.number === 0;
            const moves = round.moves;

            return (
                <div className='container'>
                    <div className='row d-flex justify-content-center'>Welcome {player.name}</div>
                    <div className='row p-4'>
                        <div className='col-3'>
                            <h4>{team1.player1}/{team1.player2}</h4>
                            <span>Score -{team1.score}/{team1.call}</span>
                        </div>
                        <div className='col-3'>
                            <span>Ranga</span><br/>
                            <img src={`../../../static/cards/${round.ranga.type + round.ranga.number}.png`} className='w-25 h-51'></img>
                        </div>
                        <div className='col-3'>
                            <span>Base</span><br/>
                            <img src={round.base ? `../../../static/cards/${round.base.type + round.base.number}.png` : '../../../static/cards/back.png'} className='w-25 h-51'></img>
                        </div>
                        <div className='col-3'>
                            <h4>{team2.player1}/{team2.player2}</h4>
                            <span>Score -{team2.score}/{team2.call}</span>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <strong className='text-danger '> 
                            {round.winner ? `Round won by ${round.winner}`:`Round ${round.number}`}
                        </strong>
                    </div>
                    <div className='row p-4'>

                        {callPhase ? players.map(player => (<div className='col-3' key={player}>
                            <span>{player}</span><br />
                            {!round.calls.hasOwnProperty(player) ? <span>Calling..</span>
                                : <span>{round.calls[player] ? round.calls[player] : 'Called'}</span>}<br />
                        </div>
                        )) :
                        players.map(player => (
                                <div className='col-3'>
                                    <span>{player}</span><br />
                                    <img src={moves[player] ? `../../../static/cards/${moves[player].type + moves[player].number}.png` : '../../../static/cards/back.png'} className='w-50 h-75'></img><br />
                                    {round.nextTurn === player && <i className="fas fa-angle-double-up"></i>}
                                </div>
                            ))}


                    </div>
                    {callPhase && <div className='row p-4 m-4'>
                            {player.call < 0 ?
                                <div><label htmlFor='calledNumber'>Call</label>
                                    <input type='text' id='calledNumber'></input>
                                    <button onClick={() => this.submitCalledNumber(document.querySelector('#calledNumber').value)}>Submit</button>
                                </div> :
                                <div className=''>
                                    <span>{`You have called ${player.call}`}</span>
                                </div>
                            }
                        </div>
                    }
                    


                    <div className='row p-4 m-4'>
                        {player.cards.map((card, index) => (
                            <div className='col-2' key={index}>
                                
                                <Card>
                                    <Card.Img variant="top" src={`../../../static/cards/${card.type + card.number}.png`} />
                                    {round.nextTurn === player.name && 
                                        <Card.Body>
                                           <Button block='true' variant="primary" onClick={() => this.selectMove(card)}>Move</Button>
                                        </Card.Body>
                                    }
                                </Card>
                                <Modal show={false} onHide={() => this.handleCloseModal()} size='sm'>
                                    <Modal.Body>
                                        { this.state.selectedCard && 
                                            <img src={`../../../static/cards/${this.state.selectedCard.type + this.state.selectedCard.number}.png`} className='w-100 h-100'></img>
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
                        ))}
                    </div>
                </div>

            );
        }



    }


}


function mapStateToProps(state) {
    return { player: state.player, ws: state.ws.client };
}

const ConnectedGameComponent = connect(mapStateToProps)(GameComponent);

export default ConnectedGameComponent;