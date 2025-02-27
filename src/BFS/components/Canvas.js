import React from 'react';

// Use forwardRef to properly handle ref forwarding
const Canvas = ({ 
  id, 
  className, 
  width, 
  height, 
  onMouseMove, 
  onClick, 
  onContextMenu,
  forwardedRef
}) => {
  return (
    <canvas
      id={id}
      className={className}
      ref={forwardedRef}
      width={width}
      height={height}
      onMouseMove={onMouseMove}
      onClick={onClick}
      onContextMenu={onContextMenu}
    />
  );
};

export default Canvas;
