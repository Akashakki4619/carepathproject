import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, DriverShift, HospitalStaffManagement, Permission } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Calendar as CalendarIcon, Shield, Clock, UserPlus, Edit, Trash2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [shifts, setShifts] = useState<DriverShift[]>([]);
  const [hospitalStaff, setHospitalStaff] = useState<HospitalStaffManagement[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const [showNewShiftDialog, setShowNewShiftDialog] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserProfile>>({});
  const [newShift, setNewShift] = useState<Partial<DriverShift>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [shiftDate, setShiftDate] = useState<Date>();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchShifts();
    fetchHospitalStaff();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('last_name');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_shifts')
        .select('*')
        .order('shift_start');
      
      if (error) throw error;
      setShifts(data || []);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const fetchHospitalStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital_staff_management')
        .select('*')
        .order('position');
      
      if (error) throw error;
      setHospitalStaff(data || []);
    } catch (error) {
      console.error('Error fetching hospital staff:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('role');
      
      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const createUser = async () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const userData = {
        ...newUser,
        user_id: `user_${Date.now()}`, // Generate a temporary user ID
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      
      setUsers([...users, data]);
      setNewUser({});
      setShowNewUserDialog(false);
      toast({
        title: "Success",
        description: "User created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  const createShift = async () => {
    if (!newShift.driver_id || !newShift.shift_start || !newShift.shift_end) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('driver_shifts')
        .insert([newShift])
        .select()
        .single();

      if (error) throw error;
      
      setShifts([...shifts, data]);
      setNewShift({});
      setShowNewShiftDialog(false);
      toast({
        title: "Success",
        description: "Shift scheduled successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule shift",
        variant: "destructive"
      });
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
      
      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'dispatcher': return 'default';
      case 'ambulance_driver': return 'secondary';
      case 'hospital_staff': return 'outline';
      default: return 'secondary';
    }
  };

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'scheduled': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'busy': return 'secondary';
      case 'break': return 'outline';
      case 'off_duty': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const driverUsers = users.filter(user => user.role === 'ambulance_driver');
  const activeShifts = shifts.filter(shift => shift.status === 'active' || shift.status === 'scheduled');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="space-x-2">
          <Dialog open={showNewShiftDialog} onOpenChange={setShowNewShiftDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock className="w-4 h-4 mr-2" />
                Schedule Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Shift</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Driver</Label>
                  <Select onValueChange={(value) => setNewShift({...newShift, driver_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {driverUsers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.user_id}>
                          {driver.first_name} {driver.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shift Start</Label>
                    <Input
                      type="datetime-local"
                      value={newShift.shift_start || ''}
                      onChange={(e) => setNewShift({...newShift, shift_start: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shift End</Label>
                    <Input
                      type="datetime-local"
                      value={newShift.shift_end || ''}
                      onChange={(e) => setNewShift({...newShift, shift_end: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={createShift} className="w-full">Schedule Shift</Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={newUser.first_name || ''}
                      onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={newUser.last_name || ''}
                      onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email || ''}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select onValueChange={(value) => setNewUser({...newUser, role: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ambulance_driver">Ambulance Driver</SelectItem>
                        <SelectItem value="hospital_staff">Hospital Staff</SelectItem>
                        <SelectItem value="dispatcher">Dispatcher</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={newUser.phone_number || ''}
                      onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newUser.department || ''}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                  />
                </div>
                <Button onClick={createUser} className="w-full">Create User</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="staff">Hospital Staff</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="dispatcher">Dispatcher</SelectItem>
                <SelectItem value="ambulance_driver">Ambulance Driver</SelectItem>
                <SelectItem value="hospital_staff">Hospital Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>{filteredUsers.length} users found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Users className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.phone_number && (
                          <p className="text-sm text-muted-foreground">{user.phone_number}</p>
                        )}
                        {user.department && (
                          <p className="text-xs text-muted-foreground">Department: {user.department}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                      <Badge variant={user.is_active ? 'default' : 'outline'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateUserStatus(user.id, !user.is_active)}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Shifts</CardTitle>
              <CardDescription>{activeShifts.length} active or scheduled shifts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shifts.map((shift) => {
                  const driver = users.find(user => user.user_id === shift.driver_id);
                  return (
                    <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown Driver'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(shift.shift_start), 'MMM dd, yyyy HH:mm')} - 
                            {format(new Date(shift.shift_end), 'HH:mm')}
                          </p>
                          {shift.ambulance_id && (
                            <p className="text-xs text-muted-foreground">Ambulance: {shift.ambulance_id}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getShiftStatusColor(shift.status)}>
                          {shift.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Staff Management</CardTitle>
              <CardDescription>Staff availability and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hospitalStaff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Shield className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{staff.position}</p>
                        <p className="text-sm text-muted-foreground">Department: {staff.department}</p>
                        <p className="text-sm text-muted-foreground">Hospital: {staff.hospital_id}</p>
                        {staff.certifications.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {staff.certifications.map((cert, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{cert}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getAvailabilityColor(staff.availability_status)}>
                        {staff.availability_status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        Last active: {format(new Date(staff.last_activity), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Access control matrix by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {permissions.reduce((acc, permission) => {
                  if (!acc[permission.role]) {
                    acc[permission.role] = [];
                  }
                  acc[permission.role].push(permission);
                  return acc;
                }, {} as Record<string, Permission[]>).admin && (
                  <div className="space-y-3">
                    {Object.entries(permissions.reduce((acc, permission) => {
                      if (!acc[permission.role]) {
                        acc[permission.role] = [];
                      }
                      acc[permission.role].push(permission);
                      return acc;
                    }, {} as Record<string, Permission[]>)).map(([role, rolePermissions]) => (
                      <div key={role} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium capitalize">{role.replace('_', ' ')}</h4>
                          <Badge variant={getRoleColor(role)}>{role}</Badge>
                        </div>
                        <div className="space-y-2">
                          {rolePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between">
                              <span className="text-sm">{permission.resource}</span>
                              <div className="flex space-x-1">
                                {permission.actions.map((action, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;