import { useEffect } from 'react'
import { UploadArea } from '../upload/UploadArea'
import { FileMetaCard } from '../upload/FileMetaCard'
import { ImageGallery } from '../upload/ImageGallery'
import { useEditorStore } from '@/lib/store/useEditorStore'
import { analyzeImage } from '@/lib/analysis/analyzeImage'
import { generateBatchMockups } from '@/lib/mockup/batchRenderer'
import { toast } from 'sonner'

const PRODUCT_PRESETS = [
  {
    id: 'weekly',
    label: '📅 Weekly Planner',
    showcaseTitle: 'Weekly Planner',
    showcaseSubtitle: '2026 - LANDSCAPE',
    fileFormats: 'PDF',
    paperSizes: 'A4 & LETTER',
    infographic: '🌟 Features:\n- Weekly Overview Layout\n- Goal Setting Section\n- Habit Tracker\n- To-Do Lists\n- Notes & Reflections\n- Editable in Canva\n- Instant Download',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- 1x Weekly Planner PDF\n- 52 Weekly Spread Pages\n- Bonus Sticker Set\n- Instruction Guide',
  },
  {
    id: 'daily',
    label: '📋 Daily Planner',
    showcaseTitle: 'Daily Planner',
    showcaseSubtitle: '2026 - MINIMALIST',
    fileFormats: 'PDF & PNG',
    paperSizes: 'A4',
    infographic: '🌟 Features:\n- Hourly Schedule (6AM-10PM)\n- Priority Task List\n- Water & Meal Tracker\n- Gratitude Section\n- Daily Affirmations\n- Editable in Canva\n- Print-Ready PDF',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- 1x Daily Planner PDF\n- 365 Daily Pages\n- Monthly Dividers\n- Instruction Guide',
  },
  {
    id: 'allinone',
    label: '✨ All-In-One',
    showcaseTitle: 'All-In-One Digital Planner',
    showcaseSubtitle: '2026 - LANDSCAPE',
    fileFormats: 'PDF',
    paperSizes: 'A4 & LETTER',
    infographic: '🌟 Features:\n- Yearly, Monthly, Weekly & Daily\n- Goal & Vision Board\n- Finance & Budget Tracker\n- Habit & Mood Tracker\n- Reading & Fitness Log\n- Hyperlinked Navigation\n- 500+ Digital Stickers',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- 1x All-In-One Planner PDF\n- 500+ Digital Stickers\n- 3 Color Themes\n- Bonus Covers\n- Instruction Guide',
  },
  {
    id: 'monthly',
    label: '📆 Monthly Planner',
    showcaseTitle: 'Monthly Planner',
    showcaseSubtitle: '2026 - AESTHETIC',
    fileFormats: 'PDF & JPG',
    paperSizes: 'A4',
    infographic: '🌟 Features:\n- Monthly Overview Spread\n- Calendar Grid Layout\n- Monthly Goals & Priorities\n- Expense Tracker\n- Notes Section\n- Editable in Canva\n- Instant Download',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- 1x Monthly Planner PDF\n- 12 Monthly Spreads\n- Year-at-a-Glance Page\n- Instruction Guide',
  },
];

