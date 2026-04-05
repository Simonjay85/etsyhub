'use client';
import { useState } from 'react';
import ProductGenerator from '../components/ProductGenerator';
import { AppShell } from '@/components/layout/AppShell';
import { PackageSearch, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Studio() {
  const [activeTab, setActiveTab] = useState<'generator' | 'canvas'>('canvas');

  return (
    <div className="flex flex-col grow min-h-0 h-full p-4">
      {/* Header Area */}
      <div className="mb-4 flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-gradient text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-pink-400 mb-2">
            Etsy Hub Studio
          </h1>
          <p className="text-slate-400 text-sm">
            Everything you need to produce & deploy Etsy listings and assets.
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center bg-slate-900/50 border border-white/5 p-1.5 rounded-2xl shadow-xl backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('canvas')}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'canvas' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'canvas' && (
              <motion.div layoutId="active-tab" className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl shadow-lg border border-white/10" />
            )}
            <span className="relative z-10 flex items-center gap-2"><ImagePlus size={18} /> Visual Canvas</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('generator')}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'generator' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'generator' && (
              <motion.div layoutId="active-tab" className="absolute inset-0 bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl shadow-lg border border-white/10" />
            )}
            <span className="relative z-10 flex items-center gap-2"><PackageSearch size={18} /> Product Factory</span>
          </button>
        </div>

        <button 
          className="btn-primary flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl font-semibold text-white transition-all active:scale-95"
          onClick={() => alert('Publishing will sync with Etsy via OAuth!')}
        >
          Publish Listing
        </button>
      </div>

      {/* Editor Main Area — fills all remaining height */}
      <div className="grow min-h-0 overflow-hidden flex rounded-2xl bg-slate-900/20 backdrop-blur-md border border-white/5 shadow-2xl relative">
        <AnimatePresence mode="wait">
          {activeTab === 'canvas' ? (
            <motion.div 
              key="canvas"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex flex-col"
            >
              <AppShell />
            </motion.div>
          ) : (
            <motion.div 
              key="generator"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <ProductGenerator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
