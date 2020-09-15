import React from 'react';

import { Table, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import Axios from 'axios';

class ScoreComponent extends React.Component {

    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        if (!this.state.game) {
            console.log('Updating game');
            Axios.get('http://localhost:8080/game').then((res) => {
                this.setState({ game: res.data });
            })
        }
    }

    startNextMatch() {
        this.props.ws.publish({ destination: "/game/finishGame" });
        this.setState({ nextGameStarted: true })
    }

    render() {
        if (!this.state.game) {
            return <div>Loading score</div>;
        } else if (this.state.nextGameStarted) {
            return <Redirect to='/start'></Redirect>;
        } else {
            const game = this.state.game;
            const {team1, team2} = game;
            console.log('game in score', game)
            return (
                <div className='d-flex flex-column justify-content-center'>
                    <h4 className='p-4 justify-content-center'>Score board</h4>
                    <div className='w-25 p-4'>
                        <Table striped bordered>
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
                            </tbody>
                        </Table>
                    </div>
                    <div className='p-4'><Button onClick={() => {this.startNextMatch()}}>Start next match</Button></div>
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