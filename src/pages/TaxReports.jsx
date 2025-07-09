import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Calendar, Download, AlertCircle } from "lucide-react";
import { TaxReport, Tax } from "@/api/entities";
import { format, startOfQuarter, endOfQuarter, startOfMonth, endOfMonth } from "date-fns";

import TaxReportForm from "../components/tax/TaxReportForm";
import TaxReportList from "../components/tax/TaxReportList";
import TaxSettings from "../components/tax/TaxSettings";

export default function TaxReports() {
  const [taxReports, setTaxReports] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("current_quarter");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, taxesData] = await Promise.all([
        TaxReport.list('-created_date'),
        Tax.list('name')
      ]);
      setTaxReports(reportsData);
      setTaxes(taxesData);
    } catch (error) {
      console.error('Error loading tax data:', error);
      setTaxReports([]);
      setTaxes([]);
    }
    setLoading(false);
  };

  const handleSaveReport = async (reportData) => {
    try {
      if (editingReport) {
        await TaxReport.update(editingReport.id, reportData);
      } else {
        await TaxReport.create(reportData);
      }
      setShowForm(false);
      setEditingReport(null);
      loadData();
    } catch (error) { console.error('Error saving tax report:', error); }
  };

  const getPeriodDates = () => {
    const now = new Date();
    switch(selectedPeriod) {
      case "current_quarter":
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case "current_month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfQuarter(now), end: endOfQuarter(now) };
    }
  };

  const generateQuickReport = async (reportType) => {
    const { start, end } = getPeriodDates();
    const reportData = {
      report_name: `${reportType.toUpperCase()} - ${format(start, 'MMM yyyy')}`,
      report_type: reportType,
      period_start: format(start, 'yyyy-MM-dd'),
      period_end: format(end, 'yyyy-MM-dd'),
      status: 'draft',
      organization_id: 'default_org'
    };
    
    try {
      await TaxReport.create(reportData);
      loadData();
    } catch (error) {
      console.error('Error generating quick report:', error);
    }
  };

  const stats = {
    total: taxReports.length,
    draft: taxReports.filter(r => r.status === 'draft').length,
    filed: taxReports.filter(r => r.status === 'filed').length,
    overdue: taxReports.filter(r => {
      const dueDate = new Date(r.due_date);
      return r.status === 'draft' && dueDate < new Date();
    }).length
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tax Reports</h1>
          <p className="text-slate-500 mt-1">Manage tax compliance and reporting</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowSettings(true)} variant="outline">
            Tax Settings
          </Button>
          <Button onClick={() => { setEditingReport(null); setShowForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" />New Tax Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Reports</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
            <div className="text-sm text-slate-500">Draft</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.filed}</div>
            <div className="text-sm text-slate-500">Filed</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-slate-500">Overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Quick Tax Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_quarter">Current Quarter</SelectItem>
                <SelectItem value="current_month">Current Month</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={() => generateQuickReport('gst')} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />GST Return
              </Button>
              <Button onClick={() => generateQuickReport('bas')} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />BAS Report
              </Button>
              <Button onClick={() => generateQuickReport('vat')} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />VAT Return
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms and Modals */}
      {showForm && (
        <TaxReportForm
          report={editingReport}
          taxes={taxes}
          onSave={handleSaveReport}
          onCancel={() => { setShowForm(false); setEditingReport(null); }}
        />
      )}

      {showSettings && (
        <TaxSettings
          taxes={taxes}
          onClose={() => setShowSettings(false)}
          onUpdate={loadData}
        />
      )}

      {/* Tax Reports List */}
      <TaxReportList
        reports={taxReports}
        loading={loading}
        onEdit={(report) => { setEditingReport(report); setShowForm(true); }}
      />
    </div>
  );
}