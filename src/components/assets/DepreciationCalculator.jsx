import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Calculator } from 'lucide-react';

export default function DepreciationCalculator({ onClose }) {
    const [inputs, setInputs] = useState({
        cost: 10000,
        salvage: 1000,
        life: 5,
        method: 'straight_line'
    });
    const [result, setResult] = useState(null);

    const calculate = () => {
        const { cost, salvage, life, method } = inputs;
        const depreciableBase = cost - salvage;
        let annualDepreciation;

        if (method === 'straight_line') {
            annualDepreciation = depreciableBase / life;
        } else { // Double Declining Balance
            annualDepreciation = (cost / life) * 2;
        }
        
        const schedule = [];
        let bookValue = cost;
        for (let year = 1; year <= life; year++) {
            let depExp = annualDepreciation;
            if (method === 'double_declining') {
                depExp = (bookValue / life) * 2;
                if ((bookValue - depExp) < salvage) {
                    depExp = bookValue - salvage;
                }
            }
             if (bookValue < salvage) {
                depExp = 0;
            }
            
            bookValue -= depExp;
            if (bookValue < salvage && method !== 'double_declining') bookValue = salvage;

            schedule.push({
                year,
                depreciation: depExp > 0 ? depExp : 0,
                accumulated: cost - bookValue,
                bookValue: bookValue > 0 ? bookValue : 0
            });
        }
        
        setResult(schedule);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Depreciation Calculator</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4 p-4 border rounded">
                            <h3 className="font-semibold">Inputs</h3>
                            <div><Label>Asset Cost</Label><Input type="number" value={inputs.cost} onChange={e => setInputs({...inputs, cost: Number(e.target.value)})} /></div>
                            <div><Label>Salvage Value</Label><Input type="number" value={inputs.salvage} onChange={e => setInputs({...inputs, salvage: Number(e.target.value)})} /></div>
                            <div><Label>Useful Life (Years)</Label><Input type="number" value={inputs.life} onChange={e => setInputs({...inputs, life: Number(e.target.value)})} /></div>
                            <div><Label>Method</Label><Select value={inputs.method} onValueChange={v => setInputs({...inputs, method: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="straight_line">Straight-Line</SelectItem><SelectItem value="double_declining">Double Declining</SelectItem></SelectContent></Select></div>
                            <Button onClick={calculate} className="w-full"><Calculator className="mr-2 h-4 w-4"/>Calculate</Button>
                        </div>
                        <div className="space-y-4 p-4 border rounded">
                             <h3 className="font-semibold">Results</h3>
                             {result ? (
                                 <div className="text-sm">
                                     <div className="grid grid-cols-4 font-bold"><div className="col-span-1">Year</div><div>Dep.</div><div>Acc. Dep.</div><div>Book Value</div></div>
                                     {result.map(r => (
                                         <div key={r.year} className="grid grid-cols-4 border-t py-1">
                                             <div className="col-span-1">{r.year}</div>
                                             <div>${r.depreciation.toFixed(2)}</div>
                                             <div>${r.accumulated.toFixed(2)}</div>
                                             <div>${r.bookValue.toFixed(2)}</div>
                                         </div>
                                     ))}
                                 </div>
                             ) : <p className="text-slate-500">Enter details and calculate to see the schedule.</p>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}