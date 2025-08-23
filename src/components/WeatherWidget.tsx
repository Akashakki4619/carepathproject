import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Eye, Droplets, Thermometer } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  alerts: string[];
  forecast: Array<{
    time: string;
    temperature: number;
    condition: string;
    rainChance: number;
  }>;
}

interface WeatherImpact {
  level: 'low' | 'moderate' | 'high' | 'severe';
  factors: string[];
  recommendations: string[];
}

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate weather data fetch
    const mockWeatherData: WeatherData = {
      location: 'New York City',
      temperature: 72,
      condition: 'cloudy',
      humidity: 65,
      windSpeed: 12,
      visibility: 8.5,
      pressure: 30.15,
      alerts: ['Heavy rain expected between 2-6 PM', 'Reduced visibility in downtown area'],
      forecast: [
        { time: '2:00 PM', temperature: 74, condition: 'Cloudy', rainChance: 20 },
        { time: '4:00 PM', temperature: 71, condition: 'Rainy', rainChance: 80 },
        { time: '6:00 PM', temperature: 68, condition: 'Rainy', rainChance: 90 },
        { time: '8:00 PM', temperature: 66, condition: 'Cloudy', rainChance: 30 },
      ]
    };

    setTimeout(() => {
      setWeatherData(mockWeatherData);
      setLoading(false);
    }, 1000);

    // Simulate weather updates
    const interval = setInterval(() => {
      setWeatherData(prev => prev ? {
        ...prev,
        temperature: prev.temperature + Math.floor(Math.random() * 6) - 3,
        windSpeed: Math.max(0, prev.windSpeed + Math.floor(Math.random() * 6) - 3),
        humidity: Math.max(0, Math.min(100, prev.humidity + Math.floor(Math.random() * 10) - 5)),
      } : null);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string, size: 'sm' | 'lg' = 'sm') => {
    const iconSize = size === 'lg' ? 'w-8 h-8' : 'w-4 h-4';
    
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className={`${iconSize} text-yellow-500`} />;
      case 'cloudy':
        return <Cloud className={`${iconSize} text-gray-500`} />;
      case 'rainy':
        return <CloudRain className={`${iconSize} text-blue-500`} />;
      case 'snowy':
        return <CloudSnow className={`${iconSize} text-blue-300`} />;
      case 'windy':
        return <Wind className={`${iconSize} text-gray-600`} />;
      default:
        return <Cloud className={`${iconSize} text-gray-500`} />;
    }
  };

  const calculateWeatherImpact = (weather: WeatherData): WeatherImpact => {
    const factors: string[] = [];
    let level: 'low' | 'moderate' | 'high' | 'severe' = 'low';

    if (weather.visibility < 5) {
      factors.push('Poor visibility');
      level = 'moderate';
    }
    if (weather.windSpeed > 25) {
      factors.push('High winds');
      level = 'high';
    }
    if (weather.windSpeed > 40) {
      factors.push('Extreme winds');
      level = 'severe';
    }
    if (weather.condition === 'rainy' || weather.condition === 'snowy') {
      factors.push('Precipitation');
      level = weather.condition === 'snowy' ? 'high' : 'moderate';
    }
    if (weather.temperature < 32) {
      factors.push('Freezing temperature');
      level = 'high';
    }

    const recommendations: string[] = [];
    if (level === 'high' || level === 'severe') {
      recommendations.push('Increase response time estimates by 20-30%');
      recommendations.push('Exercise extreme caution on all routes');
      recommendations.push('Consider alternative routes to avoid weather hazards');
    } else if (level === 'moderate') {
      recommendations.push('Allow extra time for emergency responses');
      recommendations.push('Monitor weather conditions closely');
    }

    return { level, factors, recommendations };
  };

  const getImpactBadgeVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case 'severe': return 'destructive';
      case 'high': return 'destructive';
      case 'moderate': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading weather data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) return null;

  const weatherImpact = calculateWeatherImpact(weatherData);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Weather Conditions - {weatherData.location}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Current Conditions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {getWeatherIcon(weatherData.condition, 'lg')}
                <div>
                  <div className="text-3xl font-bold">{weatherData.temperature}°F</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {weatherData.condition}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Humidity: {weatherData.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-600" />
                  <span>Wind: {weatherData.windSpeed} mph</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span>Visibility: {weatherData.visibility} mi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span>Pressure: {weatherData.pressure}"</span>
                </div>
              </div>
            </div>

            {/* Weather Impact */}
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Emergency Response Impact</h4>
                <Badge variant={getImpactBadgeVariant(weatherImpact.level)}>
                  {weatherImpact.level.toUpperCase()} IMPACT
                </Badge>
              </div>

              {weatherImpact.factors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Affecting Factors:</p>
                  <ul className="text-xs text-muted-foreground">
                    {weatherImpact.factors.map((factor, index) => (
                      <li key={index}>• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {weatherImpact.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Recommendations:</p>
                  <ul className="text-xs text-muted-foreground">
                    {weatherImpact.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Weather Alerts */}
          {weatherData.alerts.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <h4 className="font-medium text-yellow-800 mb-2">Weather Alerts</h4>
              <ul className="text-sm text-yellow-700">
                {weatherData.alerts.map((alert, index) => (
                  <li key={index}>• {alert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 4-Hour Forecast */}
          <div className="mt-4">
            <h4 className="font-medium mb-3">4-Hour Forecast</h4>
            <div className="grid grid-cols-4 gap-2">
              {weatherData.forecast.map((forecast, index) => (
                <div key={index} className="text-center p-2 border rounded">
                  <div className="text-xs text-muted-foreground mb-1">{forecast.time}</div>
                  <div className="flex justify-center mb-1">
                    {getWeatherIcon(forecast.condition)}
                  </div>
                  <div className="text-sm font-medium">{forecast.temperature}°</div>
                  {forecast.rainChance > 30 && (
                    <div className="text-xs text-blue-600">{forecast.rainChance}%</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherWidget;