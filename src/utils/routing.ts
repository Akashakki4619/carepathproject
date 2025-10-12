import { RouteOptimization, TrafficCondition } from '@/types';

// Graph representation for routing
interface GraphNode {
  id: string;
  coordinates: [number, number];
  neighbors: { nodeId: string; weight: number; distance: number }[];
}

interface RouteGraph {
  nodes: Map<string, GraphNode>;
  traffic: Map<string, number>; // edge -> traffic multiplier
}

// Simple distance calculation using Haversine formula
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
  const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Enhanced Dijkstra's algorithm with traffic weights
export function findOptimalRoute(
  start: [number, number],
  end: [number, number],
  trafficConditions: TrafficCondition[]
): RouteOptimization {
  // Create a simplified graph for demonstration
  // In real implementation, this would use actual road network data
  const waypoints = generateWaypoints(start, end);
  const graph = buildGraph(waypoints, trafficConditions);
  
  const route = dijkstraWithTraffic(graph, start, end);
  const distance = calculateRouteDistance(route);
  const baseTime = distance * 2; // Assume 30 km/h average speed
  const trafficScore = calculateTrafficScore(route, trafficConditions);
  const estimatedTime = baseTime * trafficScore;

  return {
    route,
    distance,
    estimated_time: estimatedTime,
    traffic_score: trafficScore,
    alternative_routes: generateAlternativeRoutes(start, end, trafficConditions)
  };
}

function generateWaypoints(start: [number, number], end: [number, number]): [number, number][] {
  const waypoints: [number, number][] = [start];
  
  // Check if both points are in Hyderabad region
  const isHyderabad = (coord: [number, number]) => {
    const [lon, lat] = coord;
    return lon >= 78.2 && lon <= 78.7 && lat >= 17.2 && lat <= 17.6;
  };

  const startInHyderabad = isHyderabad(start);
  const endInHyderabad = isHyderabad(end);

  // If both are in Hyderabad, create a simple direct route
  if (startInHyderabad && endInHyderabad) {
    const [startLon, startLat] = start;
    const [endLon, endLat] = end;
    
    // Create intermediate points for a smooth route
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      
      // Simple linear interpolation for direct route
      const lat = startLat + (endLat - startLat) * progress;
      const lon = startLon + (endLon - startLon) * progress;
      
      waypoints.push([lon, lat]);
    }
    
    waypoints.push(end);
    return waypoints;
  }

  // For routes outside Hyderabad, use simple direct routing
  const steps = 5;
  for (let i = 1; i < steps; i++) {
    const progress = i / steps;
    const lat = start[1] + (end[1] - start[1]) * progress;
    const lon = start[0] + (end[0] - start[0]) * progress;
    waypoints.push([lon, lat]);
  }
  
  waypoints.push(end);
  return waypoints;
}

function buildGraph(waypoints: [number, number][], trafficConditions: TrafficCondition[]): RouteGraph {
  const nodes = new Map<string, GraphNode>();
  const traffic = new Map<string, number>();

  // Create nodes
  waypoints.forEach((coord, index) => {
    const nodeId = `node_${index}`;
    nodes.set(nodeId, {
      id: nodeId,
      coordinates: coord,
      neighbors: []
    });
  });

  // Connect adjacent nodes
  waypoints.forEach((coord, index) => {
    const currentNodeId = `node_${index}`;
    const currentNode = nodes.get(currentNodeId)!;

    // Connect to next waypoint
    if (index < waypoints.length - 1) {
      const nextNodeId = `node_${index + 1}`;
      const distance = calculateDistance(coord, waypoints[index + 1]);
      const trafficMultiplier = getTrafficMultiplier(coord, waypoints[index + 1], trafficConditions);
      
      currentNode.neighbors.push({
        nodeId: nextNodeId,
        weight: distance * trafficMultiplier,
        distance
      });

      traffic.set(`${currentNodeId}_${nextNodeId}`, trafficMultiplier);
    }

    // Also connect to other nearby nodes for alternative paths
    waypoints.forEach((otherCoord, otherIndex) => {
      if (otherIndex !== index && Math.abs(otherIndex - index) > 1) {
        const otherNodeId = `node_${otherIndex}`;
        const distance = calculateDistance(coord, otherCoord);
        
        if (distance < 5) { // Only connect nearby nodes
          const trafficMultiplier = getTrafficMultiplier(coord, otherCoord, trafficConditions);
          currentNode.neighbors.push({
            nodeId: otherNodeId,
            weight: distance * trafficMultiplier,
            distance
          });
        }
      }
    });
  });

  return { nodes, traffic };
}

