-- Create QoS transmission tracking tables
CREATE TABLE public.qos_transmissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  packet_id UUID NOT NULL DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  receiver_id TEXT,
  packet_type TEXT NOT NULL, -- 'patient_vitals', 'emergency_alert', 'status_update', 'traffic_info'
  priority TEXT NOT NULL CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'transmitting', 'transmitted', 'acknowledged', 'failed', 'dropped')),
  queue_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transmission_start TIMESTAMP WITH TIME ZONE,
  transmission_end TIMESTAMP WITH TIME ZONE,
  ack_received TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  latency_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create QoS link simulation table
CREATE TABLE public.qos_link_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id TEXT NOT NULL,
  sender_location JSONB NOT NULL,
  receiver_location JSONB,
  capacity_kbps INTEGER NOT NULL DEFAULT 1000,
  current_utilization DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  packet_loss_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0,
  jitter_ms INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create QoS analytics table
CREATE TABLE public.qos_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  priority_level TEXT NOT NULL,
  total_packets INTEGER NOT NULL DEFAULT 0,
  successful_packets INTEGER NOT NULL DEFAULT 0,
  dropped_packets INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms DECIMAL(8,2),
  avg_throughput_kbps DECIMAL(10,2),
  packet_loss_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qos_transmissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qos_link_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qos_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing all for simulation purposes)
CREATE POLICY "Allow all operations on qos_transmissions" ON public.qos_transmissions FOR ALL USING (true);
CREATE POLICY "Allow all operations on qos_link_metrics" ON public.qos_link_metrics FOR ALL USING (true);
CREATE POLICY "Allow all operations on qos_analytics" ON public.qos_analytics FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_qos_transmissions_priority ON public.qos_transmissions(priority, queue_time);
CREATE INDEX idx_qos_transmissions_status ON public.qos_transmissions(status);
CREATE INDEX idx_qos_transmissions_sender ON public.qos_transmissions(sender_id);
CREATE INDEX idx_qos_analytics_timestamp ON public.qos_analytics(timestamp);

-- Add trigger for updated_at on link metrics
CREATE TRIGGER update_qos_link_metrics_updated_at
  BEFORE UPDATE ON public.qos_link_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();