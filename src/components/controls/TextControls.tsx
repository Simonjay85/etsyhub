import { useEditorStore } from '@/lib/store/useEditorStore'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function TextControls() {
  const { 
    settings, 
    updateTextSettings, 
    analysis, 
    isProcessingAI, 
    setAiProcessing, 
    setAiImageUrl,
    sourceImage 
  } = useEditorStore()
  
  const h = (k: keyof typeof settings.text, v: any) => {
    updateTextSettings({ [k]: v })
  }

  const hasHeadline = analysis?.textRegions?.some(r => r.originalText.includes('DIGITAL PLANNER'))
  const hasBadge = analysis?.textRegions?.some(r => r.originalText.includes('BADGE') || r.originalText.includes('Badge'))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-sm font-semibold tracking-tight">Image Cleanup Actions</h3>
      </div>
      
      <div className="space-y-5">
        
        {hasHeadline && (
          <div className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-900/20 dark:border-slate-800/50">
            <div className="space-y-1">
              <Label htmlFor="removeTemply" className="text-sm font-semibold tracking-tight cursor-pointer">Rebrand Main Title</Label>
              <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                Remove "PLR RESELL" and standardize the title to "DIGITAL PLANNER".
              </p>
            </div>
            <Switch 
              id="removeTemply" 
              checked={settings.text.removeTemplyHeadline} 
              onCheckedChange={(c) => h('removeTemplyHeadline', c)} 
            />
          </div>
        )}

        {hasBadge && (
          <div className="flex flex-col gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-900/20 dark:border-slate-800/50">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <Label htmlFor="replacePlr" className="text-sm font-semibold tracking-tight cursor-pointer">Clean Promotional Badges</Label>
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  Inpaint AI over the "PLR RESELL / Canva Pro" sticker.
                </p>
              </div>
              <Switch 
                id="replacePlr" 
                checked={settings.text.replacePlrResell} 
                onCheckedChange={(c) => h('replacePlrResell', c)} 
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="keepMeaning" className="text-sm text-foreground/80 cursor-pointer opacity-40">Keep Original Meaning</Label>
          <Switch 
            id="keepMeaning" 
            disabled
            checked={settings.text.keepMeaning} 
            onCheckedChange={(c) => h('keepMeaning', c)} 
          />
        </div>
        
        <div className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-900/20 dark:border-slate-800/50">
          <div className="space-y-1">
            <Label htmlFor="removeUnwanted" className="text-sm font-semibold tracking-tight cursor-pointer">Remove Subtitle Banner</Label>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              Delete the "READY TO EDIT, REBRAND & RESELL..." banner.
            </p>
          </div>
          <Switch 
            id="removeUnwanted" 
            checked={settings.text.removeUnwanted} 
            onCheckedChange={(c) => h('removeUnwanted', c)} 
          />
        </div>

        {/* Nano Banana AI Integration */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50">
          <button
            disabled={isProcessingAI || !sourceImage}
            onClick={async () => {
              if (!sourceImage) return
              setAiProcessing(true)
              
              try {
                // In a real app we would convert the sourceImage.file to base64
                // and pass actual mask regions. For this mockup, we just call the API action wrapper.
                const { processImageWithNanoBanana } = await import('@/lib/actions/editImageWithAI')
                const res = await processImageWithNanoBanana('', [], 'inpaint')
                setAiImageUrl(res.resultImageUrl)
              } catch (err: any) {
                // Alert the user that the API key is missing or failed
                alert(err.message)
              } finally {
                setAiProcessing(false)
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-400 hover:to-indigo-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessingAI ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/> Processing AI...</span>
            ) : (
              <span>✨ Apply Nano Banana AI Inpaint</span>
            )}
          </button>
          <p className="text-[10px] text-center text-muted-foreground mt-2 opacity-60">
            Powered by Nano Banana Pro API
          </p>
        </div>
      </div>
    </div>
  )
}
