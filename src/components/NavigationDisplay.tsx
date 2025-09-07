import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NavigationInstruction } from '@/utils/navigationInstructions';
import { Navigation, MapPin, Clock } from 'lucide-react';

interface NavigationDisplayProps {
  currentInstruction: NavigationInstruction | null;
  instructionIndex: number;
  totalInstructions: number;
  distance: number | null;
  eta: Date | null;
}

const NavigationDisplay: React.FC<NavigationDisplayProps> = ({
  currentInstruction,
  instructionIndex,
  totalInstructions,
  distance,
  eta
}) => {
  if (!currentInstruction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            <p>No active navigation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getInstructionIcon = (type: string) => {
    switch (type) {
      case 'turn_left':
        return '↰';
      case 'turn_right':
        return '↱';
      case 'continue_straight':
        return '⬆️';
      case 'arrive_destination':
        return '🏁';
      case 'start_route':
        return '🚀';
      default:
        return '➡️';
    }
  };

  const getInstructionColor = (type: string) => {
    switch (type) {
      case 'turn_left':
      case 'turn_right':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'arrive_destination':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'start_route':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Navigation
          <Badge variant="outline" className="ml-auto">
            {instructionIndex + 1} of {totalInstructions}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Instruction */}
        <div className={`p-4 rounded-lg border ${getInstructionColor(currentInstruction.type)}`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">
              {getInstructionIcon(currentInstruction.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {currentInstruction.instruction}
              </h3>
              {currentInstruction.distance > 0 && (
                <p className="text-sm opacity-80">
                  {currentInstruction.distance < 1000 
                    ? `${Math.round(currentInstruction.distance)}m` 
                    : `${(currentInstruction.distance / 1000).toFixed(1)}km`
                  }
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>
              {distance ? `${distance.toFixed(1)} km` : '-- km'} remaining
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>
              ETA: {eta ? eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(((instructionIndex + 1) / totalInstructions) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((instructionIndex + 1) / totalInstructions) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NavigationDisplay;
