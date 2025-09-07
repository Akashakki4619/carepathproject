import { RouteOptimization } from '@/types';

export interface NavigationInstruction {
  type: 'turn_left' | 'turn_right' | 'continue_straight' | 'arrive_destination' | 'start_route';
  instruction: string;
  distance: number; // in meters
  streetName?: string;
  icon: string;
}

// Calculate distance between two coordinates in meters
function calculateDistanceMeters(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate bearing between two coordinates
function calculateBearing(coord1: [number, number], coord2: [number, number]): number {
  const lat1 = coord1[1] * Math.PI / 180;
  const lat2 = coord2[1] * Math.PI / 180;
  const deltaLon = (coord2[0] - coord1[0]) * Math.PI / 180;

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

// Determine turn direction based on bearing change
function getTurnDirection(currentBearing: number, nextBearing: number): 'left' | 'right' | 'straight' {
  let bearingDiff = nextBearing - currentBearing;
  
  // Normalize to -180 to 180
  while (bearingDiff > 180) bearingDiff -= 360;
  while (bearingDiff < -180) bearingDiff += 360;
  
  if (Math.abs(bearingDiff) < 15) return 'straight';
  return bearingDiff > 0 ? 'right' : 'left';
}

// Generate navigation instructions from route
export function generateNavigationInstructions(route: RouteOptimization): NavigationInstruction[] {
  if (!route?.route || route.route.length < 2) {
    return [{
      type: 'start_route',
      instruction: 'Start your route',
      distance: 0,
      icon: '🚀'
    }];
  }

  const instructions: NavigationInstruction[] = [];
  const waypoints = route.route;

  // Start instruction
  instructions.push({
    type: 'start_route',
    instruction: 'Start your route to destination',
    distance: 0,
    icon: '🚀'
  });

  // Process each segment of the route
  for (let i = 0; i < waypoints.length - 1; i++) {
    const currentPoint = waypoints[i];
    const nextPoint = waypoints[i + 1];
    const distance = calculateDistanceMeters(currentPoint, nextPoint);

    // Skip very short segments (less than 10 meters)
    if (distance < 10) continue;

    let instruction: NavigationInstruction;

    if (i === 0) {
      // First segment - start direction
      const bearing = calculateBearing(currentPoint, nextPoint);
      const direction = getDirectionFromBearing(bearing);
      
      instruction = {
        type: 'continue_straight',
        instruction: `Head ${direction}`,
        distance: Math.round(distance),
        icon: '⬆️'
      };
    } else if (i === waypoints.length - 2) {
      // Last segment - arrive at destination
      instruction = {
        type: 'arrive_destination',
        instruction: 'Arrive at destination',
        distance: Math.round(distance),
        icon: '🏁'
      };
    } else {
      // Middle segments - check for turns
      const prevPoint = waypoints[i - 1];
      const currentBearing = calculateBearing(prevPoint, currentPoint);
      const nextBearing = calculateBearing(currentPoint, nextPoint);
      const turnDirection = getTurnDirection(currentBearing, nextBearing);

      if (turnDirection === 'straight') {
        instruction = {
          type: 'continue_straight',
          instruction: 'Continue straight',
          distance: Math.round(distance),
          icon: '⬆️'
        };
      } else if (turnDirection === 'left') {
        instruction = {
          type: 'turn_left',
          instruction: 'Turn left',
          distance: Math.round(distance),
          icon: '↰'
        };
      } else {
        instruction = {
          type: 'turn_right',
          instruction: 'Turn right',
          distance: Math.round(distance),
          icon: '↱'
        };
      }
    }

    instructions.push(instruction);
  }

  return instructions;
}

// Get direction from bearing
function getDirectionFromBearing(bearing: number): string {
  const directions = [
    'North', 'Northeast', 'East', 'Southeast',
    'South', 'Southwest', 'West', 'Northwest'
  ];
  
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

// Get current instruction based on ambulance position
export function getCurrentInstruction(
  instructions: NavigationInstruction[],
  ambulanceLocation: [number, number],
  route: RouteOptimization
): NavigationInstruction | null {
  if (!route?.route || route.route.length < 2) {
    return instructions[0] || null;
  }

  // Find the closest waypoint to current location
  let closestWaypointIndex = 0;
  let minDistance = Infinity;

  route.route.forEach((waypoint, index) => {
    const distance = calculateDistanceMeters(ambulanceLocation, waypoint);
    if (distance < minDistance) {
      minDistance = distance;
      closestWaypointIndex = index;
    }
  });

  // Return the instruction for the next waypoint
  const instructionIndex = Math.min(closestWaypointIndex + 1, instructions.length - 1);
  return instructions[instructionIndex] || instructions[instructions.length - 1];
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}

// Get next turn instruction with distance
export function getNextTurnInstruction(
  instructions: NavigationInstruction[],
  ambulanceLocation: [number, number],
  route: RouteOptimization
): string {
  const currentInstruction = getCurrentInstruction(instructions, ambulanceLocation, route);
  
  if (!currentInstruction) {
    return 'Continue straight';
  }

  const distance = formatDistance(currentInstruction.distance);
  
  switch (currentInstruction.type) {
    case 'turn_left':
      return `Turn left in ${distance}`;
    case 'turn_right':
      return `Turn right in ${distance}`;
    case 'continue_straight':
      return `Continue straight for ${distance}`;
    case 'arrive_destination':
      return `Arrive at destination in ${distance}`;
    case 'start_route':
      return 'Start your route';
    default:
      return 'Continue straight';
  }
}
