import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, Check, X } from 'lucide-react';
import { format } from 'date-fns';

export default function Billing() {
  const [subscription, setSubscription] = useState({
    plan: 'Professional',
    status: 'active',
    next_billing: '2025-02-01',
    amount: 49.99,
    users: 5,
    max_users: 10
  });

  const [invoices] = useState([
    {
      id: 1,
      date: '2025-01-01',
      amount: 49.99,
      status: 'paid',
      invoice_number: 'INV-2025-001'
    },
    {
      id: 2,
      date: '2024-12-01',
      amount: 49.99,
      status: 'paid',
      invoice_number: 'INV-2024-012'
    },
    {
      id: 3,
      date: '2024-11-01',
      amount: 49.99,
      status: 'paid',
      invoice_number: 'INV-2024-011'
    }
  ]);

  const features = [
    { name: 'Unlimited Invoices', included: true },
    { name: 'Advanced Reports', included: true },
    { name: 'Multi-currency Support', included: true },
    { name: 'API Access', included: true },
    { name: 'Priority Support', included: true },
    { name: 'Custom Integrations', included: false }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Billing & Subscription</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{subscription.plan}</div>
              <div className="text-3xl font-bold text-slate-900">${subscription.amount}</div>
              <div className="text-sm text-slate-500">per month</div>
            </div>
            
            <Badge className={`w-full justify-center ${
              subscription.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {subscription.status.toUpperCase()}
            </Badge>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Users:</span>
                <span>{subscription.users}/{subscription.max_users}</span>
              </div>
              <div className="flex justify-between">
                <span>Next billing:</span>
                <span>{format(new Date(subscription.next_billing), 'MMM d, yyyy')}</span>
              </div>
            </div>
            
            <Button className="w-full" variant="outline">
              <CreditCard className="w-4 h-4 mr-2" />
              Update Payment Method
            </Button>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Plan Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <X className="w-5 h-5 text-slate-400" />
                  )}
                  <span className={feature.included ? 'text-slate-900' : 'text-slate-500'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Usage This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Invoices sent</span>
                <span>247</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bills processed</span>
                <span>156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Contacts managed</span>
                <span>89</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Reports generated</span>
                <span>23</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm text-slate-500">Storage used</div>
              <div className="text-lg font-semibold">2.3 GB of 10 GB</div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{format(new Date(invoice.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>${invoice.amount}</TableCell>
                  <TableCell>
                    <Badge className={invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                      {invoice.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}