import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuditLog } from '@/api/entities';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ user: '', entity: '', action: '' });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const logsData = await AuditLog.list('-timestamp', 100);
    setLogs(logsData);
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => 
    (filters.user ? log.user_id?.includes(filters.user) : true) &&
    (filters.entity ? log.entity_type === filters.entity : true) &&
    (filters.action ? log.action === filters.action : true)
  );
  
  const actionColors = {
      create: "bg-emerald-100 text-emerald-800",
      update: "bg-blue-100 text-blue-800",
      delete: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <p className="text-slate-500">Track all changes and activities within the application.</p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input placeholder="Filter by User Email..." value={filters.user} onChange={e => setFilters({...filters, user: e.target.value})} />
            <Select value={filters.entity} onValueChange={val => setFilters({...filters, entity: val})}>
                <SelectTrigger><SelectValue placeholder="Filter by Entity" /></SelectTrigger>
                <SelectContent><SelectItem value={null}>All Entities</SelectItem><SelectItem value="Invoice">Invoice</SelectItem><SelectItem value="Bill">Bill</SelectItem></SelectContent>
            </Select>
            <Select value={filters.action} onValueChange={val => setFilters({...filters, action: val})}>
                <SelectTrigger><SelectValue placeholder="Filter by Action" /></SelectTrigger>
                <SelectContent><SelectItem value={null}>All Actions</SelectItem><SelectItem value="create">Create</SelectItem><SelectItem value="update">Update</SelectItem><SelectItem value="delete">Delete</SelectItem></SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Entity ID</TableHead><TableHead>Changes</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? [...Array(5)].map((_, i) => <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8" /></TableCell></TableRow>)
              : filteredLogs.map(log => (
                <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.timestamp), "PPpp")}</TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell><Badge className={actionColors[log.action]}>{log.action}</Badge></TableCell>
                    <TableCell>{log.entity_type}</TableCell>
                    <TableCell className="font-mono text-xs">{log.entity_id}</TableCell>
                    <TableCell><pre className="text-xs bg-slate-100 p-2 rounded-md max-w-xs overflow-auto">{JSON.stringify(log.changes, null, 2)}</pre></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}