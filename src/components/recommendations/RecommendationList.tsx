import { useEditorStore } from '@/lib/store/useEditorStore'
import { generateRecommendations } from '@/lib/analysis/recommendationEngine'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

export function RecommendationList() {
  const analysis = useEditorStore(state => state.analysis)

  if (!analysis) return null

  const recs = generateRecommendations(analysis)
  if (recs.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight">AI Recommendations</h3>
      <div className="space-y-2">
        {recs.map(rec => (
          <div key={rec.id} className="flex gap-3 text-sm p-3 rounded-xl bg-secondary/40 border border-border/40">
            <div className="shrink-0 mt-0.5">
              {rec.severity === 'info' && <Info className="w-4 h-4 text-blue-500" />}
              {rec.severity === 'suggestion' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              {rec.severity === 'warning' && <AlertCircle className="w-4 h-4 text-amber-500" />}
            </div>
            <p className="text-muted-foreground leading-relaxed">{rec.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
