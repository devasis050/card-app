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
        const confirmed = confirm("Are you sure??") 
        if(confirmed) {
            Axios.post(`${CARD_ADDA_SERVRE_URL}/game/reset`).then(res => {
                this.setState({ gameReset: true })
            })
        }


    }
    resetPlayer() {
        const confirmed = confirm("Are you sure??") 
        if(confirmed) {
            Axios.post(`${CARD_ADDA_SERVRE_URL}/player/clear`).then(res => {
                this.setState({ playerReset: true })
            })
        }
    }
    resetMatch() {
        const confirmed = confirm("Are you sure??") 
        if(confirmed) {
            Axios.post(`${CARD_ADDA_SERVRE_URL}/game/resetMatch`).then(res => {
                this.setState({ matchReset: true })
            })
        }
    }
    render() {
        return (
            <>
                <div className='d-flex flex-column justify-content-center pt-4'>
                    <div>
                        <Button className='m-4' onClick={() => this.resetGame()}>Reset game</Button>
                        <span>Hard reset game. This will clear score, player, match.</span>
                    </div>
                    <div>
                        <Button className='m-4' onClick={() => this.resetPlayer()}>Reset player</Button>
                        <span>This will clear payer data and remove player from game</span>
                    </div>
                    <div>
                        <Button className='m-4' onClick={() => this.resetMatch()}>Reset match</Button>
                        <span>This will end match. This retains team and score information</span>
                    </div>
                    
                    
                </div>
                {this.state.gameReset && <div className='d-flex justify-content-center pt-4'>Game reset successful</div>}
                {this.state.playerReset && <div className='d-flex justify-content-center pt-4'>Player reset successful</div>}
                {this.state.matchReset && <div className='d-flex justify-content-center pt-4'>Match reset successful</div>}
            </>
        );
    }

}

export default AdminComponent;