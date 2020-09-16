import Axios from "axios";
import React from 'react';
import {CARD_ADDA_SERVRE_URL} from '../../url';

const AdminComponent = () => {
    
    const resetGame = () => {
        Axios.post(`${CARD_ADDA_SERVRE_URL}/game/reset`).then(res => {
                console.log('Game reset', res.data);
            })
    }

    return (
        <div className='d-flex justify-content-center pt-4'>
            <button onClick={() => resetGame()}>Reset game</button>
        </div>
    )
}

export default AdminComponent;