import { useEditorStore } from '@/lib/store/useEditorStore'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function BackgroundControls() {
  const { settings, updateBackgroundSettings } = useEditorStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-sm font-semibold tracking-tight">Background</h3>
      </div>
      
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mode</Label>
          <Select 
            value={settings.background.mode} 
            onValueChange={(v) => updateBackgroundSettings({ mode: v as any })}
          >
            <SelectTrigger className="w-full text-sm font-medium h-9">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keep">Keep Original</SelectItem>
              <SelectItem value="clean" disabled>Clean / Re-light (Coming Soon)</SelectItem>
              <SelectItem value="replace" disabled>Replace BG (Coming Soon)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
