import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Mail, Trash2 } from 'lucide-react';
import { User, Role } from '@/api/entities';
import { format } from 'date-fns';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        User.list(),
        Role.list()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      if (rolesData.length > 0) {
        setInviteRole(rolesData[0].id);
      }
    } catch (error) {
      console.error('Error loading user management data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteRole) {
      alert('Please provide an email and a role.');
      return;
    }
    // In a real scenario, this would trigger a backend invitation flow.
    // For now, we'll simulate adding a user.
    console.log(`Inviting ${inviteEmail} with role ID ${inviteRole}`);
    // This is a placeholder. A real implementation would require a backend function
    // to send an invite and create a user record upon acceptance.
    alert('User invitation sent (simulation).');
    setShowInviteForm(false);
    setInviteEmail('');
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await User.update(userId, { role_id: newRoleId });
      loadData();
      alert('User role updated successfully.');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to remove this user? This cannot be undone.')) {
        try {
            await User.delete(userId);
            loadData();
            alert('User removed successfully.');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to remove user.');
        }
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3"><Users className="w-8 h-8"/>User Management</h1>
          <p className="text-slate-500 mt-1">Invite, manage roles, and monitor user activity.</p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Invite User
        </Button>
      </div>

      {showInviteForm && (
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Invite a New User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="name@company.com" 
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="flex-1">
                 <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                 <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger id="role">
                        <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map(role => (
                            <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
              </div>
              <Button onClick={handleInviteUser}>
                <Mail className="w-4 h-4 mr-2" /> Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="h-16 animate-pulse bg-slate-100"></TableCell>
                    <TableCell className="h-16 animate-pulse bg-slate-100"></TableCell>
                    <TableCell className="h-16 animate-pulse bg-slate-100"></TableCell>
                    <TableCell className="h-16 animate-pulse bg-slate-100"></TableCell>
                    <TableCell className="h-16 animate-pulse bg-slate-100"></TableCell>
                  </TableRow>
                ))
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{user.full_name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select value={user.role_id} onValueChange={(newRoleId) => handleRoleChange(user.id, newRoleId)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                           {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{format(new Date(user.created_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(user.updated_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteUser(user.id)}>
                         <Trash2 className="w-4 h-4"/>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}