import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { RouteOptimization, TrafficCondition } from '@/types';

interface StatusStripProps {
  route: RouteOptimization | null;
  eta: Date | null;
  distance: number | null;
  nextTurn: string | null;
  trafficConditions: TrafficCondition[];
}

const StatusStrip: React.FC<StatusStripProps> = ({
  route,
  eta,
  distance,
  nextTurn,
  trafficConditions
}) => {
  const getOverallTrafficLevel = () => {
    if (trafficConditions.length === 0) return 'light';
    const heavyCount = trafficConditions.filter(t => t.traffic_level === 'heavy').length;
    const moderateCount = trafficConditions.filter(t => t.traffic_level === 'moderate').length;
    
    if (heavyCount > trafficConditions.length * 0.3) return 'heavy';
    if (moderateCount > trafficConditions.length * 0.5) return 'moderate';
    return 'light';
  };

  const getTrafficBadgeVariant = (level: string) => {
    switch (level) {
      case 'heavy': return 'destructive';
      case 'moderate': return 'secondary';
      default: return 'outline';
    }
  };

  const overallTrafficLevel = getOverallTrafficLevel();

  return (
    <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b px-4 py-3 md:px-6">
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-6">
          {/* ETA */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {eta ? eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </span>
          </div>

          {/* Distance */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {distance ? `${distance.toFixed(1)} km` : '-- km'}
            </span>
          </div>

          {/* Next Turn */}
          <div className="flex items-center gap-2 max-w-xs truncate">
            <Navigation className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">
              {nextTurn || 'Continue straight'}
            </span>
          </div>
        </div>

        {/* Traffic Status */}
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          <Badge variant={getTrafficBadgeVariant(overallTrafficLevel)}>
            {overallTrafficLevel.charAt(0).toUpperCase() + overallTrafficLevel.slice(1)} Traffic
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default StatusStrip;