import { useEditorStore } from '@/lib/store/useEditorStore'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function WatermarkControls() {
  const { settings, updateWatermarkSettings } = useEditorStore()
  
  const h = (k: keyof typeof settings.watermark, v: any) => {
    updateWatermarkSettings({ [k]: v })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-sm font-semibold tracking-tight">Watermark</h3>
        <Switch 
          checked={settings.watermark.enabled} 
          onCheckedChange={(c) => h('enabled', c)} 
        />
      </div>
      
      {settings.watermark.enabled && (
        <div className="space-y-5 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Position</Label>
            <Select 
              value={settings.watermark.position} 
              onValueChange={(v) => h('position', v)}
            >
              <SelectTrigger className="w-full text-sm font-medium h-9">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Size</Label>
              <span className="text-xs font-medium text-muted-foreground">{settings.watermark.size}%</span>
            </div>
            <Slider 
              value={[settings.watermark.size]} 
              onValueChange={(val: any) => h('size', Array.isArray(val) ? val[0] : val)} 
              max={100} min={10} step={1} 
            />
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-foreground/80">Opacity</Label>
              <span className="text-xs font-medium text-muted-foreground">{settings.watermark.opacity}%</span>
            </div>
            <Slider 
              value={[settings.watermark.opacity]} 
              onValueChange={(val: any) => h('opacity', Array.isArray(val) ? val[0] : val)} 
              max={100} min={0} step={1} 
            />
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <Label htmlFor="adaptiveContrast" className="text-sm text-foreground/80 cursor-pointer">Adaptive Contrast</Label>
            <Switch 
              id="adaptiveContrast" 
              checked={settings.watermark.adaptiveContrast} 
              onCheckedChange={(c) => h('adaptiveContrast', c)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}
