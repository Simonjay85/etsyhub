"use client";

import { useState } from 'react';
import { dailyTrends, weeklyTrends, monthlyTrends, topKeywords, TrendingProduct } from '@/lib/mockData/etsyTrends';
import { ExternalLink, TrendingUp, TrendingDown, Store, Search, BarChart3, Activity } from 'lucide-react';
import Image from 'next/image';

type TimeFrame = 'daily' | 'weekly' | 'monthly';

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<TimeFrame>('daily');

  const getActiveProducts = (): TrendingProduct[] => {
    switch(timeframe) {
      case 'daily': return dailyTrends;
      case 'weekly': return weeklyTrends;
      case 'monthly': return monthlyTrends;
    }
  };

  const activeProducts = getActiveProducts();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-1">Etsy Market Spy</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            Discover winning products and high-volume keywords on Etsy.
          </p>
        </div>
        
        {/* Timeframe Toggle */}
        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 w-fit">
          <button 
            onClick={() => setTimeframe('daily')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === 'daily' ? 'bg-violet-600 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            Daily
          </button>
          <button 
            onClick={() => setTimeframe('weekly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === 'weekly' ? 'bg-violet-600 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setTimeframe('monthly')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeframe === 'monthly' ? 'bg-violet-600 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col xl:flex-row gap-6">
        
        {/* Main Area: Trending Products 70% */}
        <div className="flex-[3] flex flex-col min-w-0">
          <div className="glass-panel p-5 flex flex-col flex-1 h-full border border-white/5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pink-400" />
                Top Trending Products
              </h2>
              <span className="text-xs text-muted-foreground">Showing top {activeProducts.length} results</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-white/5">
              <table className="w-full text-left text-sm">
                <thead className="bg-black/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Shop</th>
                    <th className="px-4 py-3 text-right">Est. Revenue</th>
                    <th className="px-4 py-3 text-right">Sales</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeProducts.map((p, index) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground font-mono text-xs w-4">{index + 1}.</span>
                          <div className="relative w-12 h-12 rounded bg-black flex-shrink-0 overflow-hidden border border-white/10 group-hover:border-violet-500/50 transition-colors">
                            <Image src={p.thumbnail} alt={p.title} fill sizes="48px" className="object-cover" />
                          </div>
                          <div className="max-w-[200px] lg:max-w-[300px]">
                            <p className="text-white font-medium truncate" title={p.title}>{p.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-muted-foreground hover:text-violet-400 transition-colors cursor-pointer">
                          <Store className="w-3.5 h-3.5" />
                          <span className="truncate">{p.shopName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-emerald-400 font-bold tracking-tight">${p.estimatedRevenue.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-white font-semibold">{p.sales.toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <a href={p.productLink} target="_blank" rel="noreferrer" className="p-1.5 bg-white/5 hover:bg-violet-600 rounded-md transition-colors" title="View Listing">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Area: Top Keywords 30% */}
        <div className="flex-[1] min-w-[300px]">
          <div className="glass-panel p-5 border border-white/5 shadow-xl h-full sticky top-0">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-violet-400" />
              High Search Volume
            </h2>

            <div className="space-y-4">
              {topKeywords.map((kw, i) => (
                <div key={kw.id} className="p-3 bg-black/20 rounded-lg border border-white/5 hover:border-violet-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white font-semibold text-sm">
                      <span className="text-muted-foreground mr-2">{i + 1}.</span>
                      {kw.keyword}
                    </p>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white/5">
                      {kw.trendPercentage > 0 ? (
                        <><TrendingUp className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">+{kw.trendPercentage}%</span></>
                      ) : (
                        <><TrendingDown className="w-3 h-3 text-rose-400" /><span className="text-rose-400">{kw.trendPercentage}%</span></>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <p className="text-muted-foreground">Volume: <span className="text-white font-medium">{kw.searchVolume.toLocaleString()}</span></p>
                    <p className="text-muted-foreground flex items-center gap-1">
                      Comp: 
                      <span className={`font-medium ${
                        kw.competition === 'Low' ? 'text-emerald-400' : 
                        kw.competition === 'High' ? 'text-rose-400' : 'text-amber-400'
                      }`}>
                        {kw.competition}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-muted-foreground">Data estimated from mock Etsy metrics.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
