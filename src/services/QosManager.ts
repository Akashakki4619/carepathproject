import { supabase } from '@/integrations/supabase/client';

export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type PacketStatus = 'queued' | 'transmitting' | 'transmitted' | 'acknowledged' | 'failed' | 'dropped';

export interface QosPacket {
  id?: string;
  packet_id: string;
  sender_id: string;
  receiver_id?: string;
  packet_type: string;
  priority: Priority;
  payload: any;
  status: PacketStatus;
  queue_time: Date;
  transmission_start?: Date;
  transmission_end?: Date;
  ack_received?: Date;
  retry_count: number;
  max_retries: number;
  latency_ms?: number;
  size_bytes: number;
}

export interface LinkMetrics {
  link_id: string;
  sender_location: { lat: number; lng: number };
  receiver_location?: { lat: number; lng: number };
  capacity_kbps: number;
  current_utilization: number;
  packet_loss_rate: number;
  jitter_ms: number;
  is_active: boolean;
}

export interface QosAnalytics {
  priority_level: Priority;
  total_packets: number;
  successful_packets: number;
  dropped_packets: number;
  avg_latency_ms: number;
  avg_throughput_kbps: number;
  packet_loss_rate: number;
  created_at?: string;
  id?: string;
  timestamp?: string;
}

