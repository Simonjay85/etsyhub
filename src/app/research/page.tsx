"use client"

import { useState } from 'react'
import { 
  Search, Filter, ChevronDown, ChevronRight, HelpCircle, 
  Download, Copy, Star, BookmarkPlus, Plus
} from 'lucide-react'

// --- Mock Data Types ---
interface Metric {
  total: string;
  totalColor: string;
  mon: string;
  monColor: string;
  trend: number[];
}

interface KeywordData {
  id: string;
  keyword: string;
  competition: string;
  compColor: string;
  compTrend: number[];
  views: Metric;
  favorites: Metric;
  sales: Metric;
  reviews: Metric;
  score: number;
  isLongTail: boolean;
}

// Sparkline helper
function generateTrend() {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 100));
}

const mockKeywords: KeywordData[] = [
  {
    id: "k1",
    keyword: "planner a4 planner",
    competition: "103.7K",
    compColor: "bg-red-500",
    compTrend: [20, 25, 22, 50, 95, 95], // sudden jump
    views: { total: "35.9M", totalColor: "bg-orange-500", mon: "11.1M", monColor: "bg-amber-500", trend: [10, 15, 20, 40, 80, 85] },
    favorites: { total: "900.0K", totalColor: "bg-orange-500", mon: "6.0K", monColor: "bg-zinc-500", trend: [5, 5, 8, 12, 30, 85] },
    sales: { total: "720.1K", totalColor: "bg-orange-500", mon: "14.5K", monColor: "bg-orange-500", trend: [40, 45, 50, 48, 85, 90] },
    reviews: { total: "89.1K", totalColor: "bg-emerald-500", mon: "293", monColor: "bg-zinc-500", trend: [60, 65, 70, 75, 85, 90] },
    score: 3.46,
    isLongTail: true
  },
  {
    id: "k2",
    keyword: "budget planner insert",
    competition: "45.2K",
    compColor: "bg-amber-500",
    compTrend: [40, 42, 45, 50, 48, 45],
    views: { total: "12.4M", totalColor: "bg-orange-500", mon: "2.1M", monColor: "bg-amber-500", trend: [20, 30, 40, 55, 70, 75] },
    favorites: { total: "420.5K", totalColor: "bg-orange-500", mon: "2.8K", monColor: "bg-zinc-500", trend: [10, 15, 20, 30, 45, 50] },
    sales: { total: "150.2K", totalColor: "bg-orange-500", mon: "4.2K", monColor: "bg-orange-500", trend: [15, 20, 25, 30, 45, 60] },
    reviews: { total: "12.3K", totalColor: "bg-emerald-500", mon: "85", monColor: "bg-zinc-500", trend: [30, 35, 40, 45, 50, 55] },
    score: 4.12,
    isLongTail: true
  },
  {
    id: "k3",
    keyword: "digital weekly planner",
    competition: "250.8K",
    compColor: "bg-red-600",
    compTrend: [80, 85, 90, 85, 95, 100],
    views: { total: "85.2M", totalColor: "bg-red-500", mon: "15.4M", monColor: "bg-orange-500", trend: [60, 70, 80, 85, 90, 95] },
    favorites: { total: "2.1M", totalColor: "bg-red-500", mon: "15.2K", monColor: "bg-emerald-500", trend: [40, 45, 50, 60, 70, 75] },
    sales: { total: "1.2M", totalColor: "bg-red-500", mon: "35.1K", monColor: "bg-orange-500", trend: [50, 55, 60, 65, 75, 80] },
    reviews: { total: "450.6K", totalColor: "bg-emerald-500", mon: "1.2K", monColor: "bg-zinc-500", trend: [75, 80, 85, 90, 95, 100] },
    score: 2.85,
    isLongTail: false
  }
];

