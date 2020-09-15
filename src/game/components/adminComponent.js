import Axios from "axios";
import React from 'react';

const AdminComponent = () => {
    
    const resetGame = () => {
        Axios.post('http://localhost:8080/game/reset').then(res => {
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