import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Notification, Broadcast, StatusMessage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Bell, Radio, MessageSquare, Send, AlertTriangle, Info, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface CommunicationCenterProps {
  currentUserId?: string;
  userRole?: string;
}

const CommunicationCenter: React.FC<CommunicationCenterProps> = ({ 
  currentUserId = 'demo-user', 
  userRole = 'dispatcher' 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [showNewBroadcast, setShowNewBroadcast] = useState(false);
  const [showNewNotification, setShowNewNotification] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState<Partial<Broadcast>>({});
  const [newNotification, setNewNotification] = useState<Partial<Notification>>({});
  const [newStatus, setNewStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunications();
    
    // Set up real-time subscriptions
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
      })
      .subscribe();

    const broadcastsChannel = supabase
      .channel('broadcasts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'broadcasts' }, () => {
        fetchBroadcasts();
      })
      .subscribe();

    const statusChannel = supabase
      .channel('status-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_messages' }, () => {
        fetchStatusMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(broadcastsChannel);
      supabase.removeChannel(statusChannel);
    };
  }, []);

  const fetchCommunications = async () => {
    await Promise.all([
      fetchNotifications(),
      fetchBroadcasts(),
      fetchStatusMessages()
    ]);
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`recipient_id.eq.${currentUserId},recipient_type.eq.all`)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchBroadcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBroadcasts((data || []) as Broadcast[]);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    }
  };

  const fetchStatusMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('status_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setStatusMessages((data || []) as StatusMessage[]);
    } catch (error) {
      console.error('Error fetching status messages:', error);
    }
  };

  const createBroadcast = async () => {
    if (!newBroadcast.title || !newBroadcast.message || !newBroadcast.broadcast_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const broadcastData = {
        ...newBroadcast,
        sender_id: currentUserId,
        target_audience: newBroadcast.target_audience || ['all']
      };

      const { error } = await supabase
        .from('broadcasts')
        .insert([broadcastData as any]);

      if (error) throw error;

      setNewBroadcast({});
      setShowNewBroadcast(false);
      toast({
        title: "Success",
        description: "Broadcast sent successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send broadcast",
        variant: "destructive"
      });
    }
  };

  const createNotification = async () => {
    if (!newNotification.title || !newNotification.message || !newNotification.recipient_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const notificationData = {
        ...newNotification,
        recipient_id: newNotification.recipient_id || 'all',
        notification_type: newNotification.notification_type || 'info'
      };

      const { error } = await supabase
        .from('notifications')
        .insert([notificationData as any]);

      if (error) throw error;

      setNewNotification({});
      setShowNewNotification(false);
      toast({
        title: "Success",
        description: "Notification sent successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      });
    }
  };

  const sendStatusUpdate = async () => {
    if (!newStatus.trim()) return;

    try {
      const statusData = {
        sender_id: currentUserId,
        message: newStatus,
        status_type: 'available' // Default status type
      };

      const { error } = await supabase
        .from('status_messages')
        .insert([statusData]);

      if (error) throw error;

      setNewStatus('');
      toast({
        title: "Status updated",
        description: "Your status has been shared"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBroadcastTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'destructive';
      case 'alert': return 'destructive';
      case 'maintenance': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusTypeColor = (type: string) => {
    switch (type) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'emergency': return 'destructive';
      case 'maintenance': return 'default';
      case 'offline': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <div className="space-x-2">
          <Dialog open={showNewNotification} onOpenChange={setShowNewNotification}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notif-title">Title *</Label>
                  <Input
                    id="notif-title"
                    value={newNotification.title || ''}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notif-message">Message *</Label>
                  <Textarea
                    id="notif-message"
                    value={newNotification.message || ''}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Recipient Type *</Label>
                    <Select onValueChange={(value) => setNewNotification({...newNotification, recipient_type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="driver">Drivers</SelectItem>
                        <SelectItem value="hospital_staff">Hospital Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select onValueChange={(value) => setNewNotification({...newNotification, notification_type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={createNotification} className="w-full">Send Notification</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showNewBroadcast} onOpenChange={setShowNewBroadcast}>
            <DialogTrigger asChild>
              <Button>
                <Radio className="w-4 h-4 mr-2" />
                Create Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Broadcast</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="broadcast-title">Title *</Label>
                  <Input
                    id="broadcast-title"
                    value={newBroadcast.title || ''}
                    onChange={(e) => setNewBroadcast({...newBroadcast, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="broadcast-message">Message *</Label>
                  <Textarea
                    id="broadcast-message"
                    value={newBroadcast.message || ''}
                    onChange={(e) => setNewBroadcast({...newBroadcast, message: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Broadcast Type *</Label>
                  <Select onValueChange={(value) => setNewBroadcast({...newBroadcast, broadcast_type: value as any})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="alert">Alert</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createBroadcast} className="w-full">Create Broadcast</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="status">Status Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                {notifications.filter(n => !n.is_read).length} unread notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.notification_type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{notification.title}</h4>
                            <div className="flex items-center space-x-2">
                              {!notification.is_read && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {notification.recipient_type}
                            </Badge>
                            <Badge variant={notification.notification_type === 'emergency' ? 'destructive' : 'secondary'} className="text-xs">
                              {notification.notification_type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No notifications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts">
          <Card>
            <CardHeader>
              <CardTitle>Active Broadcasts</CardTitle>
              <CardDescription>System-wide announcements and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {broadcasts.length > 0 ? (
                  broadcasts.map((broadcast) => (
                    <div key={broadcast.id} className="p-4 border rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Radio className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{broadcast.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant={getBroadcastTypeColor(broadcast.broadcast_type)}>
                                {broadcast.broadcast_type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(broadcast.created_at), 'MMM dd, HH:mm')}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{broadcast.message}</p>
                          {broadcast.expires_at && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Expires: {format(new Date(broadcast.expires_at), 'MMM dd, yyyy HH:mm')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No active broadcasts</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Status Updates</CardTitle>
              <CardDescription>Real-time status messages from team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Share a status update..."
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendStatusUpdate()}
                  />
                  <Button onClick={sendStatusUpdate} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {statusMessages.length > 0 ? (
                    statusMessages.map((status) => (
                      <div key={status.id} className="p-3 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm">{status.message}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant={getStatusTypeColor(status.status_type)} className="text-xs">
                                  {status.status_type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(status.created_at), 'HH:mm')}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">User: {status.sender_id}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No status updates</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationCenter;