import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Trash2, Archive, MoreHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const typeColors = {
  asset: "bg-emerald-100 text-emerald-800",
  liability: "bg-red-100 text-red-800",
  equity: "bg-blue-100 text-blue-800",
  revenue: "bg-purple-100 text-purple-800",
  expense: "bg-orange-100 text-orange-800",
};

export default function ChartOfAccountsView({ 
  accounts, 
  loading, 
  selectedAccounts,
  onEdit, 
  onDelete, 
  onArchive,
  onSelectAccount,
  onSelectAll 
}) {
  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <Skeleton className="h-60 w-full" />
        </CardContent>
      </Card>
    );
  }

  const renderAccountRows = (parentId = null, level = 0) => {
    return accounts
      .filter(a => a.parent_account_id === parentId)
      .sort((a, b) => a.code.localeCompare(b.code))
      .flatMap(account => [
        <TableRow key={account.id} className="hover:bg-slate-50">
          <TableCell className="w-12">
            <Checkbox 
              checked={selectedAccounts.has(account.id)}
              onCheckedChange={(checked) => onSelectAccount(account.id, checked)}
            />
          </TableCell>
          <TableCell 
            style={{ paddingLeft: `${1 + level * 1.5}rem` }} 
            className="font-medium"
          >
            {account.code}
          </TableCell>
          <TableCell className="font-medium">{account.name}</TableCell>
          <TableCell>
            <Badge className={typeColors[account.type] || ''}>
              {account.type}
            </Badge>
          </TableCell>
          <TableCell className="text-right font-mono">
            ${(account.balance || 0).toFixed(2)}
          </TableCell>
          <TableCell>
            <Badge variant={account.is_active ? 'default' : 'secondary'}>
              {account.is_active ? 'Active' : 'Archived'}
            </Badge>
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(account)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(account)}>
                  <Archive className="w-4 h-4 mr-2" />
                  {account.is_active ? 'Archive' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(account)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>,
        ...renderAccountRows(account.id, level + 1),
      ]);
  };

  const allAccountIds = accounts.map(a => a.id);
  const allSelected = allAccountIds.length > 0 && allAccountIds.every(id => selectedAccounts.has(id));
  const someSelected = allAccountIds.some(id => selectedAccounts.has(id));

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-slate-900">
          Chart of Accounts ({accounts.length} accounts)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={allSelected}
                    ref={input => {
                      if (input) input.indeterminate = someSelected && !allSelected;
                    }}
                    onCheckedChange={(checked) => onSelectAll(checked)}
                  />
                </TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    No accounts found. Create your first account to get started.
                  </TableCell>
                </TableRow>
              ) : (
                renderAccountRows()
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}