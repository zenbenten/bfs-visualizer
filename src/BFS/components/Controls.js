import React from 'react';

const Controls = ({ onClearWalls }) => {
  return (
    <div className="controlPanel">
      <button 
        onClick={onClearWalls}
        className="button button-primary"
      >
        Clear Walls
      </button>
    </div>
  );
};

export default Controls;
