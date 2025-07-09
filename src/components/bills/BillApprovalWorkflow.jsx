import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, X } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";

// Helper function to safely format dates
const safeFormatDate = (dateString, formatStr = "MMM d, yyyy") => {
  if (!dateString) return 'N/A';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isValid(date)) {
      return format(date, formatStr);
    }
    return 'N/A';
  } catch (error) {
    console.warn('Invalid date:', dateString);
    return 'N/A';
  }
};

export default function BillApprovalWorkflow({ bills, onClose, onApprove }) {
  const [selectedBill, setSelectedBill] = useState(null);
  const [comments, setComments] = useState("");

  const handleApprove = async (bill, approved) => {
    try {
      // Here you would typically call an API to update the bill status
      // For now, we'll just trigger the onApprove callback
      await onApprove();
      setSelectedBill(null);
      setComments("");
    } catch (error) {
      console.error('Error approving bill:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Bill Approval Workflow
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {bills.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Bills Pending Approval</h3>
              <p className="text-slate-500">All bills have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <Card key={bill.id} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">
                            {bill.bill_number}
                          </h3>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Pending Approval
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-slate-500">Supplier</div>
                            <div className="font-medium">{bill.contact_name}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Amount</div>
                            <div className="font-semibold text-slate-900">${(bill.total_amount || 0).toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Date</div>
                            <div className="font-medium">{safeFormatDate(bill.issue_date)}</div>
                          </div>
                          <div>
                            <div className="text-slate-500">Due Date</div>
                            <div className="font-medium">{safeFormatDate(bill.due_date)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {selectedBill && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl border-0 shadow-xl">
                <CardHeader className="border-b border-slate-200">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Review Bill: {selectedBill.bill_number}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-500 text-sm">Supplier</div>
                      <div className="font-medium">{selectedBill.contact_name}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Amount</div>
                      <div className="font-semibold text-xl">${(selectedBill.total_amount || 0).toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Issue Date</div>
                      <div className="font-medium">{safeFormatDate(selectedBill.issue_date)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Due Date</div>
                      <div className="font-medium">{safeFormatDate(selectedBill.due_date)}</div>
                    </div>
                  </div>

                  {selectedBill.notes && (
                    <div>
                      <div className="text-slate-500 text-sm mb-1">Notes</div>
                      <div className="bg-slate-50 p-3 rounded-lg">{selectedBill.notes}</div>
                    </div>
                  )}

                  <div>
                    <label className="text-slate-500 text-sm mb-1 block">Approval Comments</label>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add comments about this approval..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedBill(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleApprove(selectedBill, false)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedBill, true)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}