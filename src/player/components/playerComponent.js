import React from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Axios from 'axios';
import { UPDATE_PLAYER } from '../../redux/actionTypes';
import { Button } from 'react-bootstrap'
import Cookies from 'js-cookie';

class PlayerComonent extends React.Component {

    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        if (!this.props.player) {
            const rangaPlayerCookie = Cookies.get('rangaPlayer');
            const headers = { playerid: rangaPlayerCookie };
            console.log('header', headers)
            Axios.get(`http://localhost:8080/player`, {headers})
                .then(res => this.props.dispatch({ type: UPDATE_PLAYER, payload: res.data }))
                .catch((err) => this.setState({ playerNotFound: true }));
        }
    }

    createPlayer(playerName) {
        Axios.post('http://localhost:8080/player', { name: playerName }).then(res => {
            if (res.data) {
                Cookies.set('rangaPlayer', res.data.id);
                this.props.dispatch({ type: UPDATE_PLAYER, payload: res.data });
            }
        });
    }

    render() {
        if (!this.props.player && !this.state.playerNotFound) {
            return <div>Loading player...</div>;
        }
        else if (!this.props.player && this.state.playerNotFound) {
            return (
                <div className='d-flex flex-column justify-content-center'>
                    <div className='d-flex justify-content-center'><span>Enter your name</span></div>
                    <div className='d-flex justify-content-center'><input className='d-flex justify-content-center' id='playerNameText' type='text'></input></div>
                    <div className='d-flex justify-content-center pt-4'><Button onClick={() => this.createPlayer(document.querySelector('#playerNameText').value)}>Submit</Button>
                    </div>
                </div>);

        } else {
            return <Redirect to='/start'>Redirecting...</Redirect>
        }
    }


}

function mapStateToProps(state) {
    return { player: state.playerReducer.player };
}

const ConnectedPlayerComponent = connect(mapStateToProps)(PlayerComonent);
export default ConnectedPlayerComponent;