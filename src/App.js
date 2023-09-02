import logo from './logo.svg';
import React, { useState } from 'react';
import 'features';
import './App.css';

function App() {
  const [cpu, setCpu] = useState('enter your cpu here');
  const [gpu, setGpu] = useState('enter your gpu here');
  const [ram, setRam] = useState('enter your ram here');


  let id = "inputs";
  return (
      <div className={"App"}>
        <div id={id}>
          <form>
            <label htmlFor='user_cpu'>User CPU</label><br/>
            <input
                type='text'
                id='user_cpu'
                name='user_cpu'
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
            />
            <br/>
            <label htmlFor='user_gpu'>User GPU</label><br/>
            <input
                type='text'
                id='user_gpu'
                name='user_gpu'
                value={gpu}
                onChange={(e) => setGpu(e.target.value)}
            />
            <br/>
            <label htmlFor='user_ram'>User RAM</label><br/>
            <input
                type='text'
                id='user_ram'
                name='user_ram'
                value={ram}
                onChange={(e) => setRam(e.target.value)}
            />
            <br/>
            <input type='submit' value='Submit' />
          </form>
        </div>
      </div>
  );
}

export default App;
