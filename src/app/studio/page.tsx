'use client';
import ProductGenerator from '../components/ProductGenerator';

export default function Studio() {
  return (
    <div className="flex flex-col grow min-h-0 h-full p-4">
      {/* Header Area */}
      <div className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-gradient text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400 mb-2">
            Etsy Hub Studio
          </h1>
          <p className="text-slate-400 text-sm">
            Create digital planners, CV templates, and spreadsheet products ready for Etsy.
          </p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-90 rounded-xl font-semibold text-white shadow-lg shadow-violet-500/20 transition-all active:scale-95"
          onClick={() => alert('Publishing will sync with Etsy via OAuth!')}
        >
          Publish to Etsy
        </button>
      </div>

      {/* Editor area — fills all remaining height */}
      <div className="grow min-h-0 overflow-hidden flex rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <ProductGenerator />
      </div>
    </div>
  );
}
