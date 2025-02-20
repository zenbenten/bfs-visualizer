import React from 'react';
import BreadthFirstSearch from './BFS/BFS';
import './BFS/BFS.css';

function App() {
  return (
    <div className="app-container">
      {/* Single BFS Visualization */}
      <div className="bfs-container">
        <BreadthFirstSearch />
      </div>
    </div>
  );
}

export default App;
