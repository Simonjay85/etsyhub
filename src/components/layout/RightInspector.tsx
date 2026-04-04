import { EnhanceControls } from '../controls/EnhanceControls'
import { BackgroundControls } from '../controls/BackgroundControls'
import { TextControls } from '../controls/TextControls'
import { WatermarkControls } from '../controls/WatermarkControls'
import { RecommendationList } from '../recommendations/RecommendationList'

export function RightInspector() {
  return (
    <aside className="w-[360px] border-l bg-card flex flex-col shrink-0 overflow-y-auto z-10 shadow-[-4px_0_24px_-10px_rgba(0,0,0,0.05)]">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg tracking-tight">Inspector</h2>
        <p className="text-xs text-muted-foreground mt-1">Refine and enhance your design.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-8">
          <RecommendationList />
          <EnhanceControls />
          <TextControls />
          <WatermarkControls />
          <BackgroundControls />
        </div>
      </div>
    </aside>
  )
}
