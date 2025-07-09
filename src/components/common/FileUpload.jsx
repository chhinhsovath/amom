import React, { useState } from 'react';
import { Upload, Paperclip, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FileUpload({ attachments, onAttachmentsChange }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      // Simulate file upload for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAttachments = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file) // Create temporary URL for preview
      }));
      
      onAttachmentsChange([...attachments, ...newAttachments]);
      event.target.value = '';
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (urlToRemove) => {
    onAttachmentsChange(attachments.filter(url => url !== urlToRemove));
  };

  const getFileNameFromUrl = (url) => {
    try {
      const urlParts = new URL(url).pathname.split('/');
      return urlParts[urlParts.length - 1] || 'Attachment';
    } catch {
      return 'Attachment';
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-slate-600 mb-3">Upload files</p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => document.getElementById('file-upload').click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" />Choose Files</>
          )}
        </Button>
        <p className="text-xs text-slate-400 mt-2">
          PDF, JPG, PNG, DOC, XLS files supported
        </p>
      </div>

      {attachments && attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-700">Attachments:</h4>
          <ul className="space-y-2">
            {attachments.map((url, index) => (
              <li key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-emerald-600 hover:underline truncate"
                  >
                    {getFileNameFromUrl(url)}
                  </a>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(url)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}