
import React, { useRef, useState, useEffect } from 'react';
import { Database, Upload, FileText, Trash2, ShieldCheck, AlertCircle, Loader2, Edit3 } from 'lucide-react';
import { Button } from './Button';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
}

interface VaultProps {
  docs: Document[];
  setDocs: React.Dispatch<React.SetStateAction<Document[]>>;
}

export const Vault: React.FC<VaultProps> = ({ docs, setDocs }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem('studysnap_scratchpad') || '';
  });

  useEffect(() => {
    localStorage.setItem('studysnap_scratchpad', scratchpad);
  }, [scratchpad]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setIsUploading(true);
      
      setTimeout(() => {
        const file = files[0];
        const newDoc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.includes('pdf') ? 'PDF' : (file.type.includes('image') ? 'Image' : 'Document'),
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
        };
        
        setDocs(prevDocs => [newDoc, ...prevDocs]);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 800);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 text-left animate-in fade-in duration-500">
      {/* Header Section with Blank Space in Name */}
      <div className="mb-14 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Database className="text-nirma-blue" size={32} />
            Study Vault
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Your private repository for academic intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
           <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleFileUpload}
            accept=".pdf,image/*,.doc,.docx"
          />
          <Button 
            variant="accent" 
            size="lg"
            onClick={triggerUpload} 
            isLoading={isUploading}
            className="shadow-xl shadow-orange-500/20"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {isUploading ? 'Syncing...' : 'Upload New Material'}
          </Button>
        </div>
      </div>

      {/* Increased layout gap for better "blank space" feel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Repository */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 p-5 rounded-2xl flex gap-4">
            <ShieldCheck className="text-nirma-blue w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Contextual Learning Enabled</p>
              <p className="text-xs text-blue-600 dark:text-blue-400/80 leading-relaxed">The AI analyzes these documents to specialize its grading for your specific professors' styles.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isUploading && (
              <div className="bg-white/50 dark:bg-slate-900/50 p-6 rounded-2xl border-2 border-dashed border-nirma-blue animate-pulse flex items-center gap-4">
                <Loader2 className="text-nirma-blue w-6 h-6 animate-spin" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            )}
            
            {docs.map(doc => (
              <div key={doc.id} className="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-nirma-blue/30 transition-all flex items-center gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <FileText className="text-nirma-blue" size={24} />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-gray-800 dark:text-slate-200 truncate">{doc.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">{doc.type} • {doc.size}</p>
                </div>
                <button 
                  onClick={() => setDocs(docs.filter(d => d.id !== doc.id))}
                  className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {docs.length === 0 && !isUploading && (
              <div className="col-span-full py-24 text-center bg-gray-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-800">
                <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <AlertCircle className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">Your vault is empty.</p>
                <p className="text-xs text-gray-400 mt-1">Upload files to provide context for the AI Judge.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: The Academic Scratchpad */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Edit3 className="text-nirma-orange w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-widest">Academic Scratchpad</h2>
            </div>
            
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-4 font-medium uppercase tracking-tighter">A dedicated blank space for quick notes</p>
            
            <textarea
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              placeholder="Start typing your thoughts, exam dates, or formula snippets here..."
              className="w-full h-80 p-4 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-slate-200 rounded-2xl border-none focus:ring-2 focus:ring-nirma-blue/20 outline-none resize-none text-sm leading-relaxed placeholder:text-gray-400 dark:placeholder:text-slate-600 transition-all shadow-inner"
            />
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Auto-saved to Vault</span>
              <button 
                onClick={() => setScratchpad('')}
                className="text-[10px] text-gray-400 hover:text-red-500 font-bold uppercase transition-colors"
              >
                Clear Space
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
