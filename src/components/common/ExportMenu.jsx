import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Printer } from 'lucide-react';

export default function ExportMenu({ data, columns, filename }) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const tableHeader = columns.map(c => `<th>${c.header}</th>`).join('');
    const tableBody = data.map(row => `<tr>${columns.map(col => `<td>${row[col.accessorKey] || ''}</td>`).join('')}</tr>`).join('');

    printWindow.document.write(`
      <html>
        <head><title>Print ${filename}</title>
          <style>
            body { font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <table><thead><tr>${tableHeader}</tr></thead><tbody>${tableBody}</tbody></table>
          <script>window.onload = function() { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Print</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}