export default function KeywordDatabase() {
  const [query, setQuery] = useState('expend planner')
  const [excludeKeyword, setExcludeKeyword] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(["k1"]))
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordData[]>(mockKeywords);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    
    setTimeout(() => {
      const q = query.toLowerCase().trim();
      const ex = excludeKeyword.toLowerCase().trim();
      
      let results = [...mockKeywords];
      if (q) results = results.filter(k => k.keyword.toLowerCase().includes(q));
      if (ex) results = results.filter(k => !k.keyword.toLowerCase().includes(ex));
      
      setFilteredKeywords(results);
      setIsSearching(false);
    }, 500);
  }

  const toggleRow = (id: string) => {
    const newExt = new Set(expandedRows);
    if (newExt.has(id)) newExt.delete(id);
    else newExt.add(id);
    setExpandedRows(newExt);
  }

  // Very simple SVG Sparkline
  const Sparkline = ({ data, label }: { data: number[], label: string }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 120;
    const height = 40;
    
    // Convert data to points
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    }).join(' L ');

    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full border border-blue-500 bg-transparent"></div>
          <span className="text-[10px] text-slate-300 font-medium">{label}</span>
        </div>
        <svg width={width} height={height} className="overflow-visible">
          {/* Fill under area matching EHunt */}
          <path 
            d={`M 0,${height} L ${points} L ${width},${height} Z`} 
            fill="rgba(59, 130, 246, 0.1)" 
          />
          {/* Line */}
          <path 
            d={`M ${points}`} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2" 
          />
          {/* Dots */}
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return <circle key={i} cx={x} cy={y} r="3" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-6 pb-24 text-sm max-w-[1600px] mx-auto">
      
      {/* Top Notification */}
      <div className="flex justify-center mb-6">
        <p className="text-slate-400 text-xs">
          Remaining keyword database searches for today: <strong className="text-white">4</strong>. <a href="#" className="text-blue-400 hover:underline">Upgrade to enjoy more searches</a>
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl p-5 mb-6 shadow-2xl">
        <div className="flex items-center gap-4 mb-5">
          {/* Search Input */}
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative flex items-center">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 text-white pl-4 pr-10 py-2 rounded-l-lg outline-none focus:border-orange-500 transition-colors placeholder:text-slate-500"
              placeholder="Enter keyword..."
            />
            {query && (
              <button 
                type="button"
                onClick={() => { setQuery(''); setFilteredKeywords(mockKeywords); }}
                className="absolute right-2 text-slate-500 hover:text-white"
              >✕</button>
            )}
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute -right-4 bg-[#f97316] hover:bg-[#ea580c] text-white px-6 py-2 rounded-r-lg font-medium transition-colors z-10 shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </form>
          
          <div className="flex items-center gap-2 ml-4">
            <Filter size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Exclude"
              value={excludeKeyword}
              onChange={(e) => setExcludeKeyword(e.target.value)}
              className="bg-transparent border-b border-white/10 text-white w-32 py-1 outline-none focus:border-slate-400 placeholder:text-slate-500"
            />
          </div>

          <div className="flex-1"></div>
          
          <button className="bg-[#f97316] text-white px-4 py-2 rounded-md font-medium text-sm shadow-lg shadow-orange-500/20">
            Batch Keyword Analysis
          </button>
          <button className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 hover:bg-orange-500/10">
            <HelpCircle size={16} /> Tutorial
          </button>
        </div>

        {/* Selected Tags */}
        <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4">
          <span className="text-slate-400">Selected :</span>
          <div className="flex items-center gap-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full text-xs border border-white/5">
            Search Keyword:{query} <button className="hover:text-white ml-1">✕</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="text-slate-400 w-20">Basic :</span>
            {['Competition', 'Views', 'Favorites', 'Sales', 'Reviews'].map(filter => (
              <button key={filter} className="flex items-center justify-between bg-slate-800/80 border border-white/5 w-32 px-3 py-1.5 rounded text-left text-slate-300 hover:border-white/20 transition-colors">
                {filter} <ChevronDown size={14} className="text-slate-500" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 w-20">Advanced :</span>
            <button className="flex items-center justify-between bg-slate-800/80 border border-white/5 w-32 px-3 py-1.5 rounded text-left text-slate-300 hover:border-white/20 transition-colors">
              Long Tail <ChevronDown size={14} className="text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Datatable Section */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="text-slate-400 text-sm">
            Find <span className="text-white font-semibold">43,592</span> keywords, show you the first 200
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button className="px-3 py-1.5 border border-white/10 rounded text-slate-300 hover:bg-white/5">Batch Keyword Analysis</button>
            <button className="px-3 py-1.5 border border-white/10 rounded text-slate-300 hover:bg-white/5 flex items-center gap-1"><Plus size={14}/> Add to my favorites</button>
            <button className="px-3 py-1.5 border border-white/10 rounded text-slate-300 hover:bg-white/5 flex items-center gap-1"><Plus size={14}/> Add to tracking</button>
            <button className="px-3 py-1.5 border border-white/10 rounded text-slate-300 hover:bg-white/5 flex items-center gap-1"><Download size={14}/> Export to CSV</button>
            <button className="px-3 py-1.5 border border-white/10 rounded text-slate-300 hover:bg-white/5 flex items-center gap-1"><Copy size={14}/> Copy</button>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[30px_30px_1fr_120px_160px_160px_160px_160px_80px_80px] text-xs font-semibold text-slate-300 border-b border-white/10 text-center py-3 bg-slate-800/30 px-4">
          <div></div>
          <div><input type="checkbox" className="accent-orange-500 cursor-pointer" /></div>
          <div className="text-left font-bold text-white px-2">Keywords</div>
          <div className="flex items-center justify-center gap-1">Competition <HelpCircle size={12} className="text-slate-500"/></div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-1 mb-1">Views <HelpCircle size={12} className="text-slate-500"/></div>
            <div className="grid grid-cols-2 text-[10px] text-slate-500 font-medium"><span>Total</span><span>Mon</span></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-1 mb-1">Favorites <HelpCircle size={12} className="text-slate-500"/></div>
            <div className="grid grid-cols-2 text-[10px] text-slate-500 font-medium"><span>Total</span><span>Mon</span></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-1 mb-1">Sales <HelpCircle size={12} className="text-slate-500"/></div>
            <div className="grid grid-cols-2 text-[10px] text-slate-500 font-medium"><span>Total</span><span>Mon</span></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-1 mb-1">Reviews <HelpCircle size={12} className="text-slate-500"/></div>
            <div className="grid grid-cols-2 text-[10px] text-slate-500 font-medium"><span>Total</span><span>Mon</span></div>
          </div>
          <div className="flex items-center justify-center gap-1">Score <HelpCircle size={12} className="text-slate-500"/></div>
          <div className="flex flex-col items-center gap-1">
            <HelpCircle size={12} className="text-slate-500"/>
            Long Tail
          </div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col">
          {filteredKeywords.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              No results found for "{query}". Try another keyword.
            </div>
          ) : (
            filteredKeywords.map((item) => {
              const isExpanded = expandedRows.has(item.id);

            return (
              <div key={item.id} className="border-b border-white/5 hover:bg-slate-800/40 transition-colors">
                
                {/* Main Row */}
                <div className="grid grid-cols-[30px_30px_1fr_120px_160px_160px_160px_160px_80px_80px] items-center text-center py-3 px-4 text-xs">
                  
                  {/* Expander */}
                  <div className="flex justify-center text-slate-500 hover:text-white cursor-pointer" onClick={() => toggleRow(item.id)}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  
                  {/* Checkbox */}
                  <div><input type="checkbox" className="accent-orange-500 cursor-pointer" /></div>
                  
                  {/* Keyword */}
                  <div className="text-left font-medium text-white flex items-center gap-3 px-2">
                    {item.keyword}
                  </div>
                  
                  {/* Competition */}
                  <div className="flex justify-center">
                    <span className={`${item.compColor} text-white px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide`}>
                      {item.competition}
                    </span>
                  </div>
                  
                  {/* Views */}
                  <div className="grid grid-cols-2 gap-1 px-2">
                    <span className={`${item.views.totalColor} text-white px-1 py-0.5 rounded text-[10px] font-semibold`}>{item.views.total}</span>
                    <span className={`${item.views.monColor} text-white px-1 py-0.5 rounded text-[10px] font-semibold`}>{item.views.mon}</span>
                  </div>

                  {/* Favorites */}
                  <div className="grid grid-cols-2 gap-1 px-2">
                    <span className={`${item.favorites.totalColor} text-white px-1 py-0.5 rounded text-[10px] font-semibold`}>{item.favorites.total}</span>
                    <span className={`${item.favorites.monColor} text-white px-1 py-0.5 rounded text-[10px] font-semibold`}>{item.favorites.mon}</span>
                  </div>

                  {/* Sales */}
                  <div className="grid grid-cols-2 gap-1 px-2">
                    <span className={`${item.sales.totalColor} text-white px-1 py-0.5 rounded text-[10px] font-semibold`}>{item.sales.total}</span>
                    <span className={`${item.sales.monColor} text-white px-1 py-0.5 rounded text-[10px] font-semibold`}>{item.sales.mon}</span>
                  </div>

                  {/* Reviews */}
                  <div className="grid grid-cols-2 gap-1 px-2">
                    <span className={`${item.reviews.totalColor} text-white px-1 py-0.5 rounded text-[10px] font-semibold`}>{item.reviews.total}</span>
                    <span className={`${item.reviews.monColor} text-white px-1 py-0.5 rounded text-[10px] font-semibold`}>{item.reviews.mon}</span>
                  </div>

                  {/* Score */}
                  <div className="text-slate-300 font-medium">{item.score.toFixed(2)}</div>

                  {/* Long Tail */}
                  <div className="flex justify-center">
                    {item.isLongTail ? (
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">?</div>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </div>
                </div>

                {/* Expanded Charts Row */}
                {isExpanded && (
                  <div className="grid grid-cols-[60px_1fr_120px_160px_160px_160px_160px_160px] pb-6 pt-2 bg-slate-900/50 px-4">
                    <div></div>
                    <div></div>
                    <div className="flex justify-center"><Sparkline data={item.compTrend} label="Competition" /></div>
                    <div className="flex justify-center"><Sparkline data={item.views.trend} label="Views" /></div>
                    <div className="flex justify-center"><Sparkline data={item.favorites.trend} label="Favorites" /></div>
                    <div className="flex justify-center"><Sparkline data={item.sales.trend} label="Sales" /></div>
                    <div className="flex justify-center"><Sparkline data={item.reviews.trend} label="Reviews" /></div>
                    <div></div>
                  </div>
                )}
              </div>
            )
          }))}
        </div>

      </div>
    </div>
  )
}
