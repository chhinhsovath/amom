import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Mail, Phone, Users } from "lucide-react";

export default function ContactList({ contacts, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-slate-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12 text-center">
          <div className="text-slate-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Contacts Found</h3>
          <p className="text-slate-500">Add your first contact to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <Card key={contact.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-semibold text-lg text-slate-900">
                    {contact.name || 'N/A'}
                  </h3>
                  <Badge className={`${
                    contact.type === 'customer' ? 'bg-blue-100 text-blue-800' :
                    contact.type === 'supplier' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {(contact.type || 'customer').toUpperCase()}
                  </Badge>
                  {!contact.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{contact.email || 'No email'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{contact.phone || 'No phone'}</span>
                  </div>
                  <div>
                    <div className="text-slate-500">Payment Terms</div>
                    <div className="font-medium">
                      {(contact.payment_terms || 'net_30').replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Credit Limit</div>
                    <div className="font-medium">${(contact.credit_limit || 0).toFixed(2)}</div>
                  </div>
                </div>
                {contact.address && (
                  <div className="mt-2 text-sm text-slate-500">
                    <span className="font-medium">Address:</span> {contact.address}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(contact)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(contact)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}