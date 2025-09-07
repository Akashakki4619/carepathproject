import { useState, useEffect } from 'react';

export interface VanetMessage {
  id: string;
  vehicleId: string;
  messageType: 'emergency_alert' | 'traffic_update' | 'route_advisory' | 'safety_warning';
  content: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: { lat: number; lng: number };
  timestamp: Date;
  range: number; // in meters
}

export interface VanetNetwork {
  connectedVehicles: number;
  signalStrength: number;
  networkLatency: number;
  messageDeliveryRate: number;
}

export const useVanetCommunication = (ambulanceLocation?: [number, number]) => {
  const [messages, setMessages] = useState<VanetMessage[]>([]);
  const [networkStatus, setNetworkStatus] = useState<VanetNetwork>({
    connectedVehicles: 0,
    signalStrength: 0,
    networkLatency: 0,
    messageDeliveryRate: 0,
  });

  useEffect(() => {
    console.log('VANET hook useEffect triggered with location:', ambulanceLocation);
    if (!ambulanceLocation) {
      console.log('No ambulance location provided, skipping VANET setup');
      return;
    }

    // Initialize with some messages
    const initialMessages: VanetMessage[] = [
      {
        id: 'msg_001',
        vehicleId: 'vehicle_123',
        messageType: 'traffic_update',
        content: 'Heavy traffic ahead on FDR Drive, consider alternate route',
        priority: 'medium',
        location: { lat: ambulanceLocation[1] + 0.001, lng: ambulanceLocation[0] + 0.001 },
        timestamp: new Date(),
        range: 500,
      },
      {
        id: 'msg_002',
        vehicleId: 'vehicle_456',
        messageType: 'emergency_alert',
        content: 'Emergency vehicle approaching, please clear the way',
        priority: 'critical',
        location: { lat: ambulanceLocation[1], lng: ambulanceLocation[0] },
        timestamp: new Date(),
        range: 1000,
      },
    ];

    setMessages(initialMessages);
    setNetworkStatus({
      connectedVehicles: Math.floor(Math.random() * 20) + 5,
      signalStrength: 85 + Math.random() * 10,
      networkLatency: 20 + Math.random() * 30,
      messageDeliveryRate: 95 + Math.random() * 5,
    });

    // Update VANET messages every 3 seconds
    console.log('Setting up VANET message interval');
    const messageInterval = setInterval(() => {
      console.log('Generating new VANET message...');
      const messageTypes: VanetMessage['messageType'][] = [
        'emergency_alert', 'traffic_update', 'route_advisory', 'safety_warning'
      ];
      const priorities: VanetMessage['priority'][] = ['low', 'medium', 'high', 'critical'];
      
      const messageContents = {
        emergency_alert: [
          'Emergency vehicle approaching intersection',
          'Ambulance requesting priority lane access',
          'Medical emergency in progress',
          'Priority vehicle needs right of way',
        ],
        traffic_update: [
          'Traffic congestion detected ahead',
          'Road construction causing delays',
          'Accident reported, alternate route suggested',
          'Heavy traffic on main arterial roads',
        ],
        route_advisory: [
          'Optimal route updated based on current conditions',
          'Bridge closure ahead, rerouting recommended',
          'Faster route available via alternate bridge',
          'Real-time route optimization active',
        ],
        safety_warning: [
          'Wet road conditions detected',
          'Low visibility due to weather',
          'Pedestrian activity in area',
          'School zone - reduced speed advised',
        ],
      };

      const newMessage: VanetMessage = {
        id: `msg_${Date.now()}`,
        vehicleId: `vehicle_${Math.floor(Math.random() * 1000)}`,
        messageType: messageTypes[Math.floor(Math.random() * messageTypes.length)],
        content: '',
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        location: {
          lat: ambulanceLocation[1] + (Math.random() - 0.5) * 0.01,
          lng: ambulanceLocation[0] + (Math.random() - 0.5) * 0.01,
        },
        timestamp: new Date(),
        range: 200 + Math.random() * 800,
      };

      newMessage.content = messageContents[newMessage.messageType][
        Math.floor(Math.random() * messageContents[newMessage.messageType].length)
      ];

      setMessages(prev => {
        const updated = [newMessage, ...prev.slice(0, 9)]; // Keep only 10 most recent
        console.log('Updated VANET messages count:', updated.length);
        return updated;
      });

      // Update network status
      setNetworkStatus(prev => ({
        connectedVehicles: Math.max(3, prev.connectedVehicles + Math.floor(Math.random() * 6) - 3),
        signalStrength: Math.max(60, Math.min(100, prev.signalStrength + Math.random() * 10 - 5)),
        networkLatency: Math.max(10, Math.min(100, prev.networkLatency + Math.random() * 20 - 10)),
        messageDeliveryRate: Math.max(85, Math.min(100, prev.messageDeliveryRate + Math.random() * 6 - 3)),
      }));
    }, 3000); // Update every 3 seconds

    // Cleanup function
    return () => {
      console.log('Cleaning up VANET message interval');
      clearInterval(messageInterval);
    };
  }, [ambulanceLocation?.[0], ambulanceLocation?.[1]]); // More specific dependency tracking

  return { messages, networkStatus };
};