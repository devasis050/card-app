import Axios from "axios";
import React from 'react';
import { CARD_ADDA_SERVRE_URL } from '../../url';
import { Button } from "react-bootstrap";

class AdminComponent extends React.Component {

    constructor() {
        super();
        this.state = {};
    }

    resetGame() {
        Axios.post(`${CARD_ADDA_SERVRE_URL}/game/reset`).then(res => {
            this.setState({ gameReset: true })
        })
    }
    resetPlayer() {
        Axios.post(`${CARD_ADDA_SERVRE_URL}/player/clear`).then(res => {
            this.setState({ playerReset: true })
        })
    }
    render() {
        return (
            <>
                <div className='d-flex justify-content-center pt-4'>
                    <Button className='m-4' onClick={() => this.resetGame()}>Reset game</Button>
                    <Button className='m-4' onClick={() => this.resetPlayer()}>Reset player</Button>
                </div>
                {this.state.gameReset && <div className='d-flex justify-content-center pt-4'>Game reset successful</div>}
                {this.state.playerReset && <div className='d-flex justify-content-center pt-4'>Player reset successful</div>}
            </>
        );
    }

}

export default AdminComponent;