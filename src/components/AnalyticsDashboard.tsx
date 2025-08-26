import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { ResponseAnalytics, CapacityTrend, RouteEfficiency } from '@/types';
import { Clock, TrendingUp, MapPin, Users, Ambulance, Hospital, Activity } from 'lucide-react';
import QosVisualization from '@/components/QosVisualization';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const AnalyticsDashboard: React.FC = () => {
  const [responseAnalytics, setResponseAnalytics] = useState<ResponseAnalytics[]>([]);
  const [capacityTrends, setCapacityTrends] = useState<CapacityTrend[]>([]);
  const [routeEfficiency, setRouteEfficiency] = useState<RouteEfficiency[]>([]);
  const [timeRange, setTimeRange] = useState('7days');
  const [selectedHospital, setSelectedHospital] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedHospital]);

  const fetchAnalytics = async () => {
    const endDate = new Date();
    const startDate = subDays(endDate, timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90);

    try {
      // Fetch response analytics
      let responseQuery = supabase
        .from('response_analytics')
        .select('*')
        .gte('dispatch_time', startDate.toISOString())
        .lte('dispatch_time', endDate.toISOString());

      if (selectedHospital !== 'all') {
        responseQuery = responseQuery.eq('hospital_id', selectedHospital);
      }

      const { data: responseData } = await responseQuery;
      setResponseAnalytics(responseData || []);

      // Fetch capacity trends
      let capacityQuery = supabase
        .from('capacity_trends')
        .select('*')
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'));

      if (selectedHospital !== 'all') {
        capacityQuery = capacityQuery.eq('hospital_id', selectedHospital);
      }

      const { data: capacityData } = await capacityQuery;
      setCapacityTrends(capacityData || []);

      // Fetch route efficiency
      const { data: routeData } = await supabase
        .from('route_efficiency')
        .select('*')
        .gte('date_recorded', format(startDate, 'yyyy-MM-dd'))
        .lte('date_recorded', format(endDate, 'yyyy-MM-dd'));

      setRouteEfficiency(routeData || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Sample data for demonstration
  const sampleResponseTimes = [
    { date: '2024-01-20', avg_response_time: 12.5, total_trips: 15 },
    { date: '2024-01-21', avg_response_time: 11.8, total_trips: 18 },
    { date: '2024-01-22', avg_response_time: 13.2, total_trips: 22 },
    { date: '2024-01-23', avg_response_time: 10.9, total_trips: 16 },
    { date: '2024-01-24', avg_response_time: 12.1, total_trips: 20 },
    { date: '2024-01-25', avg_response_time: 11.5, total_trips: 19 },
    { date: '2024-01-26', avg_response_time: 12.8, total_trips: 17 }
  ];

  const sampleCapacityData = [
    { hour: '00:00', occupied: 45, capacity: 100 },
    { hour: '04:00', occupied: 38, capacity: 100 },
    { hour: '08:00', occupied: 65, capacity: 100 },
    { hour: '12:00', occupied: 78, capacity: 100 },
    { hour: '16:00', occupied: 82, capacity: 100 },
    { hour: '20:00', occupied: 71, capacity: 100 }
  ];

  const sampleHospitalData = [
    { name: 'Metro General', value: 35, color: '#8884d8' },
    { name: 'City Medical', value: 28, color: '#82ca9d' },
    { name: 'Emergency Center', value: 22, color: '#ffc658' },
    { name: 'Regional Hospital', value: 15, color: '#ff7300' }
  ];

  const sampleEfficiencyData = [
    { route: 'Route A', efficiency: 0.85, trips: 25 },
    { route: 'Route B', efficiency: 0.92, trips: 18 },
    { route: 'Route C', efficiency: 0.78, trips: 32 },
    { route: 'Route D', efficiency: 0.88, trips: 21 },
    { route: 'Route E', efficiency: 0.91, trips: 15 }
  ];

  const avgResponseTime = sampleResponseTimes.reduce((acc, day) => acc + day.avg_response_time, 0) / sampleResponseTimes.length;
  const totalTrips = sampleResponseTimes.reduce((acc, day) => acc + day.total_trips, 0);
  const avgEfficiency = sampleEfficiencyData.reduce((acc, route) => acc + route.efficiency, 0) / sampleEfficiencyData.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics & Reporting</h1>
        <div className="flex space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedHospital} onValueChange={setSelectedHospital}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hospitals</SelectItem>
              <SelectItem value="metro-general">Metro General</SelectItem>
              <SelectItem value="city-medical">City Medical</SelectItem>
              <SelectItem value="emergency-center">Emergency Center</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(1)} min</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              2.1% improvement from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Ambulance className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrips}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Route Efficiency</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgEfficiency * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hospital Capacity</CardTitle>
            <Hospital className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              Average utilization
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="response" className="space-y-4">
        <TabsList>
          <TabsTrigger value="response">Response Times</TabsTrigger>
          <TabsTrigger value="capacity">Hospital Capacity</TabsTrigger>
          <TabsTrigger value="routes">Route Efficiency</TabsTrigger>
          <TabsTrigger value="distribution">Trip Distribution</TabsTrigger>
          <TabsTrigger value="qos">QoS Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="response" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>Average response times over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sampleResponseTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="avg_response_time" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Avg Response Time (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Trip Volume</CardTitle>
                <CardDescription>Number of trips per day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sampleResponseTimes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_trips" fill="#82ca9d" name="Total Trips" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">92%</div>
                  <p className="text-sm text-muted-foreground">On-time arrivals</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">8.5 min</div>
                  <p className="text-sm text-muted-foreground">Best response time</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">15.2 min</div>
                  <p className="text-sm text-muted-foreground">Longest response time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hospital Capacity by Hour</CardTitle>
                <CardDescription>Bed occupancy throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={sampleCapacityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="occupied" stackId="1" stroke="#8884d8" fill="#8884d8" name="Occupied Beds" />
                    <Area type="monotone" dataKey="capacity" stackId="2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Total Capacity" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity Alerts</CardTitle>
                <CardDescription>Current capacity status by hospital</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Metro General Hospital</p>
                      <p className="text-sm text-muted-foreground">85% capacity</p>
                    </div>
                    <Badge variant="destructive">High</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">City Medical Center</p>
                      <p className="text-sm text-muted-foreground">68% capacity</p>
                    </div>
                    <Badge variant="default">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Emergency Center</p>
                      <p className="text-sm text-muted-foreground">92% capacity</p>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Efficiency Analysis</CardTitle>
              <CardDescription>Performance metrics for different routes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={sampleEfficiencyData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} />
                  <YAxis dataKey="route" type="category" />
                  <Tooltip formatter={(value) => `${(value as number * 100).toFixed(1)}%`} />
                  <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Performing Route</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">Route B</div>
                  <p className="text-sm text-muted-foreground">92% efficiency</p>
                  <p className="text-xs text-muted-foreground mt-2">18 trips completed</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Most Used Route</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">Route C</div>
                  <p className="text-sm text-muted-foreground">32 trips</p>
                  <p className="text-xs text-muted-foreground mt-2">78% efficiency</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Improvement Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">Route C</div>
                  <p className="text-sm text-muted-foreground">78% efficiency</p>
                  <p className="text-xs text-muted-foreground mt-2">Needs optimization</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip Distribution by Hospital</CardTitle>
                <CardDescription>Percentage of trips to each hospital</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sampleHospitalData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {sampleHospitalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hospital Statistics</CardTitle>
                <CardDescription>Detailed breakdown by facility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleHospitalData.map((hospital, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: hospital.color }}
                        />
                        <div>
                          <p className="font-medium">{hospital.name}</p>
                          <p className="text-sm text-muted-foreground">{hospital.value}% of trips</p>
                        </div>
                      </div>
                      <Badge variant="outline">{hospital.value}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qos" className="space-y-4">
          <QosVisualization />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;