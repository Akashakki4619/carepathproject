import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { qosManager, QosAnalytics, LinkMetrics, Priority } from '@/services/QosManager';
import { Activity, Wifi, Clock, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface QosVisualizationProps {
  className?: string;
}

const QosVisualization: React.FC<QosVisualizationProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<QosAnalytics[]>([]);
  const [linkMetrics, setLinkMetrics] = useState<LinkMetrics[]>([]);
  const [queueStatus, setQueueStatus] = useState<{ [key in Priority]: number }>({
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  });
  const [timeRange, setTimeRange] = useState('1h');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchData = async () => {
    try {
      const [analyticsData, linksData, queueData] = await Promise.all([
        qosManager.getAnalytics(timeRange),
        qosManager.getLinkMetrics(),
        qosManager.getQueueStatus()
      ]);

      setAnalytics(analyticsData);
      setLinkMetrics(linksData);
      setQueueStatus(queueData);
    } catch (error) {
      console.error('Failed to fetch QoS data:', error);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getPriorityVariant = (priority: Priority) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  // Aggregate analytics data by priority for charts
  const priorityMetrics = Object.entries(queueStatus).map(([priority, count]) => {
    const recentAnalytics = analytics.filter(a => a.priority_level === priority).slice(0, 10);
    const avgLatency = recentAnalytics.reduce((sum, a) => sum + a.avg_latency_ms, 0) / Math.max(1, recentAnalytics.length);
    const avgThroughput = recentAnalytics.reduce((sum, a) => sum + a.avg_throughput_kbps, 0) / Math.max(1, recentAnalytics.length);
    const avgLossRate = recentAnalytics.reduce((sum, a) => sum + a.packet_loss_rate, 0) / Math.max(1, recentAnalytics.length);

    return {
      priority: priority as Priority,
      queuedPackets: count,
      avgLatency: Number(avgLatency.toFixed(2)),
      avgThroughput: Number(avgThroughput.toFixed(2)),
      lossRate: Number((avgLossRate * 100).toFixed(2))
    };
  });

  // Time series data for latency chart
  const latencyData = analytics.slice(0, 20).reverse().map((item, index) => ({
    time: index,
    [item.priority_level]: item.avg_latency_ms,
    timestamp: new Date(item.created_at || Date.now()).toLocaleTimeString()
  })).reduce((acc, curr) => {
    const existing = acc.find(item => item.time === curr.time);
    if (existing) {
      Object.assign(existing, curr);
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as any[]);

  const totalQueuedPackets = Object.values(queueStatus).reduce((sum, count) => sum + count, 0);
  const avgLatency = priorityMetrics.reduce((sum, p) => sum + p.avgLatency, 0) / Math.max(1, priorityMetrics.length);
  const avgThroughput = priorityMetrics.reduce((sum, p) => sum + p.avgThroughput, 0) / Math.max(1, priorityMetrics.length);
  const currentLink = linkMetrics[0];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">QoS Analytics Dashboard</h2>
          <p className="text-muted-foreground">VANET Quality of Service Monitoring</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="6h">Last 6 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueuedPackets}</div>
            <p className="text-xs text-muted-foreground">packets queued</p>
            <div className="flex gap-1 mt-2">
              {Object.entries(queueStatus).map(([priority, count]) => (
                <Badge key={priority} variant={getPriorityVariant(priority as Priority)} className="text-xs">
                  {priority}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency.toFixed(1)}ms</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Real-time average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgThroughput.toFixed(1)} kbps</div>
            <p className="text-xs text-muted-foreground">average data rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Status</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentLink?.is_active ? 'ACTIVE' : 'DOWN'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentLink ? `${currentLink.current_utilization.toFixed(1)}% utilized` : 'No link data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Latency by Priority</CardTitle>
            <CardDescription>Real-time latency monitoring across priority levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="CRITICAL" stroke="#ef4444" strokeWidth={2} name="Critical" />
                <Line type="monotone" dataKey="HIGH" stroke="#f97316" strokeWidth={2} name="High" />
                <Line type="monotone" dataKey="MEDIUM" stroke="#eab308" strokeWidth={2} name="Medium" />
                <Line type="monotone" dataKey="LOW" stroke="#22c55e" strokeWidth={2} name="Low" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Current queue composition by priority</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityMetrics.filter(p => p.queuedPackets > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="queuedPackets"
                  label={({ priority, queuedPackets }) => `${priority}: ${queuedPackets}`}
                >
                  {priorityMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Throughput by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Throughput by Priority</CardTitle>
            <CardDescription>Data transmission rates by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgThroughput" fill="#8884d8" name="Throughput (kbps)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Link Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Link Metrics</CardTitle>
            <CardDescription>Current VANET link performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentLink ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Link Utilization</span>
                    <span>{currentLink.current_utilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={currentLink.current_utilization} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Capacity</span>
                    <p className="font-medium">{currentLink.capacity_kbps} kbps</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Packet Loss</span>
                    <p className="font-medium">{(currentLink.packet_loss_rate * 100).toFixed(3)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Jitter</span>
                    <p className="font-medium">{currentLink.jitter_ms}ms</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-1">
                      {currentLink.is_active ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                      )}
                      <span className="font-medium">
                        {currentLink.is_active ? 'Active' : 'Down'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No link data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Priority Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Level Details</CardTitle>
          <CardDescription>Detailed performance metrics by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {priorityMetrics.map((metric) => (
              <div key={metric.priority} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{metric.priority}</h4>
                  <Badge variant={getPriorityVariant(metric.priority)}>
                    {metric.queuedPackets} queued
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Latency</span>
                    <span className="font-medium">{metric.avgLatency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Throughput</span>
                    <span className="font-medium">{metric.avgThroughput} kbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loss Rate</span>
                    <span className="font-medium">{metric.lossRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QosVisualization;