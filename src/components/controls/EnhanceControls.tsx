import { useEditorStore } from '@/lib/store/useEditorStore'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

export function EnhanceControls() {
  const { settings, updateEnhancementSettings } = useEditorStore()
  
  const h = (k: keyof typeof settings.enhancement, v: boolean | number) => {
    updateEnhancementSettings({ [k]: v })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-sm font-semibold tracking-tight">Enhancement</h3>
      </div>
      
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Label htmlFor="upscale" className="text-sm text-foreground/80 cursor-pointer">AI Upscale</Label>
          <Switch 
            id="upscale" 
            checked={settings.enhancement.upscale} 
            onCheckedChange={(c) => h('upscale', c)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="lightColor" className="text-sm text-foreground/80 cursor-pointer">Light Color Correction</Label>
          <Switch 
            id="lightColor" 
            checked={settings.enhancement.lightColorCorrection} 
            onCheckedChange={(c) => h('lightColorCorrection', c)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="toneEnhance" className="text-sm text-foreground/80 cursor-pointer">Tone Enhancement</Label>
          <Switch 
            id="toneEnhance" 
            checked={settings.enhancement.toneEnhancement} 
            onCheckedChange={(c) => h('toneEnhancement', c)} 
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="preserveMood" className="text-sm text-foreground/80 cursor-pointer">Preserve Original Mood</Label>
          <Switch 
            id="preserveMood" 
            checked={settings.enhancement.preserveMood} 
            onCheckedChange={(c) => h('preserveMood', c)} 
          />
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground/80">Enhance Intensity</Label>
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{settings.enhancement.intensity}%</span>
          </div>
          <Slider 
            value={[settings.enhancement.intensity]} 
            onValueChange={(val: any) => h('intensity', Array.isArray(val) ? val[0] : val)} 
            max={100} 
            step={1} 
          />
        </div>
      </div>
    </div>
  )
}