export function LeftSidebar() {
  const { 
    sourceImage, images, analysis, setAnalysis, 
    setBatchGenerating, setBatchMockups, isBatchGenerating,
    infographicText, setInfographicText,
    youWillGetText, setYouWillGetText,
    showcaseTitle, setShowcaseTitle,
    showcaseSubtitle, setShowcaseSubtitle,
    fileFormats, setFileFormats,
    paperSizes, setPaperSizes
  } = useEditorStore()

  const applyPreset = (presetId: string) => {
    const preset = PRODUCT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setShowcaseTitle(preset.showcaseTitle);
    setShowcaseSubtitle(preset.showcaseSubtitle);
    setInfographicText(preset.infographic);
    setYouWillGetText(preset.youWillGet);
    setFileFormats(preset.fileFormats);
    setPaperSizes(preset.paperSizes);
    toast.success(`Loaded "${preset.label}" preset`);
  };

  const handleBatchGenerate = async () => {
    if (!sourceImage) return;
    setBatchGenerating(true);
    try {
      const allSrcs = images.map(img => img.src);
      const mockups = await generateBatchMockups(
        sourceImage.src,
        infographicText,
        youWillGetText,
        allSrcs,
        showcaseTitle,
        showcaseSubtitle,
        fileFormats,
        paperSizes
      );
      setBatchMockups(mockups);
      toast.success(`Successfully generated ${mockups.length} mockups!`);
    } catch (e) {
      toast.error('Failed to generate mockups');
    } finally {
      setBatchGenerating(false);
    }
  };

  useEffect(() => {
    let active = true
    if (sourceImage && !analysis) {
      toast.promise(
        analyzeImage(sourceImage.file, sourceImage.src, sourceImage.width, sourceImage.height),
        {
          loading: 'Analyzing image...',
          success: (res) => {
            if (active) setAnalysis(res)
            return 'Analysis complete'
          },
          error: 'Analysis failed'
        }
      )
    }
    return () => { active = false }
  }, [sourceImage, analysis, setAnalysis])

  return (
    <aside className="w-80 border-r bg-card flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div>
          <h2 className="text-sm font-semibold mb-3 tracking-tight">Upload</h2>
          <UploadArea />
        </div>
        
        <ImageGallery />

        {sourceImage && (
          <div className="space-y-4">
            {/* Product Preset Selector */}
            <div className="p-3 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-emerald-500/20 rounded-xl">
              <h2 className="text-xs font-semibold mb-2 text-emerald-400 uppercase tracking-wider">Product Type</h2>
              <div className="grid grid-cols-2 gap-1.5">
                {PRODUCT_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className="text-xs px-2 py-2 rounded-lg bg-black/20 hover:bg-emerald-600/30 border border-white/5 hover:border-emerald-500/30 text-left transition-all text-muted-foreground hover:text-white truncate"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Generator Panel */}
            <div className="p-3 bg-gradient-to-br from-violet-600/10 to-pink-600/10 border border-violet-500/20 rounded-xl">
              <h2 className="text-sm font-semibold mb-1 text-violet-400">Etsy Batch Generator</h2>
              <p className="text-xs text-muted-foreground mb-3">
                {images.length} image{images.length !== 1 ? 's' : ''} · {images.length >= 3 ? 'Showcase ✓' : 'Need 3+ for Showcase'}
              </p>
              
              {/* 2-column: Title + Subtitle */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Title</label>
                  <input
                    type="text"
                    className="w-full p-1.5 text-xs rounded border bg-background/50 outline-none focus:border-violet-500 transition-colors"
                    value={showcaseTitle}
                    onChange={(e) => setShowcaseTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Subtitle</label>
                  <input
                    type="text"
                    className="w-full p-1.5 text-xs rounded border bg-background/50 outline-none focus:border-violet-500 transition-colors"
                    value={showcaseSubtitle}
                    onChange={(e) => setShowcaseSubtitle(e.target.value)}
                  />
                </div>
              </div>

              {/* 2-column: File Formats + Paper Sizes */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">📁 File Formats</label>
                  <input
                    type="text"
                    className="w-full p-1.5 text-xs rounded border bg-background/50 outline-none focus:border-violet-500 transition-colors"
                    placeholder="PDF, PNG, JPG..."
                    value={fileFormats}
                    onChange={(e) => setFileFormats(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">📐 Paper Sizes</label>
                  <input
                    type="text"
                    className="w-full p-1.5 text-xs rounded border bg-background/50 outline-none focus:border-violet-500 transition-colors"
                    placeholder="A4, A5, LETTER..."
                    value={paperSizes}
                    onChange={(e) => setPaperSizes(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Why Choose This?</label>
                <textarea 
                  className="w-full h-16 p-1.5 text-xs rounded border bg-background/50 outline-none focus:border-violet-500 transition-colors resize-none"
                  value={infographicText}
                  onChange={(e) => setInfographicText(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">What You Will Get</label>
                <textarea 
                  className="w-full h-16 p-1.5 text-xs rounded border bg-background/50 outline-none focus:border-violet-500 transition-colors resize-none"
                  value={youWillGetText}
                  onChange={(e) => setYouWillGetText(e.target.value)}
                />
              </div>

              <button 
                onClick={handleBatchGenerate}
                disabled={isBatchGenerating}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isBatchGenerating ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Generating...</>
                ) : (
                  <>✨ Generate All Mockups</>
                )}
              </button>
            </div>

            <div>
              <h2 className="text-sm font-semibold mb-3 tracking-tight">Active Image Properties</h2>
              <FileMetaCard />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
