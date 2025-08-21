export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ambulance_driver' | 'hospital_staff' | 'dispatcher' | 'admin';
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
  patient_id?: string;
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

// Patient Management Types
export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_type?: string;
  phone_number?: string;
  address?: string;
  insurance_number?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  patient_id: string;
  name: string;
  relationship: string;
  phone_number: string;
  email?: string;
  is_primary: boolean;
  created_at: string;
}

export interface MedicalHistory {
  id: string;
  patient_id: string;
  condition_name: string;
  diagnosed_date?: string;
  medications: string[];
  allergies: string[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalAlert {
  id: string;
  patient_id: string;
  alert_type: 'allergy' | 'medication' | 'condition' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  is_active: boolean;
  created_at: string;
}

// Communication Types
export interface Notification {
  id: string;
  recipient_id: string;
  recipient_type: 'driver' | 'hospital_staff' | 'all';
  title: string;
  message: string;
  notification_type: 'info' | 'warning' | 'emergency' | 'success';
  is_read: boolean;
  trip_id?: string;
  hospital_id?: string;
  ambulance_id?: string;
  created_at: string;
}

export interface Broadcast {
  id: string;
  sender_id: string;
  title: string;
  message: string;
  broadcast_type: 'emergency' | 'maintenance' | 'general' | 'alert';
  target_audience: string[];
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface StatusMessage {
  id: string;
  sender_id: string;
  message: string;
  status_type: 'available' | 'busy' | 'emergency' | 'maintenance' | 'offline';
  location?: any;
  trip_id?: string;
  created_at: string;
}

// Analytics Types
export interface ResponseAnalytics {
  id: string;
  trip_id: string;
  ambulance_id: string;
  hospital_id: string;
  dispatch_time: string;
  arrival_time?: string;
  completion_time?: string;
  response_time_minutes?: number;
  distance_km?: number;
  patient_outcome?: string;
  efficiency_score?: number;
  created_at: string;
}

export interface CapacityTrend {
  id: string;
  hospital_id: string;
  date: string;
  hour_of_day: number;
  total_capacity: number;
  occupied_beds: number;
  incoming_ambulances: number;
  avg_wait_time_minutes?: number;
  created_at: string;
}

export interface RouteEfficiency {
  id: string;
  route_id: string;
  start_location: any;
  end_location: any;
  distance_km: number;
  estimated_time_minutes: number;
  actual_time_minutes?: number;
  traffic_conditions: string[];
  efficiency_rating?: number;
  date_recorded: string;
  created_at: string;
}

// Enhanced Tracking Types
export interface TrafficData {
  id: string;
  road_segment_id: string;
  coordinates: any;
  traffic_level: 'light' | 'moderate' | 'heavy' | 'blocked';
  average_speed_kmh?: number;
  delay_minutes: number;
  incident_type?: string;
  last_updated: string;
  is_active: boolean;
}

export interface AmbulanceCoordination {
  id: string;
  primary_ambulance_id: string;
  supporting_ambulance_ids: string[];
  coordination_type: 'backup' | 'relay' | 'multiple_patient' | 'emergency_support';
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ArrivalNotification {
  id: string;
  trip_id: string;
  hospital_id: string;
  ambulance_id: string;
  estimated_arrival: string;
  notification_sent_at?: string;
  actual_arrival?: string;
  notification_status: 'pending' | 'sent' | 'acknowledged' | 'updated';
  created_at: string;
}

// User Management Types
export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  role: 'ambulance_driver' | 'hospital_staff' | 'dispatcher' | 'admin';
  department?: string;
  license_number?: string;
  emergency_contact?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  role: string;
  resource: string;
  actions: string[];
  created_at: string;
}

export interface DriverShift {
  id: string;
  driver_id: string;
  ambulance_id?: string;
  shift_start: string;
  shift_end: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  break_times?: any;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HospitalStaffManagement {
  id: string;
  staff_id: string;
  hospital_id: string;
  position: string;
  department: string;
  shift_pattern?: string;
  certifications: string[];
  availability_status: 'available' | 'busy' | 'break' | 'off_duty';
  last_activity: string;
  created_at: string;
  updated_at: string;
}