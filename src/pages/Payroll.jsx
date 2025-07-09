import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function Payroll() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Payroll / Pay Run</h1>
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold">Payroll Management</h3>
          <p className="text-slate-500 mt-2">This feature for managing payroll and pay runs is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}