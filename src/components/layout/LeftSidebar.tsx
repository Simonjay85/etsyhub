import { useEffect } from 'react'
import { UploadArea } from '../upload/UploadArea'
import { FileMetaCard } from '../upload/FileMetaCard'
import { ImageGallery } from '../upload/ImageGallery'
import { useEditorStore } from '@/lib/store/useEditorStore'
import { analyzeImage } from '@/lib/analysis/analyzeImage'
import { generateBatchMockups } from '@/lib/mockup/batchRenderer'
import { toast } from 'sonner'

// ============================================================
// DIGITAL PLANNER PRESETS
// ============================================================
const PLANNER_PRESETS = [
  {
    id: 'weekly',
    label: '📅 Weekly',
    showcaseTitle: 'Weekly Planner',
    showcaseSubtitle: '2026 - LANDSCAPE',
    fileFormats: 'PDF',
    paperSizes: 'A4 & LETTER',
    infographic: '🌟 Features:\n- Weekly Overview Layout\n- Goal Setting Section\n- Habit Tracker\n- To-Do Lists\n- Notes & Reflections\n- Editable in Canva\n- Instant Download',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- 1x Weekly Planner PDF\n- 52 Weekly Spread Pages\n- Bonus Sticker Set\n- Instruction Guide',
  },
  {
    id: 'daily',
    label: '📋 Daily',
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
    label: '📆 Monthly',
    showcaseTitle: 'Monthly Planner',
    showcaseSubtitle: '2026 - AESTHETIC',
    fileFormats: 'PDF & JPG',
    paperSizes: 'A4',
    infographic: '🌟 Features:\n- Monthly Overview Spread\n- Calendar Grid Layout\n- Monthly Goals & Priorities\n- Expense Tracker\n- Notes Section\n- Editable in Canva\n- Instant Download',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- 1x Monthly Planner PDF\n- 12 Monthly Spreads\n- Year-at-a-Glance Page\n- Instruction Guide',
  },
];

// ============================================================
// PLANNER UTILITY PRESETS
// ============================================================
const UTILITY_PRESETS = [
  {
    id: 'cleaning',
    label: '🧹 Cleaning List',
    showcaseTitle: 'Cleaning List',
    showcaseSubtitle: 'EASY SETUP | BEGINNER FRIENDLY | FULLHOUSE LIST',
    fileFormats: 'PDF',
    paperSizes: 'A4',
    infographic: '🌟 Features:\n- Room-by-Room Checklists\n- Kitchen, Bathroom, Bedroom\n- Living Room & Outdoors\n- Beginner Friendly\n- Instant Download',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- Full House Cleaning Checklist\n- 8+ Room Categories\n- Printable PDF\n- Instruction Guide',
  },
  {
    id: 'budget-tracker',
    label: '💰 Budget Tracker',
    showcaseTitle: 'Budget Tracker',
    showcaseSubtitle: 'SIMPLE | POWERFUL | PRINTABLE',
    fileFormats: 'PDF & PNG',
    paperSizes: 'A4 & LETTER',
    infographic: '🌟 Features:\n- Monthly Budget Overview\n- Expense Categories\n- Savings Goal Tracker\n- Bill Payment Checklist\n- Net Worth Calculator',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- Monthly Budget Sheets\n- Expense Tracker Pages\n- Savings Planner\n- Instruction Guide',
  },
  {
    id: 'meal-planner',
    label: '🍽️ Meal Planner',
    showcaseTitle: 'Meal Planner',
    showcaseSubtitle: 'WEEKLY | HEALTHY | ORGANIZED',
    fileFormats: 'PDF',
    paperSizes: 'A4',
    infographic: '🌟 Features:\n- Weekly Meal Plan Grid\n- Grocery Shopping List\n- Recipe Notes Section\n- Calorie Tracker\n- Snack & Drink Log',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- Weekly Meal Planner PDF\n- Grocery List Template\n- Recipe Card Pages\n- Instruction Guide',
  },
  {
    id: 'habit-tracker',
    label: '✅ Habit Tracker',
    showcaseTitle: 'Habit Tracker',
    showcaseSubtitle: 'DAILY | MONTHLY | PROGRESS',
    fileFormats: 'PDF & PNG',
    paperSizes: 'A4',
    infographic: '🌟 Features:\n- Daily Habit Checkboxes\n- 30-Day Progress Grid\n- Streak Counter\n- Monthly Overview\n- Motivational Quotes',
    youWillGet: '🎁 WHAT YOU WILL GET:\n- Habit Tracker PDF\n- Monthly Progress Sheets\n- Notes Pages\n- Instruction Guide',
  },
];

