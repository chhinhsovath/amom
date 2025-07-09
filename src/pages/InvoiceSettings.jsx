import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InvoiceTemplate } from '@/api/entities';
import InvoiceTemplateList from '../components/settings/InvoiceTemplateList';
import InvoiceTemplateForm from '../components/settings/InvoiceTemplateForm';

export default function InvoiceSettings() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await InvoiceTemplate.list();
      setTemplates(data);
    } catch (error) {
      console.error("Error loading invoice templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (templateData) => {
    try {
      if (editingTemplate) {
        await InvoiceTemplate.update(editingTemplate.id, templateData);
      } else {
        await InvoiceTemplate.create(templateData);
      }
      await loadTemplates();
      setShowForm(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await InvoiceTemplate.delete(templateId);
        await loadTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };
  
  const handleSetDefault = async (templateId) => {
     try {
       // First, unset any other default
       const currentDefault = templates.find(t => t.is_default);
       if (currentDefault) {
         await InvoiceTemplate.update(currentDefault.id, { is_default: false });
       }
       // Then, set the new default
       await InvoiceTemplate.update(templateId, { is_default: true });
       await loadTemplates();
     } catch(e) {
        console.error("Failed to set default template", e);
     }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Invoice Settings</h1>
        <p className="text-slate-500 mt-1">Customize invoices to suit your organization and match your brand.</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Create invoice templates</h3>
              <p className="text-slate-600">Add your logo and select which financial information to show.</p>
            </div>
            <Button onClick={() => { setEditingTemplate(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Branding Theme
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {showForm && (
        <InvoiceTemplateForm
          template={editingTemplate}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingTemplate(null); }}
        />
      )}

      <InvoiceTemplateList
        templates={templates}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSetDefault={handleSetDefault}
      />
    </div>
  );
}