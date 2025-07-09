
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
// Note: File upload and data extraction features will be implemented later
// import { BankTransaction } from '@/api/entities';

const transactionSchema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            date: { type: "string", format: "date" },
            description: { type: "string" },
            amount: { type: "number" },
            type: { type: "string", enum: ["debit", "credit"] }
        },
        required: ["date", "description", "amount"]
    }
};

export default function BankStatementImport({ bankAccount, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
        const { file_url } = await UploadFile({ file });
        const { output } = await ExtractDataFromUploadedFile({ file_url, json_schema: transactionSchema });
        
        if (output && Array.isArray(output)) {
            const newTransactions = output.map(t => ({
                ...t,
                bank_account_id: bankAccount.id,
                organization_id: 'default_org',
                type: t.amount > 0 ? 'receive' : 'spend',
                amount: Math.abs(t.amount),
                is_reconciled: false
            }));
            await BankTransaction.bulkCreate(newTransactions);
            onImportSuccess();
        }
    } catch (error) {
        console.error("Error importing statement:", error);
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-lg">
            <CardHeader><CardTitle>Import Bank Statement for {bankAccount.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div 
                    className="border-2 border-dashed p-10 text-center cursor-pointer hover:border-emerald-500 transition-colors rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden"
                        accept="text/csv"
                    />
                    <Upload className="mx-auto h-10 w-10 text-slate-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-600">
                        {file ? `Selected: ${file.name}` : "Click to select a CSV file"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        Drag and drop is not supported, please click to select.
                    </p>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}><X className="mr-2 h-4 w-4" />Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Import and Process
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
