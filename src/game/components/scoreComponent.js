import React from 'react';

import { Table, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Axios from 'axios';
import {CARD_ADDA_SERVRE_URL} from '../../url'

class ScoreComponent extends React.Component {

    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        if (!this.state.game) {
            Axios.get(`${CARD_ADDA_SERVRE_URL}/game`).then((res) => {
                this.setState({ game: res.data });
            })
        }
    }

    backToGameHandler() {
        if(this.state.game.round.number == 14) {
            Axios.post(`${CARD_ADDA_SERVRE_URL}/game/finishGame`).then(res=> {
                console.log('Next game started');
            });
        } 
        this.setState({backToGame:true})
    }

    render() {
        if (!this.state.game) {
            return <div>Loading score</div>;
        } else if(this.state.backToGame) {
            return <Redirect to='/start'></Redirect>;
        } else {
            const game = this.state.game;
            const {team1, team2} = game;
            const team1TotalScore = game.team1Score.reduce((t1,t2) => t1 + t2, 0);
            const team2TotalScore = game.team2Score.reduce((t1,t2) => t1 + t2, 0);
            return (
                <div className='d-flex flex-column justify-content-center'>
                    <h4 className='p-4 d-flex justify-content-center'>Score board</h4>
                    <div className='w-auto p-4 mx-auto' >
                        <Table striped bordered >
                            <thead>
                                <tr>
                                    <th>{team1.player1}/{team1.player2}</th>
                                    <th>{team2.player1}/{team2.player2}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    game.team1Score.map((score1, index) => {
                                        return <tr key={index}>
                                            <td>{score1}</td>
                                            <td>{game.team2Score[index]}</td>
                                        </tr>
                                    })
                                }
                                <tr className='table-dark'>
                                    <td>{team1TotalScore}</td>
                                    <td>{team2TotalScore}</td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>
                    <div className='p-4 d-flex justify-content-center'>
                        <Button onClick={() => { this.backToGameHandler() }}>Back go game</Button>
                    </div>
                </div>
            )
        }
    }

}

function mapStateToProps(state) {
    return { ws: state.ws.client };
}

const ConnectedScoreComponent = connect(mapStateToProps)(ScoreComponent);
export default ConnectedScoreComponent;