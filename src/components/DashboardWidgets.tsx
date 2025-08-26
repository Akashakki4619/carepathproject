import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Clock, Users, AlertCircle, CheckCircle, MapPin, Zap } from 'lucide-react';

// Mock data for charts
const responseTimeData = [
  { time: '00:00', avgTime: 8.2, target: 8.0 },
  { time: '04:00', avgTime: 7.1, target: 8.0 },
  { time: '08:00', avgTime: 9.5, target: 8.0 },
  { time: '12:00', avgTime: 10.2, target: 8.0 },
  { time: '16:00', avgTime: 11.8, target: 8.0 },
  { time: '20:00', avgTime: 9.7, target: 8.0 },
];

const capacityData = [
  { hospital: 'General', used: 420, total: 500 },
  { hospital: 'Memorial', used: 245, total: 300 },
  { hospital: 'St. Mary', used: 189, total: 250 },
  { hospital: 'Central', used: 310, total: 400 },
];

const incidentTypeData = [
  { name: 'Medical Emergency', value: 45, color: '#ef4444' },
  { name: 'Traffic Accident', value: 28, color: '#f59e0b' },
  { name: 'Fire Emergency', value: 15, color: '#dc2626' },
  { name: 'Other', value: 12, color: '#6b7280' },
];

const performanceMetrics = [
  { metric: 'Average Response Time', value: '9.2 min', change: '-0.8', trend: 'down', target: '8.0 min' },
  { metric: 'Success Rate', value: '94.2%', change: '+1.2', trend: 'up', target: '95.0%' },
  { metric: 'Fleet Utilization', value: '78%', change: '+5', trend: 'up', target: '80%' },
  { metric: 'Patient Satisfaction', value: '4.7/5', change: '+0.1', trend: 'up', target: '4.5/5' },
];

const PerformanceMetrics: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {performanceMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
            <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={`flex items-center ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? '+' : ''}{metric.change}
              </span>
              <span>Target: {metric.target}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ResponseTimeChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Response Time Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={responseTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="avgTime" stroke="#ef4444" strokeWidth={2} name="Avg Response Time" />
            <Line type="monotone" dataKey="target" stroke="#22c55e" strokeDasharray="5 5" name="Target" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const HospitalCapacityChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Hospital Capacity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={capacityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hospital" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="used" fill="#ef4444" name="Used Beds" />
            <Bar dataKey="total" fill="#e5e7eb" name="Total Capacity" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const IncidentTypesChart: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Incident Types Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={incidentTypeData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {incidentTypeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const SystemHealthPanel: React.FC = () => {
  const systemMetrics = [
    { component: 'GPS Tracking', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' },
    { component: 'Communication System', status: 'warning', uptime: '98.1%', lastCheck: '1 min ago' },
    { component: 'Database', status: 'healthy', uptime: '99.7%', lastCheck: '30 sec ago' },
    { component: 'Weather API', status: 'healthy', uptime: '99.2%', lastCheck: '1 min ago' },
    { component: 'Traffic Data', status: 'error', uptime: '95.3%', lastCheck: '5 min ago' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          System Health Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(metric.status)}
                <div>
                  <p className="font-medium">{metric.component}</p>
                  <p className="text-xs text-muted-foreground">Last checked: {metric.lastCheck}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={getStatusVariant(metric.status)}>
                  {metric.status}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Uptime: {metric.uptime}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const ResourceUtilization: React.FC = () => {
  const resources = [
    { name: 'Ambulances Available', current: 12, total: 15, percentage: 80 },
    { name: 'Drivers on Duty', current: 28, total: 35, percentage: 80 },
    { name: 'Hospital Beds', current: 1164, total: 1450, percentage: 80.3 },
    { name: 'ICU Capacity', current: 89, total: 120, percentage: 74.2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Resource Utilization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {resources.map((resource, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{resource.name}</span>
                <span>{resource.current}/{resource.total}</span>
              </div>
              <Progress value={resource.percentage} className="h-2" />
              <div className="text-xs text-muted-foreground text-right">
                {resource.percentage.toFixed(1)}% utilized
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardWidgets: React.FC = () => {
  return (
    <div className="space-y-6">
      <PerformanceMetrics />
      
      <div className="grid gap-6 md:grid-cols-2">
        <ResponseTimeChart />
        <HospitalCapacityChart />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <IncidentTypesChart />
        <ResourceUtilization />
      </div>
      
      <SystemHealthPanel />
    </div>
  );
};

export default DashboardWidgets;