import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { User } from "@/api/entities";

export default function TimeEntryForm({ projects, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    project_id: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: 0,
    description: "",
    billable: true,
    hourly_rate: 0,
    organization_id: "default_org"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await User.me();
      const saveData = {
        ...formData,
        user_id: user.id,
        hours: parseFloat(formData.hours) || 0,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        total_cost: (parseFloat(formData.hours) || 0) * (parseFloat(formData.hourly_rate) || 0)
      };
      onSave(saveData);
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Log Time Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="project">Project *</Label>
              <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} {project.code && `(${project.code})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                min="0"
                value={formData.hours}
                onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                required
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What work was done..."
              rows={3}
              required
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="billable" 
              checked={formData.billable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, billable: checked }))}
            />
            <Label htmlFor="billable">Billable hours</Label>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />Log Time
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}