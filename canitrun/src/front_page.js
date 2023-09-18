import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import { useHistory } from 'react-router-dom';

  
function FrontPage({user_cpu, user_gpu, user_ram, game_name, onChange}) {
    const history = useHistory();

    const handleSubmit = (e) => {
        
        e.preventDefault();
        history.push("/result");
    };
    
    const [cpuSuggestions, setCpuSuggestions] = useState([]);
    const [gpuSuggestions, setGpuSuggestions] = useState([]);

    const [cpuFocused, setCpuFocused] = useState(false);
    const [gpuFocused, setGpuFocused] = useState(false);


    const fetchSuggestions = async (input, type) => {
        try {
            const response = await fetch(`http://localhost:3001/api/suggestions?input=${input}&type=${type}`);
            console.log(response);
            if (response.ok) {
                const data = await response.json();
                if (type === 'CPU') {
                setCpuSuggestions(data);
                console.log(cpuSuggestions)
                console.log('cpu updated');
                } else if (type === 'GPU') {
                setGpuSuggestions(data);
                console.log(gpuSuggestions)
                console.log('gpu updated');
                }
            } else {
                console.error('Failed to fetch suggestions:', response.status);
            }
        } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        }
    };

    useEffect(() => {
        if (user_cpu) fetchSuggestions(user_cpu, 'CPU');
    }, [user_cpu]);

    useEffect(() => {
        if (user_gpu) fetchSuggestions(user_gpu, 'GPU');
    }, [user_gpu]);

    const onCpuBlurDelay = () => {
        setTimeout(() => {
          setCpuFocused(false);
        }, 200); // 200 milliseconds delay
      };
    
    const onGpuBlurDelay = () => {
        setTimeout(() => {
            setGpuFocused(false);
        }, 200); // 200 milliseconds delay
    };

    const [isCpuValid, setIsCpuValid] = useState(false);
    const [isGpuValid, setIsGpuValid] = useState(false);
  
    // Function to check if input matches any of the suggestions
    const checkInputValidity = (input, suggestions, type) => {
      const isValid = suggestions.some(
        (suggestion) => suggestion.Model.toLowerCase() === input.toLowerCase()
      );
  
      if (type === "CPU") {
        setIsCpuValid(isValid);
      } else if (type === "GPU") {
        setIsGpuValid(isValid);
      }
    };
  
    useEffect(() => {
      if (user_cpu && cpuSuggestions.length > 0) {
        checkInputValidity(user_cpu, cpuSuggestions, "CPU");
      }
    }, [user_cpu, cpuSuggestions]);
  
    useEffect(() => {
      if (user_gpu && gpuSuggestions.length > 0) {
        checkInputValidity(user_gpu, gpuSuggestions, "GPU");
      }
    }, [user_gpu, gpuSuggestions]);

  let id = "inputs";
  return (
        <div id={id}>
            <form onSubmit={handleSubmit}>
            <label htmlFor='game_name'>Game</label><br/>
            <input
                type='text'
                id='game_name'
                name='game_name'
                placeholder='Enter Name of the Game here'
                value={game_name}
                onChange= {onChange}
                autoComplete="off"
            />
            <br/>
            <label htmlFor='user_cpu'>User CPU</label><br/>
            <input
            type='text'
            id='user_cpu'
            name='user_cpu'
            placeholder='Enter your CPU here'
            value={user_cpu}
            onChange={onChange}
            onFocus={() => setCpuFocused(true)}
            onBlur={onCpuBlurDelay}
            autoComplete="off"
            />
            <div>
            {cpuFocused && cpuSuggestions.length > 0 ? (
                <div className="suggestions">
                {cpuSuggestions.map((suggestion, index) => (
                    <div 
                    className="suggestion-item"
                    key={index} 
                    onClick={() => {
                        console.log("Clicked on:", suggestion.Model);
                        onChange({ target: { name: 'user_cpu', value: suggestion.Model } });                    
                    }}
                    >
                    {suggestion.Model}
                    </div>
                ))}
                </div>
            ) : null}
            </div>
            <br/>
            <label htmlFor='user_gpu'>User GPU</label><br/>
            <input
                type='text'
                id='user_gpu'
                name='user_gpu'
                placeholder='Enter your GPU here'
                value={user_gpu}
                onChange= {onChange}
                onFocus={() => setGpuFocused(true)}
                onBlur={onGpuBlurDelay}
                autoComplete="off"
            />
            <div>
            {gpuFocused && gpuSuggestions.length > 0 ? (
                <div className="suggestions">
                {gpuSuggestions.map((suggestion, index) => (
                    <div 
                    className="suggestion-item"
                    key={index} 
                    onClick={() => {
                        onChange({ target: { name: 'user_gpu', value: suggestion.Model } });
                    }}
                    >
                    {suggestion.Model}
                    </div>
                ))}
                </div>
            ) : null}
            </div>
            <br/>
            <label htmlFor='user_ram'>User RAM</label><br/>
            <input
                type='text'
                id='user_ram'
                name='user_ram'
                placeholder='Enter your RAM here'
                value={user_ram}
                onChange= {onChange}
                autoComplete="off"
            />
            <br/>
            <input type="submit" value="Submit" />
          </form>
            <div>
                {isCpuValid ? "CPU input is valid" : "CPU input is not valid"}
            </div>
            <div>
                {isGpuValid ? "GPU input is valid" : "GPU input is not valid"}
            </div>
        </div>
  );
}

export default FrontPage;
