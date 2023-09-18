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
import * as feartures from './features.mjs';
import "./App.css";

function App() {
  const [inputs, setinputs] = useState({
    game_name: '',
    user_cpu: '',
    user_gpu: '',
    user_ram: ''
  });

  const {game_name, user_cpu, user_gpu, user_ram} = inputs
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
              user_cpu={user_cpu}
              user_gpu={user_gpu}
              user_ram={user_ram}
              onChange={onChange}
            />
          </Route>
          <Route path="/result">
            <Result
              game_name={game_name}
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
