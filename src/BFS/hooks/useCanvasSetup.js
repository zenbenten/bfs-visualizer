import { useEffect, useState } from 'react';
import { getHexParameters } from '../utils/hexUtils';

const useCanvasSetup = (canvasRefs, hexSize, hexOrigin, canvasSize) => {
  const [canvasPosition, setCanvasPosition] = useState(null);
  const [hexParameters, setHexParameters] = useState(null);
  
  // Initialize canvas dimensions and get position
  useEffect(() => {
    const { canvasWidth, canvasHeight } = canvasSize;
    
    // Calculate hex parameters
    const params = getHexParameters(hexSize);
    setHexParameters(params);
    
    // Set canvas dimensions
    canvasRefs.forEach(ref => {
      if (ref.current) {
        ref.current.width = canvasWidth;
        ref.current.height = canvasHeight;
      }
    });
    
    // Get canvas position for interaction calculations
    if (canvasRefs[2]?.current) { // Assuming index 2 is the interaction canvas
      const rect = canvasRefs[2].current.getBoundingClientRect();
      setCanvasPosition({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      });
    }
  }, [canvasRefs, hexSize, canvasSize]);
  
  return { canvasPosition, hexParameters };
};

export default useCanvasSetup;
