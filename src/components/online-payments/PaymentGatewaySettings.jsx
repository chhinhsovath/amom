import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Save } from 'lucide-react';

export default function PaymentGatewaySettings({ onClose, onSave }) {
  const [stripeKey, setStripeKey] = useState('');
  const [paypalKey, setPaypalKey] = useState('');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Gateway Settings
          </DialogTitle>
          <DialogDescription>
            Connect your payment gateways to accept online payments.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-key">Stripe API Key</Label>
            <Input
              id="stripe-key"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="sk_test_..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paypal-key">PayPal API Key</Label>
            <Input
              id="paypal-key"
              value={paypalKey}
              onChange={(e) => setPaypalKey(e.target.value)}
              placeholder="A21AA..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={onSave} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}