import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";

export default function StockAdjustmentForm({ items, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    item_id: "",
    adjustment_type: "increase",
    quantity_change: 0,
    reason: "",
    reference: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const adjustmentData = {
      ...formData,
      quantity_change: formData.adjustment_type === 'decrease' 
        ? -Math.abs(formData.quantity_change)
        : Math.abs(formData.quantity_change)
    };
    
    onSave(adjustmentData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedItem = items.find(item => item.id === formData.item_id);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          Stock Adjustment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="item_id">Item *</Label>
              <Select value={formData.item_id} onValueChange={(value) => handleChange('item_id', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Current: {item.quantity_on_hand})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adjustment_type">Adjustment Type *</Label>
              <Select value={formData.adjustment_type} onValueChange={(value) => handleChange('adjustment_type', value)} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase Stock</SelectItem>
                  <SelectItem value="decrease">Decrease Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity_change">Quantity *</Label>
              <Input
                id="quantity_change"
                type="number"
                min="1"
                value={formData.quantity_change}
                onChange={(e) => handleChange('quantity_change', parseInt(e.target.value) || 0)}
                required
                placeholder="Enter quantity"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
                placeholder="e.g., Purchase Order #1234"
              />
            </div>
          </div>

          {selectedItem && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">Adjustment Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Current Stock</div>
                  <div className="font-semibold">{selectedItem.quantity_on_hand}</div>
                </div>
                <div>
                  <div className="text-slate-500">Adjustment</div>
                  <div className={`font-semibold ${formData.adjustment_type === 'increase' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formData.adjustment_type === 'increase' ? '+' : '-'}{Math.abs(formData.quantity_change)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">New Stock Level</div>
                  <div className="font-semibold">
                    {formData.adjustment_type === 'increase' 
                      ? selectedItem.quantity_on_hand + formData.quantity_change
                      : selectedItem.quantity_on_hand - formData.quantity_change
                    }
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              required
              placeholder="Explain the reason for this stock adjustment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <Save className="w-4 h-4 mr-2" />
              Save Adjustment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}