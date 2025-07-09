import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Folder, Clock, DollarSign, Users } from "lucide-react";
import { Project, Contact, TimeEntry } from "@/api/entities";

import ProjectForm from "../components/projects/ProjectForm";
import ProjectList from "../components/projects/ProjectList";
import ProjectDetails from "../components/projects/ProjectDetails";
import TimeEntryForm from "../components/projects/TimeEntryForm";
import ConfirmationDialog from "../components/common/ConfirmationDialog";
import ExportMenu from "../components/common/ExportMenu";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProjectForDelete, setSelectedProjectForDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsData, contactsData, timeEntriesData] = await Promise.all([
        Project.list('-created_date'),
        Contact.list('-created_date'),
        TimeEntry.list('-date')
      ]);
      setProjects(projectsData);
      setContacts(contactsData);
      setTimeEntries(timeEntriesData);
    } catch (error) { 
      console.error('Error loading projects:', error);
      setProjects([]);
      setContacts([]);
      setTimeEntries([]);
    }
    setLoading(false);
  };

  const handleSaveProject = async (projectData) => {
    try {
      if (editingProject) {
        await Project.update(editingProject.id, projectData);
      } else {
        await Project.create(projectData);
      }
      setShowForm(false);
      setEditingProject(null);
      loadData();
    } catch (error) { console.error('Error saving project:', error); }
  };

  const handleSaveTimeEntry = async (timeEntryData) => {
    try {
      await TimeEntry.create(timeEntryData);
      setShowTimeForm(false);
      loadData();
    } catch (error) { console.error('Error saving time entry:', error); }
  };

  const handleDeleteRequest = (project) => {
    setSelectedProjectForDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProjectForDelete) return;
    try {
      await Project.delete(selectedProjectForDelete.id);
      loadData();
    } catch (error) { console.error("Error deleting project:", error); }
    finally {
      setDeleteDialogOpen(false);
      setSelectedProjectForDelete(null);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = (project.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.revenue || 0), 0),
    totalHours: timeEntries.reduce((sum, te) => sum + (te.hours || 0), 0)
  };

  const projectColumns = [
    { header: 'Project Name', accessorKey: 'name' },
    { header: 'Code', accessorKey: 'code' },
    { header: 'Client', accessorKey: 'contact_name' },
    { header: 'Status', accessorKey: 'status' },
    { header: 'Budget', accessorKey: 'budget' },
    { header: 'Revenue', accessorKey: 'revenue' }
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Track project progress, time, and profitability</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowTimeForm(true)} variant="outline">
            <Clock className="w-4 h-4 mr-2" />Log Time
          </Button>
          <ExportMenu data={filteredProjects} columns={projectColumns} filename="projects" />
          <Button onClick={() => { setEditingProject(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" />New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-slate-900">{stats.total}</div><div className="text-sm text-slate-500">Total Projects</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-emerald-600">{stats.active}</div><div className="text-sm text-slate-500">Active</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-blue-600">{stats.completed}</div><div className="text-sm text-slate-500">Completed</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toFixed(2)}</div><div className="text-sm text-slate-500">Total Revenue</div></CardContent></Card>
        <Card className="border-0 shadow-md"><CardContent className="p-4"><div className="text-2xl font-bold text-orange-600">{stats.totalHours.toFixed(1)}h</div><div className="text-sm text-slate-500">Total Hours</div></CardContent></Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {showForm && (
        <ProjectForm
          project={editingProject}
          contacts={contacts}
          onSave={handleSaveProject}
          onCancel={() => { setShowForm(false); setEditingProject(null); }}
        />
      )}

      {showTimeForm && (
        <TimeEntryForm
          projects={projects}
          onSave={handleSaveTimeEntry}
          onCancel={() => setShowTimeForm(false)}
        />
      )}

      {showDetails && selectedProject && (
        <ProjectDetails
          project={selectedProject}
          timeEntries={timeEntries.filter(te => te.project_id === selectedProject.id)}
          onClose={() => { setShowDetails(false); setSelectedProject(null); }}
        />
      )}

      <ConfirmationDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Project" 
        description={`This will permanently delete project "${selectedProjectForDelete?.name}". This action cannot be undone.`} 
      />

      <ProjectList
        projects={filteredProjects}
        loading={loading}
        onEdit={(project) => { setEditingProject(project); setShowForm(true); }}
        onDelete={handleDeleteRequest}
        onView={(project) => { setSelectedProject(project); setShowDetails(true); }}
      />
    </div>
  );
}