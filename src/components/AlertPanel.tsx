import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, AlertTriangle, Info, CheckCircle, X, Clock, MapPin } from 'lucide-react';

interface Alert {
  id: string;
  type: 'emergency' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  location?: string;
  priority: 'high' | 'medium' | 'low';
  acknowledged: boolean;
  source: string;
}

const AlertPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'warning' | 'info'>('all');

  useEffect(() => {
    // Initialize with mock alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'emergency',
        title: 'Ambulance AMB-101 Delayed',
        message: 'AMB-101 is experiencing significant delays due to heavy traffic on Route 95. ETA extended by 15 minutes.',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        location: 'Route 95, Mile 23',
        priority: 'high',
        acknowledged: false,
        source: 'GPS Tracking'
      },
      {
        id: '2',
        type: 'warning',
        title: 'Hospital Capacity Alert',
        message: 'General Hospital is at 95% capacity. Consider routing to alternative facilities.',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        location: 'General Hospital',
        priority: 'medium',
        acknowledged: false,
        source: 'Hospital Management'
      },
      {
        id: '3',
        type: 'info',
        title: 'Weather Update',
        message: 'Heavy rain expected in the downtown area. Exercise caution and allow extra time.',
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        priority: 'low',
        acknowledged: true,
        source: 'Weather Service'
      },
      {
        id: '4',
        type: 'success',
        title: 'System Maintenance Complete',
        message: 'Scheduled maintenance on the communication system has been completed successfully.',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        priority: 'low',
        acknowledged: true,
        source: 'System Admin'
      },
      {
        id: '5',
        type: 'emergency',
        title: 'Multi-Vehicle Accident',
        message: 'Major accident reported on I-95 North. Multiple ambulances dispatched. Traffic expected to be severely impacted.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        location: 'I-95 North, Exit 42',
        priority: 'high',
        acknowledged: false,
        source: 'Emergency Dispatch'
      }
    ];

    setAlerts(mockAlerts);

    // Simulate new alerts
    const interval = setInterval(() => {
      const newAlert: Alert = {
        id: `alert_${Date.now()}`,
        type: ['emergency', 'warning', 'info'][Math.floor(Math.random() * 3)] as any,
        title: `System Alert ${Math.floor(Math.random() * 1000)}`,
        message: 'This is a simulated alert message for demonstration purposes.',
        timestamp: new Date(),
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
        acknowledged: false,
        source: 'Automated System'
      };

      setAlerts(prev => [newAlert, ...prev].slice(0, 20)); // Keep only latest 20 alerts
    }, 30000); // New alert every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'info': return <Info className="w-4 h-4 text-blue-600" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'emergency': return 'destructive';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      case 'success': return 'default';
      default: return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.type === filter
  );

  const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alert & Notification Center
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {['all', 'emergency', 'warning', 'info'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType as any)}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No alerts to display</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 rounded-lg border bg-card ${getPriorityColor(alert.priority)} ${
                    !alert.acknowledged ? 'bg-muted/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                            {alert.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                          {alert.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {alert.location}
                            </span>
                          )}
                          <span>Source: {alert.source}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      {!alert.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="h-8 px-2"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-8 px-2"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlertPanel;