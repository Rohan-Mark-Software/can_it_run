import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";

import FrontPage from './front_page';
import Result from './result_page';
import "./App.css";

function App() {
  const [inputs, setinputs] = useState({
    game_name: '',
    game_id: '',
    user_cpu: '',
    user_gpu: '',
    user_ram: ''
  });

  const {game_name, game_id, user_cpu, user_gpu, user_ram} = inputs;
  const setGameId = (newGameId) => {
    setinputs({
        ...inputs,
        game_id: newGameId
    });
  };
  const onChange = e => {
    const {name, value} = e.target;

    if (name === 'user_ram' && isNaN(value)) {
      return;
    }
    
    setinputs({
      ...inputs,
      [name]: value
    });

  };

  return (
    <Router>
      <h1>Testing Page</h1>
        <Switch>
          <Route path="/frontpage">
            <FrontPage
              game_name={game_name}
              game_id={game_id}
              user_cpu={user_cpu}
              user_gpu={user_gpu}
              user_ram={user_ram}
              onChange={onChange}
              setGameId={setGameId}  
            />
          </Route>
          <Route path="/result">
            <Result
              game_name={game_name}
              game_id={game_id}
              user_cpu={user_cpu}
              user_gpu={user_gpu}
              user_ram={user_ram}
            />
          </Route>
          <Redirect to="/frontpage" />
        </Switch>
    </Router>
  ) ;
}

export default App;
