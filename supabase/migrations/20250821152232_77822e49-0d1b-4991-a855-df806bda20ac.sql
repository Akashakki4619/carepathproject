-- Patient Management Tables
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_type TEXT,
  phone_number TEXT,
  address TEXT,
  insurance_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  diagnosed_date DATE,
  medications TEXT[],
  allergies TEXT[],
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.medical_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('allergy', 'medication', 'condition', 'emergency')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Communication & Alerts Tables
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id TEXT NOT NULL, -- Will be user_id later
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('driver', 'hospital_staff', 'all')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('info', 'warning', 'emergency', 'success')),
  is_read BOOLEAN DEFAULT false,
  trip_id UUID,
  hospital_id TEXT,
  ambulance_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  broadcast_type TEXT NOT NULL CHECK (broadcast_type IN ('emergency', 'maintenance', 'general', 'alert')),
  target_audience TEXT[] DEFAULT ARRAY['all'],
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.status_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  message TEXT NOT NULL,
  status_type TEXT NOT NULL CHECK (status_type IN ('available', 'busy', 'emergency', 'maintenance', 'offline')),
  location JSONB,
  trip_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Analytics & Reporting Tables
CREATE TABLE public.response_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL,
  ambulance_id TEXT NOT NULL,
  hospital_id TEXT NOT NULL,
  dispatch_time TIMESTAMP WITH TIME ZONE NOT NULL,
  arrival_time TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  response_time_minutes INTEGER,
  distance_km DECIMAL(10,2),
  patient_outcome TEXT,
  efficiency_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.capacity_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id TEXT NOT NULL,
  date DATE NOT NULL,
  hour_of_day INTEGER CHECK (hour_of_day BETWEEN 0 AND 23),
  total_capacity INTEGER NOT NULL,
  occupied_beds INTEGER NOT NULL,
  incoming_ambulances INTEGER DEFAULT 0,
  avg_wait_time_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(hospital_id, date, hour_of_day)
);

CREATE TABLE public.route_efficiency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id TEXT NOT NULL,
  start_location JSONB NOT NULL,
  end_location JSONB NOT NULL,
  distance_km DECIMAL(10,2) NOT NULL,
  estimated_time_minutes INTEGER NOT NULL,
  actual_time_minutes INTEGER,
  traffic_conditions TEXT[],
  efficiency_rating DECIMAL(3,2),
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced Tracking Tables
CREATE TABLE public.traffic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_segment_id TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  traffic_level TEXT NOT NULL CHECK (traffic_level IN ('light', 'moderate', 'heavy', 'blocked')),
  average_speed_kmh DECIMAL(5,2),
  delay_minutes INTEGER DEFAULT 0,
  incident_type TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE public.ambulance_coordination (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_ambulance_id TEXT NOT NULL,
  supporting_ambulance_ids TEXT[],
  coordination_type TEXT NOT NULL CHECK (coordination_type IN ('backup', 'relay', 'multiple_patient', 'emergency_support')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.arrival_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL,
  hospital_id TEXT NOT NULL,
  ambulance_id TEXT NOT NULL,
  estimated_arrival TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  notification_status TEXT DEFAULT 'pending' CHECK (notification_status IN ('pending', 'sent', 'acknowledged', 'updated')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Management Tables
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- Will reference auth.users later
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  role TEXT NOT NULL CHECK (role IN ('ambulance_driver', 'hospital_staff', 'dispatcher', 'admin')),
  department TEXT,
  license_number TEXT,
  emergency_contact TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  resource TEXT NOT NULL,
  actions TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role, resource)
);

CREATE TABLE public.driver_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id TEXT NOT NULL,
  ambulance_id TEXT,
  shift_start TIMESTAMP WITH TIME ZONE NOT NULL,
  shift_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  break_times JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.hospital_staff_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id TEXT NOT NULL,
  hospital_id TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT NOT NULL,
  shift_pattern TEXT,
  certifications TEXT[],
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'break', 'off_duty')),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_patients_name ON public.patients(first_name, last_name);
CREATE INDEX idx_medical_alerts_patient_severity ON public.medical_alerts(patient_id, severity) WHERE is_active = true;
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX idx_response_analytics_date ON public.response_analytics(dispatch_time);
CREATE INDEX idx_capacity_trends_date ON public.capacity_trends(hospital_id, date, hour_of_day);
CREATE INDEX idx_traffic_data_active ON public.traffic_data(road_segment_id) WHERE is_active = true;
CREATE INDEX idx_driver_shifts_active ON public.driver_shifts(driver_id, shift_start, shift_end) WHERE status IN ('scheduled', 'active');

-- Insert sample permissions
INSERT INTO public.permissions (role, resource, actions) VALUES
('admin', 'all', ARRAY['create', 'read', 'update', 'delete']),
('dispatcher', 'ambulances', ARRAY['read', 'update']),
('dispatcher', 'trips', ARRAY['create', 'read', 'update']),
('dispatcher', 'hospitals', ARRAY['read']),
('ambulance_driver', 'trips', ARRAY['read', 'update']),
('ambulance_driver', 'patients', ARRAY['read']),
('hospital_staff', 'patients', ARRAY['create', 'read', 'update']),
('hospital_staff', 'trips', ARRAY['read', 'update']),
('hospital_staff', 'capacity', ARRAY['read', 'update']);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_medical_history_updated_at BEFORE UPDATE ON public.medical_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ambulance_coordination_updated_at BEFORE UPDATE ON public.ambulance_coordination FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_driver_shifts_updated_at BEFORE UPDATE ON public.driver_shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hospital_staff_management_updated_at BEFORE UPDATE ON public.hospital_staff_management FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();