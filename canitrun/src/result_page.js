import React from 'react';

const Result = ({ user_cpu, user_gpu, user_ram, game_name }) => {
  return (
    <div>
      <h1>Results</h1>
      <p>Game: {game_name}</p>
      <p>CPU: {user_cpu}</p>
      <p>GPU: {user_gpu}</p>
      <p>RAM: {user_ram}</p>
    </div>
  );
};

export default Result;
