import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import loadingAnimation from './loading.svg';
function FrontPage({user_cpu, user_gpu, user_ram, game_name, onChange, setGameId}) {
    const history = useHistory();

    const [isGameValid, setIsGameValid] = useState(false);
    const [isCpuValid, setIsCpuValid] = useState(false);
    const [isGpuValid, setIsGpuValid] = useState(false);

    const [isLoadingGame, setIsLoadingGame] = useState(false);
    const [isLoadingCPU, setIsLoadingCPU] = useState(false);
    const [isLoadingGPU, setIsLoadingGPU] = useState(false);

    const [finishedTypingGame, setFinishedTypingGame] = useState(false);
    const [finishedTypingCPU, setFinishedTypingCPU] = useState(false);
    const [finishedTypingGPU, setFinishedTypingGPU] = useState(false);

    const [gameSuggestions, setGameSuggestions] = useState([]);
    const [cpuSuggestions, setCpuSuggestions] = useState([]);
    const [gpuSuggestions, setGpuSuggestions] = useState([]);

    const [gameFocused, setGameFocused] = useState(false);
    const [cpuFocused, setCpuFocused] = useState(false);
    const [gpuFocused, setGpuFocused] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      if(!isCpuValid || !user_cpu){
        alert("CPU is not set. Cannot proceed.");
      }else if(!isGpuValid || !user_gpu){
        alert("GPU ID is not set. Cannot proceed.");
      }else if(!isGameValid || !game_name){
        alert("Game Name is not set. Cannot proceed.");
      }else if(!user_ram){
        alert("RAM is not set. Cannot proceed.");
      }
      else{
        
        history.push("/result", { 
          game_name: game_name,
          user_cpu: user_cpu,
          user_gpu: user_gpu,
          user_ram: user_ram,
        });
      }

    };

    const fetchSuggestions = async (input, type) => {
      try {
        const response = await fetch(`http://localhost:3001/api/suggestions?input=${input}&type=${type}`);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            console.log(response);
            if (type === 'CPU') {
            setCpuSuggestions(data);
            } else if (type === 'GPU') {
            setGpuSuggestions(data);
            } else if (type === 'Game') {
            setGameSuggestions(data);
            }
        } else {
            console.error('inside if Failed to fetch suggestions:', response.status);
        }
      } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      } finally {
        if (type === 'Game'){
          setIsLoadingGame(false);  // Set loading state to false when done
        }
        if (type === 'CPU'){
          setIsLoadingCPU(false);  // Set loading state to false when done
        }
        if (type === 'GPU'){
          setIsLoadingGPU(false);  // Set loading state to false when done
        }
      }
    };

    useEffect(() => {
      if (!finishedTypingGame){
        if (game_name) {
          setGameSuggestions([])
          setIsLoadingGame(true);  // Set loading state to true for game_name
          const timer = setTimeout(() => {
            fetchSuggestions(game_name.toUpperCase(), 'Game');
          }, 600); 
          return () => {
            clearTimeout(timer);
          };
        }else{
          setGameSuggestions([])
        }
      }else{
        setFinishedTypingGame(false);
      }
    }, [game_name]);

    useEffect(() => {
      if (!finishedTypingCPU){
        if (user_cpu) {
          setCpuSuggestions([])
          setIsLoadingCPU(true);  // Set loading state to true for game_name
          const timer = setTimeout(() => {
            fetchSuggestions(user_cpu, 'CPU');
          }, 600); 
          return () => {
            clearTimeout(timer);
          };
        }else{
          setCpuSuggestions([])
        }
      }else{
        setFinishedTypingCPU(false);
      }
    }, [user_cpu]);

    useEffect(() => {
      if (!finishedTypingGPU){
        if (user_cpu) {
          setGpuSuggestions([])
          setIsLoadingGPU(true);  // Set loading state to true for game_name
          const timer = setTimeout(() => {
            fetchSuggestions(user_gpu, 'GPU');
          }, 600); 
          return () => {
            clearTimeout(timer);
          };
        }else{
          setGpuSuggestions([])
        }
      }else{
        setFinishedTypingGPU(false);
      }
    }, [user_gpu]);

    const onGameBlurDelay = () => {
        setTimeout(() => {
          setGameFocused(false);
        }, 200); // 200 milliseconds delay
      };

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

    // Function to check if input matches any of the suggestions
    const checkInputValidity = (input, suggestions, type) => {
      const matchingSuggestion = suggestions.find(
          (suggestion) => suggestion.Model.toLowerCase() === input.toLowerCase()
      );
      const isValid = Boolean(matchingSuggestion);
      if (type === "CPU") {
          setIsCpuValid(isValid);
      } else if (type === "GPU") {
          setIsGpuValid(isValid);
      } else if (type === "Game") {
          setIsGameValid(isValid);
      }
  };
  
    useEffect(() => {
        if (game_name && gameSuggestions.length > 0) {
          checkInputValidity(game_name, gameSuggestions, "Game");
        }
      }, [game_name, gameSuggestions]);

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
                onFocus={() => setGameFocused(true)}
                onBlur={onGameBlurDelay}
                autoComplete="off"
            />
            {isLoadingGame ? (
            <div className="loading">
                <img src={loadingAnimation} alt="Loading..." />
            </div>
            ) : null }
            <div>
            {gameFocused && gameSuggestions.length > 0 ? (
                <div className="suggestions">
                {gameSuggestions.map((suggestion, index) => (
                    <div 
                    className="suggestion-item"
                    key={index} 
                    onClick={() => {
                        setFinishedTypingGame(true);
                        onChange({ target: { name: 'game_name', value: suggestion.Model } });           
                    }}
                    >
                    {suggestion.Model}
                    </div>
                ))}
                </div>
            ) : null}
            </div>
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
            {isLoadingCPU ? (
            <div className="loading">
                <img src={loadingAnimation} alt="Loading..." />
            </div>
            ) : null }
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
            {isLoadingGPU ? (
            <div className="loading">
                <img src={loadingAnimation} alt="Loading..." />
            </div>
            ) : null }
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
                {isGameValid ? "Game input is valid" : "Game input is not valid"}
            </div>
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