function getTrafficMultiplier(
  start: [number, number], 
  end: [number, number], 
  trafficConditions: TrafficCondition[]
): number {
  // Check if this road segment has traffic data
  for (const condition of trafficConditions) {
    const segmentDistance = calculateDistance(start, condition.coordinates[0]);
    if (segmentDistance < 1) { // Within 1km of traffic condition
      switch (condition.traffic_level) {
        case 'heavy': return 2.5;
        case 'moderate': return 1.5;
        case 'light': return 1.0;
      }
    }
  }
  return 1.2; // Default moderate traffic
}

function dijkstraWithTraffic(
  graph: RouteGraph,
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const startNodeId = 'node_0';
  const endNodeId = `node_${graph.nodes.size - 1}`;
  
  const distances = new Map<string, number>();
  const previous = new Map<string, string>();
  const visited = new Set<string>();
  const queue: string[] = [];

  // Initialize distances
  graph.nodes.forEach((_, nodeId) => {
    distances.set(nodeId, nodeId === startNodeId ? 0 : Infinity);
    queue.push(nodeId);
  });

  while (queue.length > 0) {
    // Find node with minimum distance
    const currentNodeId = queue.reduce((min, nodeId) => 
      distances.get(nodeId)! < distances.get(min)! ? nodeId : min
    );

    queue.splice(queue.indexOf(currentNodeId), 1);
    visited.add(currentNodeId);

    if (currentNodeId === endNodeId) break;

    const currentNode = graph.nodes.get(currentNodeId)!;
    currentNode.neighbors.forEach(neighbor => {
      if (!visited.has(neighbor.nodeId)) {
        const newDistance = distances.get(currentNodeId)! + neighbor.weight;
        if (newDistance < distances.get(neighbor.nodeId)!) {
          distances.set(neighbor.nodeId, newDistance);
          previous.set(neighbor.nodeId, currentNodeId);
        }
      }
    });
  }

  // Reconstruct path
  const path: string[] = [];
  let currentNodeId = endNodeId;
  while (currentNodeId) {
    path.unshift(currentNodeId);
    currentNodeId = previous.get(currentNodeId)!;
  }

  // Convert to coordinates
  return path.map(nodeId => graph.nodes.get(nodeId)!.coordinates);
}

function calculateRouteDistance(route: [number, number][]): number {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += calculateDistance(route[i], route[i + 1]);
  }
  return totalDistance;
}

function calculateTrafficScore(route: [number, number][], trafficConditions: TrafficCondition[]): number {
  let totalScore = 0;
  let segments = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const multiplier = getTrafficMultiplier(route[i], route[i + 1], trafficConditions);
    totalScore += multiplier;
    segments++;
  }

  return segments > 0 ? totalScore / segments : 1.2;
}

function generateAlternativeRoutes(
  start: [number, number],
  end: [number, number],
  trafficConditions: TrafficCondition[]
): RouteOptimization[] {
  // Generate 2-3 alternative routes with different waypoints
  const alternatives: RouteOptimization[] = [];
  
  for (let i = 0; i < 2; i++) {
    const alternativeWaypoints = generateWaypoints(start, end);
    // Modify waypoints slightly for different routes
    const modifiedWaypoints = alternativeWaypoints.map(coord => [
      coord[0] + (Math.random() - 0.5) * 0.005,
      coord[1] + (Math.random() - 0.5) * 0.005
    ] as [number, number]);

    const altGraph = buildGraph(modifiedWaypoints, trafficConditions);
    const altRoute = dijkstraWithTraffic(altGraph, start, end);
    const altDistance = calculateRouteDistance(altRoute);
    const altTrafficScore = calculateTrafficScore(altRoute, trafficConditions);
    const altTime = altDistance * 2 * altTrafficScore;

    alternatives.push({
      route: altRoute,
      distance: altDistance,
      estimated_time: altTime,
      traffic_score: altTrafficScore
    });
  }

  return alternatives;
}

// VANET simulation - simulate vehicle-to-vehicle communication
export function simulateVANETCommunication(ambulanceLocation: [number, number]) {
  const nearbyVehicles = [
    { id: 'v1', location: [ambulanceLocation[0] + 0.001, ambulanceLocation[1] + 0.001] },
    { id: 'v2', location: [ambulanceLocation[0] - 0.001, ambulanceLocation[1] + 0.002] },
    { id: 'v3', location: [ambulanceLocation[0] + 0.002, ambulanceLocation[1] - 0.001] }
  ];

  return nearbyVehicles.map(vehicle => ({
    vehicleId: vehicle.id,
    trafficInfo: {
      traffic_level: ['light', 'moderate', 'heavy'][Math.floor(Math.random() * 3)] as 'light' | 'moderate' | 'heavy',
      road_conditions: 'normal',
      estimated_delay: Math.floor(Math.random() * 10)
    },
    location: vehicle.location as [number, number],
    timestamp: new Date()
  }));
}