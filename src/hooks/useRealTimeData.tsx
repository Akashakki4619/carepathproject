import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealTimeAmbulance {
  id: string;
  vehicle_number: string;
  driver_name: string;
  status: 'available' | 'en_route' | 'at_scene' | 'transporting' | 'at_hospital';
  location: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  patient_id?: string;
  hospital_id?: string;
  last_updated: Date;
}

export interface RealTimeHospital {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  capacity: number;
  current_load: number;
  availability: number;
  incoming_ambulances: number;
  last_updated: Date;
}

export interface TrafficUpdate {
  id: string;
  road_segment: string;
  location: { lat: number; lng: number };
  traffic_level: 'low' | 'moderate' | 'high' | 'severe';
  delay_minutes: number;
  last_updated: Date;
}

export const useRealTimeAmbulances = () => {
  const [ambulances, setAmbulances] = useState<RealTimeAmbulance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate real-time ambulance data
    const mockAmbulances: RealTimeAmbulance[] = [
      {
        id: 'amb_001',
        vehicle_number: 'AMB-101',
        driver_name: 'John Smith',
        status: 'en_route',
        location: { lat: 40.7128, lng: -74.0060 },
        destination: { lat: 40.7589, lng: -73.9851 },
        patient_id: 'patient_001',
        hospital_id: 'hosp_001',
        last_updated: new Date(),
      },
      {
        id: 'amb_002',
        vehicle_number: 'AMB-102',
        driver_name: 'Sarah Johnson',
        status: 'transporting',
        location: { lat: 40.7282, lng: -74.0776 },
        destination: { lat: 40.7831, lng: -73.9712 },
        patient_id: 'patient_002',
        hospital_id: 'hosp_002',
        last_updated: new Date(),
      },
      {
        id: 'amb_003',
        vehicle_number: 'AMB-103',
        driver_name: 'Mike Davis',
        status: 'available',
        location: { lat: 40.6892, lng: -74.0445 },
        last_updated: new Date(),
      },
    ];

    setAmbulances(mockAmbulances);
    setLoading(false);

    // Simulate real-time updates with slower intervals to prevent map refreshing
    const interval = setInterval(() => {
      setAmbulances(prev => prev.map(ambulance => ({
        ...ambulance,
        location: {
          lat: ambulance.location.lat + (Math.random() - 0.5) * 0.0005, // Smaller movements
          lng: ambulance.location.lng + (Math.random() - 0.5) * 0.0005,
        },
        last_updated: new Date(),
      })));
    }, 15000); // Update every 15 seconds instead of 3

    return () => clearInterval(interval);
  }, []);

  return { ambulances, loading };
};

export const useRealTimeHospitals = () => {
  const [hospitals, setHospitals] = useState<RealTimeHospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockHospitals: RealTimeHospital[] = [
      {
        id: 'hosp_001',
        name: 'General Hospital',
        location: { lat: 40.7589, lng: -73.9851 },
        capacity: 500,
        current_load: 420,
        availability: 16,
        incoming_ambulances: 2,
        last_updated: new Date(),
      },
      {
        id: 'hosp_002',
        name: 'Memorial Medical Center',
        location: { lat: 40.7831, lng: -73.9712 },
        capacity: 300,
        current_load: 245,
        availability: 18.3,
        incoming_ambulances: 1,
        last_updated: new Date(),
      },
    ];

    setHospitals(mockHospitals);
    setLoading(false);

    // Simulate capacity changes
    const interval = setInterval(() => {
      setHospitals(prev => prev.map(hospital => ({
        ...hospital,
        current_load: Math.max(0, hospital.current_load + Math.floor(Math.random() * 6) - 3),
        availability: hospital.capacity > 0 ? 
          ((hospital.capacity - hospital.current_load) / hospital.capacity) * 100 : 0,
        last_updated: new Date(),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { hospitals, loading };
};

export const useRealTimeTraffic = () => {
  const [trafficUpdates, setTrafficUpdates] = useState<TrafficUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockTraffic: TrafficUpdate[] = [
      {
        id: 'traffic_001',
        road_segment: 'Broadway & 42nd St',
        location: { lat: 40.7589, lng: -73.9851 },
        traffic_level: 'high',
        delay_minutes: 12,
        last_updated: new Date(),
      },
      {
        id: 'traffic_002',
        road_segment: 'FDR Drive',
        location: { lat: 40.7282, lng: -73.9942 },
        traffic_level: 'moderate',
        delay_minutes: 5,
        last_updated: new Date(),
      },
    ];

    setTrafficUpdates(mockTraffic);
    setLoading(false);

    // Simulate traffic changes
    const interval = setInterval(() => {
      setTrafficUpdates(prev => prev.map(traffic => ({
        ...traffic,
        traffic_level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)] as any,
        delay_minutes: Math.max(0, traffic.delay_minutes + Math.floor(Math.random() * 6) - 3),
        last_updated: new Date(),
      })));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return { trafficUpdates, loading };
};