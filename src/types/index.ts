export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ambulance_driver' | 'hospital_staff';
  hospital_id?: string;
  ambulance_id?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  contact_number: string;
  capacity: number;
  current_load: number;
}

export interface Ambulance {
  id: string;
  vehicle_number: string;
  driver_id: string;
  current_location: [number, number];
  status: 'available' | 'en_route' | 'at_hospital' | 'maintenance';
  hospital_id?: string;
}

export interface Trip {
  id: string;
  ambulance_id: string;
  hospital_id: string;
  start_location: [number, number];
  destination_location: [number, number];
  route: [number, number][];
  status: 'started' | 'en_route' | 'arrived' | 'completed';
  start_time: Date;
  estimated_arrival: Date;
  actual_arrival?: Date;
  traffic_conditions: TrafficCondition[];
  patient_details?: string;
}

export interface TrafficCondition {
  road_segment: string;
  coordinates: [number, number][];
  traffic_level: 'light' | 'moderate' | 'heavy';
  estimated_delay: number; // in minutes
  last_updated: Date;
}

export interface VANETMessage {
  id: string;
  sender_id: string;
  message_type: 'traffic_update' | 'route_request' | 'emergency_alert';
  content: any;
  timestamp: Date;
  location: [number, number];
}

export interface RouteOptimization {
  route: [number, number][];
  distance: number;
  estimated_time: number;
  traffic_score: number;
  alternative_routes?: RouteOptimization[];
}