import { useEditorStore } from '@/lib/store/useEditorStore'
import { Download, X } from 'lucide-react'
import JSZip from 'jszip'
import { toast } from 'sonner'

export function BatchResultsGrid() {
  const { batchMockups, setBatchMockups } = useEditorStore()

  const downloadAll = async () => {
    try {
      toast.loading('Zipping images...', { id: 'zip' });
      const zip = new JSZip();
      
      batchMockups.forEach((dataUrl, i) => {
        // Strip data prefix
        const base64Data = dataUrl.replace(/^data:image\/(png|jpeg);base64,/, "");
        zip.file(`mockup_${i + 1}.jpg`, base64Data, {base64: true});
      });

      const blob = await zip.generateAsync({type: 'blob'});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'etsy_mockups.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Downloaded successfully!', { id: 'zip' });
    } catch (e) {
      toast.error('Failed to zip files', { id: 'zip' });
    }
  }

  return (
    <div className="absolute inset-0 bg-background flex flex-col z-40">
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div>
          <h2 className="text-lg font-bold">Generated Mockups ({batchMockups.length})</h2>
          <p className="text-xs text-muted-foreground">Ready for Etsy upload (2000x2000px)</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={downloadAll}
            className="btn-primary px-4 py-2 bg-gradient-to-r from-violet-600 to-pink-600 rounded-lg text-white font-medium flex items-center gap-2 text-sm hover:opacity-90 transition-opacity"
          >
            <Download size={16} /> Download ZIP
          </button>
          <button 
            onClick={() => setBatchMockups([])}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-secondary/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batchMockups.map((src, i) => (
            <div key={i} className="aspect-square bg-card rounded-xl border border-border shadow-sm overflow-hidden group relative">
              <img src={src} alt={`Mockup ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                <a 
                  href={src} 
                  download={`mockup_${i+1}.jpg`}
                  className="bg-white/20 hover:bg-white/30 text-white w-32 py-2 rounded-lg backdrop-blur-md flex items-center justify-center gap-2 text-sm font-semibold transition-colors border border-white/20"
                >
                  <Download size={16} /> Save
                </a>
                <button
                  onClick={() => {
                    const newMockups = [...batchMockups];
                    newMockups.splice(i, 1);
                    setBatchMockups(newMockups);
                  }}
                  className="bg-rose-500/80 hover:bg-rose-500 text-white w-32 py-2 rounded-lg backdrop-blur-md flex items-center justify-center gap-2 text-sm font-semibold transition-colors border border-rose-400/50"
                  title="Remove this image from the batch"
                >
                  <X size={16} /> Discard
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-violet-600/10 border border-violet-500/20 rounded-xl p-6 text-center shadow-lg">
          <h3 className="text-violet-400 font-semibold mb-2">Want to change the texts?</h3>
          <p className="text-sm text-slate-300 mb-4 max-w-lg mx-auto">
            Close this review window to edit the "Features" and "What You Will Get" texts in the left sidebar, then click Generate again!
          </p>
          <button 
            onClick={() => setBatchMockups([])}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium border border-white/10 transition-colors"
          >
            Go Back & Edit Text
          </button>
        </div>
      </div>
    </div>
  )
}
