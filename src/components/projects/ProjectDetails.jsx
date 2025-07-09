import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Clock, X } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  return isValid(date) ? format(date, formatStr) : 'N/A';
};

export default function ProjectDetails({ project, timeEntries, onClose }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
  const totalCost = timeEntries.reduce((sum, entry) => sum + (entry.total_cost || 0), 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              {project.name}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                {project.code && (
                  <Badge variant="secondary">{project.code}</Badge>
                )}
                <Badge className={getStatusColor(project.status)}>
                  {project.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              {project.description && (
                <p className="text-slate-600">{project.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.contact_name && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" />
                    <span className="font-medium">Client:</span>
                    <span>{project.contact_name}</span>
                  </div>
                )}
                
                {project.manager && (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-500" />
                    <span className="font-medium">Manager:</span>
                    <span>{project.manager}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <span className="font-medium">Start Date:</span>
                  <span>{safeFormatDate(project.start_date)}</span>
                </div>
                
                {project.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-500" />
                    <span className="font-medium">End Date:</span>
                    <span>{safeFormatDate(project.end_date)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <div>
                    <div className="text-sm text-slate-500">Budget</div>
                    <div className="text-lg font-semibold">${project.budget?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-slate-500">Revenue</div>
                    <div className="text-lg font-semibold">${project.revenue?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  <div>
                    <div className="text-sm text-slate-500">Total Hours</div>
                    <div className="text-lg font-semibold">{totalHours.toFixed(1)}h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-sm text-slate-500">Total Cost</div>
                    <div className="text-lg font-semibold">${totalCost.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Entries */}
          {timeEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Time Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeEntries.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">{entry.description}</div>
                        <div className="text-sm text-slate-500">
                          {safeFormatDate(entry.date)} • {entry.hours}h
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${entry.total_cost?.toFixed(2) || '0.00'}</div>
                        {entry.is_invoiced && (
                          <Badge variant="secondary" className="text-xs">Invoiced</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}