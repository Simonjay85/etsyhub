'use client';
import { useState } from 'react';
import { Sparkles, Copy, CheckCircle2, Loader2, Tag, FileText, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ListingGenerator() {
  const [keyword, setKeyword] = useState('');
  const [referenceInfo, setReferenceInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{title: string, description: string, hashtags: string} | null>(null);
  
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    
    setIsGenerating(true);
    setGeneratedData(null);
    setCopiedField(null);

    try {
      const res = await fetch('/api/seo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, referenceInfo }),
      });

      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      if (data.ok) {
        setGeneratedData({
          title: data.title,
          description: data.description,
          hashtags: data.hashtags
        });
      } else {
        alert(data.error || 'Failed to generate');
      }
    } catch (err) {
      console.error(err);
      alert('Network or server error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-y-auto custom-scrollbar p-6">
      <div className="max-w-4xl w-full mx-auto space-y-6">
        
        {/* Header section */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/20 to-pink-600/20 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(139,92,246,0.15)]"
          >
            <Sparkles className="text-violet-400" size={28} />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-2">
            AI SEO Generator
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Input a keyword or seed phrase, and we'll engineer a high-converting Title, Description, and Tag set optimized for the Etsy algorithm.
          </p>
        </div>

        {/* Input area */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex flex-col gap-4 backdrop-blur-md shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-1.5 block">Primary Keyword / Product Name</label>
              <input 
                type="text"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all font-medium text-lg"
                placeholder="e.g. Digital Planner Goodnotes, Custom Portrait..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate();
                }}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                Clone / Reference Info (Optional) 
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-normal border border-white/5">Competitor listing, details, features, etc.</span>
              </label>
              <textarea 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 text-white placeholder-slate-500 transition-all font-medium text-sm min-h-[100px] resize-y custom-scrollbar"
                placeholder="Paste information from another website to use as the base content for AI Generation... The AI will extract features and rewrite them into a high-converting Etsy listing."
                value={referenceInfo}
                onChange={(e) => setReferenceInfo(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={!keyword.trim() || isGenerating}
            className="btn-primary flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl font-bold text-white shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Listing
              </>
            )}
          </button>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {generatedData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Title Result */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-slate-800/50 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wide text-sm">
                    <Type size={16} className="text-violet-400" /> ETSY TITLE
                  </div>
                  <button 
                    onClick={() => copyToClipboard(generatedData.title, 'title')}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                  >
                    {copiedField === 'title' ? <><CheckCircle2 size={14} className="text-green-400"/> Copied!</> : <><Copy size={14}/> Copy</>}
                  </button>
                </div>
                <div className="p-5 text-white/90 font-medium text-lg leading-relaxed">
                  {generatedData.title}
                </div>
                <div className="bg-black/20 px-5 py-2 border-t border-white/5 text-xs text-slate-500 flex justify-between">
                  <span>Long-tail Keyword Optimized</span>
                  <span className={generatedData.title.length > 140 ? 'text-red-400' : 'text-emerald-400'}>{generatedData.title.length} / 140 chars</span>
                </div>
              </div>

              {/* Description Result */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-slate-800/50 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wide text-sm">
                    <FileText size={16} className="text-pink-400" /> LISTING DESCRIPTION
                  </div>
                  <button 
                    onClick={() => copyToClipboard(generatedData.description, 'description')}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                  >
                    {copiedField === 'description' ? <><CheckCircle2 size={14} className="text-green-400"/> Copied!</> : <><Copy size={14}/> Copy</>}
                  </button>
                </div>
                <div className="p-5 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                  {generatedData.description}
                </div>
              </div>

              {/* Hashtags Result */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="bg-slate-800/50 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wide text-sm">
                    <Tag size={16} className="text-emerald-400" /> ETSY TAGS (13)
                  </div>
                  <button 
                    onClick={() => copyToClipboard(generatedData.hashtags, 'tags')}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                  >
                    {copiedField === 'tags' ? <><CheckCircle2 size={14} className="text-green-400"/> Copied!</> : <><Copy size={14}/> Copy All</>}
                  </button>
                </div>
                <div className="p-5 text-slate-300 font-medium text-lg leading-relaxed bg-black/20 font-mono">
                  {generatedData.hashtags}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
