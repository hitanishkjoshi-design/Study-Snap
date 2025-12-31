
import React, { useState } from 'react';
import { Youtube, FileText, Send, Clock } from 'lucide-react';
import { Button } from './Button';
import { generateVideoNotes } from '../services/geminiService';

export const VideoNotes: React.FC = () => {
  const [url, setUrl] = useState('');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      const generated = await generateVideoNotes(url, topic);
      setNotes(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Youtube className="text-red-500" />
          Video-to-Notes Engine
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Turn any YouTube lecture into structured exam prep notes.</p>
      </div>

      {!notes ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 transition-colors">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">YouTube URL</label>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-nirma-blue focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Lecture Topic (Optional but recommended)</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Data Structures - Linked Lists"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-nirma-blue focus:border-transparent outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>
            <Button variant="accent" fullWidth size="lg" isLoading={loading}>
              <Send className="w-4 h-4" /> Generate Structured Notes
            </Button>
          </form>
          <div className="mt-8 flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-800">
            <Clock className="w-5 h-5 text-nirma-blue" />
            <span>Gemini will "watch" the content and create summaries, key definitions, and exam questions.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FileText className="text-nirma-blue w-6 h-6" />
                <h2 className="text-xl font-bold dark:text-white">Generated Study Notes</h2>
              </div>
              <Button variant="ghost" onClick={() => setNotes(null)}>Clear & New</Button>
            </div>
            <div className="prose prose-blue dark:prose-invert max-w-none text-gray-700 dark:text-slate-300 whitespace-pre-wrap">
              {notes}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
