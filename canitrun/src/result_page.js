import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Result = () => {
    const [results, setResults] = useState([{
      MIN_CPU: 'null',
      MIN_GPU: 'null',
      MIN_RAM: 'null',
      REC_CPU: 'null',
      REC_GPU: 'null',
      REC_RAM: 'null'
    }]);
    
    const location = useLocation();
    const { game_name, user_cpu, user_gpu, user_ram } = location.state || {};

    const getDatas = async (target) => {
      try {
        const response = await fetch(`http://localhost:3001/api/request_data?game=${target}`);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            console.log(response);
            setResults(data)
        } else {
            console.error('Failed to fetch data:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
      
    useEffect(() => {
      if(game_name) {
        console.log(game_name)
        getDatas(game_name);
      }
    }, [game_name]); 

    return (
        <div>
            <div className='result'>
                'game name': {game_name}
                <br/>
                'user_cpu': {user_cpu}
                <br/>
                'user_gpu': {user_gpu}
                <br/>
                'user_ram': {user_ram}
                <br/>
                'min_cpu': {results[0].MIN_CPU}
                <br/>
                'min_gpu': {results[0].MIN_GPU}
                <br/>
                'min_ram': {results[0].MIN_RAM}
                <br/>
                'rec_cpu': {results[0].REC_CPU}
                <br/>
                'rec_gpu': {results[0].REC_GPU}
                <br/>
                'rec_ram': {results[0].REC_RAM}
            </div>
        </div>
    );
};

export default Result;