export class QosManager {
  private transmissionQueue: QosPacket[] = [];
  private isTransmitting = false;
  private linkMetrics: Map<string, LinkMetrics> = new Map();
  private currentTransmissions: Map<string, QosPacket> = new Map();
  private priorityWeights = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1
  };

  constructor() {
    this.initializeLinkMetrics();
    this.startTransmissionLoop();
    this.startMetricsCollection();
  }

  private async initializeLinkMetrics() {
    // Initialize default link metrics for simulation
    const defaultLink: LinkMetrics = {
      link_id: 'main_vanet_link',
      sender_location: { lat: 40.7128, lng: -74.0060 },
      capacity_kbps: 1000,
      current_utilization: 0,
      packet_loss_rate: 0.02,
      jitter_ms: 5,
      is_active: true
    };

    this.linkMetrics.set('main_vanet_link', defaultLink);
    await this.persistLinkMetrics(defaultLink);
  }

  private async persistLinkMetrics(metrics: LinkMetrics) {
    try {
      await supabase
        .from('qos_link_metrics')
        .upsert({
          link_id: metrics.link_id,
          sender_location: metrics.sender_location,
          receiver_location: metrics.receiver_location,
          capacity_kbps: metrics.capacity_kbps,
          current_utilization: metrics.current_utilization,
          packet_loss_rate: metrics.packet_loss_rate,
          jitter_ms: metrics.jitter_ms,
          is_active: metrics.is_active
        });
    } catch (error) {
      console.error('Failed to persist link metrics:', error);
    }
  }

  public async sendPacket(
    sender_id: string,
    packet_type: string,
    priority: Priority,
    payload: any,
    receiver_id?: string
  ): Promise<string> {
    const packet: QosPacket = {
      packet_id: crypto.randomUUID(),
      sender_id,
      receiver_id,
      packet_type,
      priority,
      payload,
      status: 'queued',
      queue_time: new Date(),
      retry_count: 0,
      max_retries: priority === 'CRITICAL' ? 5 : priority === 'HIGH' ? 3 : 1,
      size_bytes: JSON.stringify(payload).length
    };

    // Store in database
    try {
      const { data, error } = await supabase
        .from('qos_transmissions')
        .insert({
          packet_id: packet.packet_id,
          sender_id: packet.sender_id,
          receiver_id: packet.receiver_id,
          packet_type: packet.packet_type,
          priority: packet.priority,
          payload: packet.payload,
          status: packet.status,
          queue_time: packet.queue_time.toISOString(),
          retry_count: packet.retry_count,
          max_retries: packet.max_retries
        })
        .select()
        .single();

      if (error) throw error;
      packet.id = data.id;
    } catch (error) {
      console.error('Failed to persist packet:', error);
    }

    // Add to transmission queue with priority ordering
    this.insertPacketByPriority(packet);
    
    return packet.packet_id;
  }

  private insertPacketByPriority(packet: QosPacket) {
    const index = this.transmissionQueue.findIndex(p => 
      this.priorityWeights[packet.priority] > this.priorityWeights[p.priority] ||
      (this.priorityWeights[packet.priority] === this.priorityWeights[p.priority] && 
       packet.queue_time < p.queue_time)
    );
    
    if (index === -1) {
      this.transmissionQueue.push(packet);
    } else {
      this.transmissionQueue.splice(index, 0, packet);
    }
  }

  private startTransmissionLoop() {
    setInterval(async () => {
      if (this.isTransmitting || this.transmissionQueue.length === 0) return;

      const link = this.linkMetrics.get('main_vanet_link');
      if (!link || !link.is_active) return;

      // Weighted Fair Queuing - process packets based on priority
      const packet = this.getNextPacketWFQ();
      if (!packet) return;

      await this.transmitPacket(packet, link);
    }, 100); // Check every 100ms
  }

  private getNextPacketWFQ(): QosPacket | null {
    if (this.transmissionQueue.length === 0) return null;

    // Check for preemption - CRITICAL packets can preempt others
    const criticalPacket = this.transmissionQueue.find(p => p.priority === 'CRITICAL');
    if (criticalPacket && this.currentTransmissions.size > 0) {
      // Preempt lower priority transmissions
      for (const [id, transmission] of this.currentTransmissions) {
        if (transmission.priority !== 'CRITICAL') {
          this.preemptTransmission(transmission);
        }
      }
    }

    // Return highest priority packet
    return this.transmissionQueue.shift() || null;
  }

  private async preemptTransmission(packet: QosPacket) {
    packet.status = 'queued';
    packet.retry_count++;
    this.insertPacketByPriority(packet);
    this.currentTransmissions.delete(packet.packet_id);
    
    await this.updatePacketStatus(packet);
  }

  private async transmitPacket(packet: QosPacket, link: LinkMetrics) {
    this.isTransmitting = true;
    this.currentTransmissions.set(packet.packet_id, packet);

    // Update status to transmitting
    packet.status = 'transmitting';
    packet.transmission_start = new Date();
    await this.updatePacketStatus(packet);

    // Simulate transmission time based on packet size and link capacity
    const transmissionTimeMs = this.calculateTransmissionTime(packet, link);
    
    // Simulate packet loss
    const isLost = Math.random() < link.packet_loss_rate;
    
    setTimeout(async () => {
      if (isLost && packet.retry_count < packet.max_retries) {
        // Packet lost, retry
        packet.status = 'failed';
        packet.retry_count++;
        packet.transmission_end = new Date();
        await this.updatePacketStatus(packet);
        
        // Re-queue for retry
        this.insertPacketByPriority(packet);
      } else if (isLost) {
        // Max retries exceeded, drop packet
        packet.status = 'dropped';
        packet.transmission_end = new Date();
        await this.updatePacketStatus(packet);
      } else {
        // Transmission successful
        packet.status = 'transmitted';
        packet.transmission_end = new Date();
        packet.latency_ms = transmissionTimeMs + link.jitter_ms;
        await this.updatePacketStatus(packet);

        // Simulate ACK
        setTimeout(async () => {
          packet.status = 'acknowledged';
          packet.ack_received = new Date();
          await this.updatePacketStatus(packet);
        }, 50 + Math.random() * 100);
      }

      this.currentTransmissions.delete(packet.packet_id);
      this.isTransmitting = false;
      
      // Update link utilization
      this.updateLinkUtilization(link);
    }, transmissionTimeMs);
  }

  private calculateTransmissionTime(packet: QosPacket, link: LinkMetrics): number {
    // Basic transmission time calculation
    const bitsToTransmit = packet.size_bytes * 8;
    const availableBandwidth = link.capacity_kbps * (1 - link.current_utilization / 100) * 1000;
    return Math.max(10, (bitsToTransmit / availableBandwidth) * 1000); // ms
  }

  private updateLinkUtilization(link: LinkMetrics) {
    // Simulate dynamic utilization
    const baseUtilization = this.currentTransmissions.size * 20;
    const randomVariation = (Math.random() - 0.5) * 10;
    link.current_utilization = Math.max(0, Math.min(100, baseUtilization + randomVariation));
    
    // Update packet loss based on utilization
    link.packet_loss_rate = Math.min(0.1, link.current_utilization / 1000);
    
    this.persistLinkMetrics(link);
  }

  private async updatePacketStatus(packet: QosPacket) {
    if (!packet.id) return;

    try {
      await supabase
        .from('qos_transmissions')
        .update({
          status: packet.status,
          transmission_start: packet.transmission_start?.toISOString(),
          transmission_end: packet.transmission_end?.toISOString(),
          ack_received: packet.ack_received?.toISOString(),
          retry_count: packet.retry_count,
          latency_ms: packet.latency_ms
        })
        .eq('id', packet.id);
    } catch (error) {
      console.error('Failed to update packet status:', error);
    }
  }

  private startMetricsCollection() {
    setInterval(async () => {
      await this.collectAndPersistAnalytics();
    }, 10000); // Collect metrics every 10 seconds
  }

  private async collectAndPersistAnalytics() {
    const priorities: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    
    for (const priority of priorities) {
      try {
        const { data: transmissions } = await supabase
          .from('qos_transmissions')
          .select('*')
          .eq('priority', priority)
          .gte('created_at', new Date(Date.now() - 60000).toISOString()); // Last minute

        if (!transmissions) continue;

        const total = transmissions.length;
        const successful = transmissions.filter(t => t.status === 'acknowledged').length;
        const dropped = transmissions.filter(t => t.status === 'dropped').length;
        const avgLatency = transmissions
          .filter(t => t.latency_ms)
          .reduce((sum, t) => sum + (t.latency_ms || 0), 0) / 
          Math.max(1, transmissions.filter(t => t.latency_ms).length);

        const analytics = {
          priority_level: priority,
          total_packets: total,
          successful_packets: successful,
          dropped_packets: dropped,
          avg_latency_ms: avgLatency || 0,
          avg_throughput_kbps: this.calculateThroughput(transmissions),
          packet_loss_rate: total > 0 ? dropped / total : 0
        };

        await supabase.from('qos_analytics').insert(analytics);
      } catch (error) {
        console.error('Failed to collect analytics for priority', priority, error);
      }
    }
  }

  private calculateThroughput(transmissions: any[]): number {
    const successfulTransmissions = transmissions.filter(t => t.status === 'acknowledged');
    if (successfulTransmissions.length === 0) return 0;

    const totalBytes = successfulTransmissions.reduce((sum, t) => {
      return sum + JSON.stringify(t.payload).length;
    }, 0);

    return (totalBytes * 8) / 1000; // kbps
  }

  // Public methods for getting metrics
  public async getQueueStatus(): Promise<{ [key in Priority]: number }> {
    const status = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    this.transmissionQueue.forEach(packet => {
      status[packet.priority]++;
    });
    return status;
  }

  public async getLinkMetrics(): Promise<LinkMetrics[]> {
    return Array.from(this.linkMetrics.values());
  }

  public async getAnalytics(timeRange: string = '1h'): Promise<QosAnalytics[]> {
    const hoursBack = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24;
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    try {
      const { data, error } = await supabase
        .from('qos_analytics')
        .select('*')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        priority_level: item.priority_level as Priority
      }));
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return [];
    }
  }
}

// Singleton instance
export const qosManager = new QosManager();