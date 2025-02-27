import { getNeighbors, Hex } from './hexUtils';

export const breadthFirstSearch = (playerPosition, hexPathMap, obstacles) => {
  // Safety check for parameters
  if (!playerPosition || !hexPathMap || !obstacles) {
    console.error("Missing parameters in breadthFirstSearch");
    return {};
  }
  
  const frontier = [playerPosition];
  const cameFrom = { [JSON.stringify(playerPosition)]: JSON.stringify(playerPosition) };
  
  while (frontier.length > 0) {
    const current = frontier.shift();
    
    getNeighbors(current).forEach(neighbor => {
      const neighborStr = JSON.stringify(neighbor);
      
      if (
        !cameFrom[neighborStr] &&
        hexPathMap.includes(neighborStr) &&
        !obstacles.has(neighborStr)
      ) {
        frontier.push(neighbor);
        cameFrom[neighborStr] = JSON.stringify(current);
      }
    });
  }
  
  return cameFrom;
};

export const getPath = (start, current, cameFrom) => {
  // Safety checks
  if (!start || !current || !cameFrom) {
    console.error("Missing parameters in getPath");
    return [];
  }
  
  const startStr = JSON.stringify(start);
  const currentStr = JSON.stringify(current);
  
  if (!cameFrom[currentStr] || !cameFrom[startStr]) return [];
  
  let path = [currentStr];
  let currentNode = currentStr;
  let safetyCounter = 0;
  const maxSteps = 1000;
  
  while (currentNode !== startStr && safetyCounter < maxSteps) {
    currentNode = cameFrom[currentNode];
    if (!currentNode) break;
    path.push(currentNode);
    safetyCounter++;
  }
  
  if (safetyCounter >= maxSteps) {
    console.warn("Pathfinding exceeded maximum steps");
    return [];
  }
  
  return path.reverse();
};
