import { useState, useRef, useEffect } from 'react'
import { useEditorStore } from '@/lib/store/useEditorStore'

export function CompareSlider() {
  const { sourceImage, preview } = useEditorStore()
  const [sliderPos, setSliderPos] = useState(50)
  const isDragging = useRef(false)
  
  if (!sourceImage) return null

  const handleMove = (x: number, width: number) => {
    let pos = (x / width) * 100
    if (pos < 0) pos = 0
    if (pos > 100) pos = 100
    setSliderPos(pos)
  }

  const onPointerDown = () => { isDragging.current = true }
  
  const onPointerUp = () => { isDragging.current = false }
  
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    handleMove(e.clientX - rect.left, rect.width)
  }

  return (
    <div 
      className="relative select-none overflow-hidden max-w-full max-h-full aspect-auto flex items-center justify-center cursor-ew-resize rounded-lg shadow-xl"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{
        aspectRatio: `${sourceImage.width} / ${sourceImage.height}`,
        width: 'auto',
        height: 'auto',
        maxWidth: '100%',
        maxHeight: '100%'
      }}
    >
      {/* Base Original Image */}
      <img 
        src={sourceImage.src} 
        alt="Original" 
        className="block w-full h-full object-contain pointer-events-none" 
      />
      
      {/* Overlay Enhanced Image */}
      {preview.src && (
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img 
            src={preview.src} 
            alt="Enhanced" 
            className="block w-full h-full object-contain" 
          />
        </div>
      )}

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-ew-resize flex items-center justify-center drop-shadow-md touch-none"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-6 h-6 bg-white rounded-full shadow border flex items-center justify-center">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
            <div className="w-0.5 h-3 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute bottom-4 left-4 z-20 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white font-medium uppercase tracking-wider pointer-events-none transition-opacity opacity-0 hover:opacity-100 group-hover:opacity-100">Original</div>
      <div className="absolute bottom-4 right-4 z-20 px-2 py-1 bg-indigo-600/80 backdrop-blur-md rounded text-[10px] text-white font-medium uppercase tracking-wider pointer-events-none transition-opacity opacity-0 hover:opacity-100 group-hover:opacity-100">Enhanced</div>
    </div>
  )
}
