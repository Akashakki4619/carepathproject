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
  
  // NYC Bridge coordinates for proper water crossing
  const nycBridges = [
    { name: 'Brooklyn Bridge', lat: 40.7061, lng: -74.0036, approaches: [[40.7077, -74.0036], [40.7045, -74.0036]] },
    { name: 'Manhattan Bridge', lat: 40.7071, lng: -74.0024, approaches: [[40.7088, -74.0024], [40.7054, -74.0024]] },
    { name: 'Williamsburg Bridge', lat: 40.7130, lng: -74.0029, approaches: [[40.7147, -74.0029], [40.7113, -74.0029]] },
    { name: 'Queensboro Bridge', lat: 40.7561, lng: -73.9668, approaches: [[40.7578, -73.9668], [40.7544, -73.9668]] },
  ];
  
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  // Check if we need to cross water (significant longitude difference in NYC area)
  const needsWaterCrossing = Math.abs(startLon - endLon) > 0.015;
  
  if (needsWaterCrossing) {
    // Find the best bridge based on route efficiency
    let bestBridge = nycBridges[0];
    let minTotalDistance = Infinity;
    
    for (const bridge of nycBridges) {
      const distToStart = calculateDistance(start, [bridge.lng, bridge.lat]);
      const distFromBridge = calculateDistance([bridge.lng, bridge.lat], end);
      const totalDist = distToStart + distFromBridge;
      
      if (totalDist < minTotalDistance) {
        minTotalDistance = totalDist;
        bestBridge = bridge;
      }
    }
    
    // Create route: Start -> Bridge Approach -> Bridge -> Bridge Exit -> End
    const bridgeApproach = startLat > bestBridge.lat ? bestBridge.approaches[0] : bestBridge.approaches[1];
    const bridgeExit = endLat > bestBridge.lat ? bestBridge.approaches[0] : bestBridge.approaches[1];
    
    // Route to bridge approach (follow streets)
    const stepsTobridge = 4;
    for (let i = 1; i <= stepsTobridge; i++) {
      const progress = i / stepsTobridge;
      let lat = startLat + (bridgeApproach[0] - startLat) * progress;
      let lon = startLon + (bridgeApproach[1] - startLon) * progress;
      
      // Manhattan street grid routing
      if (i < stepsTobridge) {
        if (progress < 0.6) {
          // Move primarily east/west first
          lat = startLat + (bridgeApproach[0] - startLat) * (progress * 0.3);
          lon = startLon + (bridgeApproach[1] - startLon) * (progress / 0.6);
        } else {
          // Then move north/south
          lat = startLat + (bridgeApproach[0] - startLat) * (0.18 + (progress - 0.6) / 0.4 * 0.82);
          lon = startLon + (bridgeApproach[1] - startLon);
        }
      }
      
      waypoints.push([lon, lat]);
    }
    
    // Bridge crossing
    waypoints.push([bestBridge.lng, bestBridge.lat]);
    waypoints.push([bridgeExit[1], bridgeExit[0]]);
    
    // Route from bridge to destination
    const stepsFromBridge = 4;
    for (let i = 1; i < stepsFromBridge; i++) {
      const progress = i / stepsFromBridge;
      let lat = bridgeExit[0] + (endLat - bridgeExit[0]) * progress;
      let lon = bridgeExit[1] + (endLon - bridgeExit[1]) * progress;
      
      // Street grid routing
      if (progress < 0.6) {
        lat = bridgeExit[0] + (endLat - bridgeExit[0]) * (progress * 0.3);
        lon = bridgeExit[1] + (endLon - bridgeExit[1]) * (progress / 0.6);
      } else {
        lat = bridgeExit[0] + (endLat - bridgeExit[0]) * (0.18 + (progress - 0.6) / 0.4 * 0.82);
        lon = bridgeExit[1] + (endLon - bridgeExit[1]);
      }
      
      waypoints.push([lon, lat]);
    }
  } else {
    // Local routing without water crossing
    const steps = 6;
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      
      // L-shaped Manhattan routing
      let lat: number, lon: number;
      if (progress < 0.7) {
        lat = startLat + (endLat - startLat) * (progress * 0.2);
        lon = startLon + (endLon - startLon) * (progress / 0.7);
      } else {
        lat = startLat + (endLat - startLat) * (0.14 + (progress - 0.7) / 0.3 * 0.86);
        lon = startLon + (endLon - startLon);
      }
      
      waypoints.push([lon, lat]);
    }
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