// ============================================================
// COMPOSITE IMAGE PRESETS
// ============================================================
const COMPOSITE_PRESETS = [
  {
    id: 'product-bundle',
    label: '📦 Product Bundle',
    showcaseTitle: 'Digital Bundle',
    showcaseSubtitle: 'DIGITAL COLLECTION · INSTANT DOWNLOAD',
    fileFormats: 'PDF',
    paperSizes: 'A4',
    infographic: '',
    youWillGet: '',
  },
  {
    id: 'before-after',
    label: '✨ Before & After',
    showcaseTitle: 'Before & After',
    showcaseSubtitle: 'TRANSFORMATION · RESULTS · AMAZING',
    fileFormats: 'PNG',
    paperSizes: 'A4',
    infographic: '',
    youWillGet: '',
  },
  {
    id: 'color-variants',
    label: '🎨 Color Variants',
    showcaseTitle: 'Color Collection',
    showcaseSubtitle: '6 BEAUTIFUL COLORS · PICK YOUR FAVORITE',
    fileFormats: 'PDF & PNG',
    paperSizes: 'A4',
    infographic: '',
    youWillGet: '',
  },
  {
    id: 'collection-showcase',
    label: '🖼️ Showcase',
    showcaseTitle: 'Full Collection',
    showcaseSubtitle: 'COMPLETE BUNDLE · ALL INCLUDED · BEST VALUE',
    fileFormats: 'PDF',
    paperSizes: 'A4 & LETTER',
    infographic: '',
    youWillGet: '',
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
    paperSizes, setPaperSizes,
    productStyle, setProductStyle
  } = useEditorStore()

  const activePresets = productStyle === 'digital-planner' ? PLANNER_PRESETS : productStyle === 'planner-utility' ? UTILITY_PRESETS : COMPOSITE_PRESETS;

  const applyPreset = (presetId: string) => {
    const preset = activePresets.find(p => p.id === presetId);
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
    setBatchGenerating(true);
    try {
      const allSrcs = images.map(img => img.src);
      const primarySrc = sourceImage?.src || allSrcs[0];
      const mockups = await generateBatchMockups(
        primarySrc,
        infographicText,
        youWillGetText,
        allSrcs,
        showcaseTitle,
        showcaseSubtitle,
        fileFormats,
        paperSizes,
        undefined,
        productStyle
      );
      setBatchMockups(mockups);
      toast.success(`Successfully generated ${mockups.length} mockups!`);
    } catch (e) {
      toast.error('Failed to generate mockups: ' + (e as Error).message);
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
        
        {/* ─── PRODUCT STYLE SELECTOR ─── */}
        <div>
          <h2 className="text-xs font-bold mb-2 text-muted-foreground uppercase tracking-wider">Product Style</h2>
          <div className="flex gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setProductStyle('digital-planner')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                productStyle === 'digital-planner'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              📓 Digital Planner
            </button>
            <button
              onClick={() => setProductStyle('planner-utility')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                productStyle === 'planner-utility'
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              🗂️ Planner Utility
            </button>
            <button
              onClick={() => setProductStyle('composite')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                productStyle === 'composite'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              🎨 Composite
            </button>
          </div>
        </div>

        {/* ─── INFO BANNER PER STYLE ─── */}
        {productStyle === 'planner-utility' && (
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300">
            📌 Upload <strong>2+ pages</strong> of your product. System will generate Fan, Grid & Diagonal collection mockups.
          </div>
        )}
        {productStyle === 'composite' && (
          <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-300">
            🎨 Upload <strong>2–6 images</strong> of your product. System will generate 6 composite layout mockups (Mosaic, Polaroid, Split, Strip, Hero, Diagonal).
          </div>
        )}

        <div>
          <h2 className="text-sm font-semibold mb-3 tracking-tight">Upload</h2>
          <UploadArea />
        </div>
        
        <ImageGallery />

        {(sourceImage || ((productStyle === 'planner-utility' || productStyle === 'composite') && images.length > 0)) && (
          <div className="space-y-4">
            {/* ─── PRESETS ─── */}
            <div className={`p-3 rounded-xl border ${
              productStyle === 'digital-planner'
                ? 'bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border-emerald-500/20'
                : productStyle === 'planner-utility'
                ? 'bg-gradient-to-br from-orange-600/10 to-amber-600/10 border-orange-500/20'
                : 'bg-gradient-to-br from-pink-600/10 to-rose-600/10 border-pink-500/20'

            }`}>
              <h2 className={`text-xs font-semibold mb-2 uppercase tracking-wider ${
                productStyle === 'digital-planner' ? 'text-emerald-400' : productStyle === 'planner-utility' ? 'text-orange-400' : 'text-pink-400'
              }`}>
                {productStyle === 'digital-planner' ? 'Planner Type' : productStyle === 'planner-utility' ? 'Utility Type' : 'Composite Preset'}
              </h2>
              <div className="grid grid-cols-2 gap-1.5">
                {activePresets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    className={`text-xs px-2 py-2 rounded-lg bg-black/20 border border-white/5 text-left transition-all text-muted-foreground truncate ${
                      productStyle === 'digital-planner'
                        ? 'hover:bg-emerald-600/30 hover:border-emerald-500/30 hover:text-white'
                        : productStyle === 'planner-utility'
                        ? 'hover:bg-orange-600/30 hover:border-orange-500/30 hover:text-white'
                        : 'hover:bg-pink-600/30 hover:border-pink-500/30 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── BATCH GENERATOR PANEL ─── */}
            <div className="p-3 bg-gradient-to-br from-violet-600/10 to-pink-600/10 border border-violet-500/20 rounded-xl">
              <h2 className="text-sm font-semibold mb-1 text-violet-400">Etsy Batch Generator</h2>
              <p className="text-xs text-muted-foreground mb-3">
                {images.length} image{images.length !== 1 ? 's' : ''} · 
                {productStyle === 'composite'
                  ? (images.length >= 2 ? ' Composite ✓' : ' Need 2+ images')
                  : productStyle === 'planner-utility' 
                  ? (images.length >= 2 ? ' Collection ✓' : ' Need 2+ images')
                  : (images.length >= 3 ? ' Showcase ✓' : ' Need 3+ for Showcase')}
              </p>
              
              {/* Title + Subtitle */}
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

              {/* File Formats + Paper Sizes — shown only for Digital Planner */}
              {productStyle === 'digital-planner' && (
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
              )}

              {/* Bullet points — for Planner Utility the subtitle provides them */}
              {productStyle === 'planner-utility' && (
                <div className="mb-2">
                  <label className="text-[10px] font-medium text-muted-foreground mb-0.5 block">Bullet Tags (separate with |)</label>
                  <input
                    type="text"
                    className="w-full p-1.5 text-xs rounded border bg-background/50 outline-none focus:border-violet-500 transition-colors"
                    placeholder="EASY SETUP | BEGINNER FRIENDLY | FULLHOUSE LIST"
                    value={showcaseSubtitle}
                    onChange={(e) => setShowcaseSubtitle(e.target.value)}
                  />
                </div>
              )}

              {productStyle === 'digital-planner' && (
                <>
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
                </>
              )}

              <button 
                onClick={handleBatchGenerate}
                disabled={isBatchGenerating}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isBatchGenerating ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Generating...</>
                ) : (
                  <>✨ Generate {productStyle === 'planner-utility' ? 'Collection Mockups' : productStyle === 'composite' ? 'Composite Mockups' : 'All Mockups'}</>
                )}
              </button>
            </div>

            {sourceImage && (
              <div>
                <h2 className="text-sm font-semibold mb-3 tracking-tight">Active Image Properties</h2>
                <FileMetaCard />
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
