import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Calendar, DollarSign, Users } from "lucide-react";
import { format, parseISO, isValid } from 'date-fns';

const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
  return isValid(date) ? format(date, formatStr) : 'N/A';
};

export default function ProjectList({ projects, loading, onEdit, onDelete, onView }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse h-32 bg-slate-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Found</h3>
          <p className="text-slate-500">Create your first project to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                  {project.code && (
                    <Badge variant="secondary" className="text-xs">{project.code}</Badge>
                  )}
                  <Badge className={getStatusColor(project.status)}>
                    {project.status?.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                {project.contact_name && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <Users className="w-4 h-4" />
                    <span>Client: {project.contact_name}</span>
                  </div>
                )}
                {project.description && (
                  <p className="text-slate-600 text-sm mb-3">{project.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Button variant="ghost" size="sm" onClick={() => onView(project)} title="View Details">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onEdit(project)} title="Edit">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(project)} title="Delete">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Start: {safeFormatDate(project.start_date)}</span>
              </div>
              {project.end_date && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>End: {safeFormatDate(project.end_date)}</span>
                </div>
              )}
              {project.budget > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Budget: ${project.budget?.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            {project.manager && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <span className="text-sm text-slate-500">Manager: </span>
                <span className="text-sm font-medium text-slate-700">{project.manager}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}