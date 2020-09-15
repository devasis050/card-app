import React from 'react';
import { connect } from 'react-redux';
import {Redirect} from 'react-router-dom';
import Axios from 'axios';
import {UPDATE_PLAYER} from '../../redux/actionTypes';

class PlayerComonent extends React.Component {

    submitPlayer(playerName) {
        Axios.post('http://localhost:8080/player', {name:playerName}).then(res=> {
            if(res.data) {
                this.props.dispatch({type:UPDATE_PLAYER, payload:res.data});
            }
        });
    }

    render() {
        if(this.props.player.name) {
            return <Redirect to='/start'>Redirecting...</Redirect>
        } else {
            return (
                <div className='d-flex justify-content-center pt-4'>
                    <label htmlFor='playerNameText'>Enter your name </label>
                    <input id='playerNameText' type='text'></input>
                    <button onClick={() => this.submitPlayer(document.querySelector('#playerNameText').value)} >Submit</button>
                </div>);
        }
    }


}

function mapStateToProps(state) {
    return {player: state.player};
}

const ConnectedPlayerComponent = connect(mapStateToProps)(PlayerComonent);
export default ConnectedPlayerComponent;