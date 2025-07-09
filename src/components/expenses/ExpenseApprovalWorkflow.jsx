import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, Check, XCircle, Clock, Receipt } from "lucide-react";
import { format } from "date-fns";

export default function ExpenseApprovalWorkflow({ expenses, onClose, onApprove }) {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comments, setComments] = useState("");

  const handleApproval = async (expenseId, action) => {
    try {
      // Here you would call the Approval entity and update expense status
      console.log(`${action} expense ${expenseId} with comments: ${comments}`);
      onApprove();
      setSelectedExpense(null);
      setComments("");
    } catch (error) {
      console.error('Error processing approval:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto border-0 shadow-xl">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Expense Approval Workflow
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expenses List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-slate-900">
                Pending Approvals ({expenses.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedExpense?.id === expense.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedExpense(expense)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{expense.description}</div>
                        <div className="text-sm text-slate-500">
                          {expense.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-slate-400">
                          {format(new Date(expense.expense_date || expense.created_date), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">${expense.amount?.toFixed(2)}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                          {expense.receipt_url && (
                            <Receipt className="w-4 h-4 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Panel */}
            <div className="space-y-6">
              {selectedExpense ? (
                <>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-4">
                      Review Expense
                    </h3>
                    
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-slate-500">Description</div>
                          <div className="font-medium">{selectedExpense.description}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Amount</div>
                          <div className="font-medium">${selectedExpense.amount?.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Date</div>
                          <div className="font-medium">
                            {format(new Date(selectedExpense.expense_date || selectedExpense.created_date), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Category</div>
                          <div className="font-medium">
                            {selectedExpense.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                        </div>
                      </div>
                      
                      {selectedExpense.notes && (
                        <div>
                          <div className="text-sm text-slate-500">Notes</div>
                          <div className="text-slate-700">{selectedExpense.notes}</div>
                        </div>
                      )}

                      {selectedExpense.receipt_url && (
                        <div>
                          <div className="text-sm text-slate-500">Receipt</div>
                          <Button variant="outline" size="sm">
                            <Receipt className="w-4 h-4 mr-2" />
                            View Receipt
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Approval Comments
                    </label>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Add comments for this approval decision..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApproval(selectedExpense.id, 'approve')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleApproval(selectedExpense.id, 'reject')}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50 flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Select an expense from the list to review and approve</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}