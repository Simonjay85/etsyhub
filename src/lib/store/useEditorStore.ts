import { create } from 'zustand'

export type TextDetectionBlock = {
  id: string
  originalText: string
  replacementText: string
  x: number
  y: number
  width: number
  height: number
  confidence: number
  hidden: boolean
}

export type ImageAnalysisResult = {
  width: number
  height: number
  aspectRatio: number
  sharpness: 'low' | 'medium' | 'high'
  brightness: 'dark' | 'normal' | 'bright'
  textRegions: TextDetectionBlock[]
  watermarkPlacement: 'bottom-center' | 'bottom-left' | 'bottom-right'
}

export type EnhancementSettings = {
  upscale: boolean
  lightColorCorrection: boolean
  toneEnhancement: boolean
  sharpenDetails: boolean
  preserveMood: boolean
  intensity: number 
}

export type BackgroundSettings = {
  mode: 'keep' | 'clean' | 'replace'
  prompt?: string
}

export type TextSettings = {
  refineVisible: boolean
  keepMeaning: boolean
  improveSpacing: boolean
  removeUnwanted: boolean
  replaceBrand: boolean
  removeTemplyHeadline: boolean
  replacePlrResell: boolean
  plrReplacementText: string
}

export type WatermarkSettings = {
  enabled: boolean
  position: 'bottom-center' | 'bottom-left' | 'bottom-right'
  size: number
  opacity: number
  embossDepth: number
  adaptiveContrast: boolean
}

export type ImageItem = {
  id: string
  file: File
  src: string
  width: number
  height: number
}

export type EditorState = {
  images: ImageItem[]
  activeImageId: string | null

  // Current active image state
  sourceImage: ImageItem | null
  analysis: ImageAnalysisResult | null
  preview: { status: 'idle' | 'generating' | 'success' | 'error'; src: string | null }
  
  // AI Integration State
  isProcessingAI: boolean
  aiImageUrl: string | null
  setAiProcessing: (status: boolean) => void
  setAiImageUrl: (url: string | null) => void
  
  settings: {
    enhancement: EnhancementSettings
    background: BackgroundSettings
    text: TextSettings
    watermark: WatermarkSettings
  }
  
  ui: {
    activePanel: string
    compareMode: boolean
    zoom: number
  }
  
  // Batch Mockups
  batchMockups: string[]
  isBatchGenerating: boolean
  infographicText: string
  youWillGetText: string
  showcaseTitle: string
  showcaseSubtitle: string
  fileFormats: string
  paperSizes: string
  setBatchMockups: (mockups: string[]) => void
  setBatchGenerating: (isGenerating: boolean) => void
  setInfographicText: (text: string) => void
  setYouWillGetText: (text: string) => void
  setShowcaseTitle: (text: string) => void
  setShowcaseSubtitle: (text: string) => void
  setFileFormats: (text: string) => void
  setPaperSizes: (text: string) => void
  productStyle: 'digital-planner' | 'planner-utility' | 'composite'
  setProductStyle: (style: 'digital-planner' | 'planner-utility' | 'composite') => void

  addImages: (newImages: ImageItem[]) => void
  setActiveImage: (id: string, analysis?: ImageAnalysisResult) => void
  removeImage: (id: string) => void

  setAnalysis: (analysis: ImageAnalysisResult) => void
  updateEnhancementSettings: (settings: Partial<EnhancementSettings>) => void
  updateBackgroundSettings: (settings: Partial<BackgroundSettings>) => void
  updateTextSettings: (settings: Partial<TextSettings>) => void
  updateWatermarkSettings: (settings: Partial<WatermarkSettings>) => void
  updateTextBlock: (id: string, updates: Partial<TextDetectionBlock>) => void
  setPreview: (status: EditorState['preview']['status'], src?: string) => void
  setUI: (ui: Partial<EditorState['ui']>) => void
  reset: () => void
}

const defaultSettings = {
  enhancement: {
    upscale: true,
    lightColorCorrection: true,
    toneEnhancement: true,
    sharpenDetails: false,
    preserveMood: true,
    intensity: 50
  },
  background: {
    mode: 'keep' as const,
  },
  text: {
    refineVisible: true,
    keepMeaning: true,
    improveSpacing: true,
    removeUnwanted: true,
    replaceBrand: true,
    removeTemplyHeadline: true,
    replacePlrResell: true,
    plrReplacementText: 'PREMIUM TEMPLATE'
  },
  watermark: {
    enabled: true,
    position: 'bottom-center' as const,
    size: 50,
    opacity: 80,
    embossDepth: 50,
    adaptiveContrast: true
  }
}

export const useEditorStore = create<EditorState>((set) => ({
  images: [],
  activeImageId: null,
  sourceImage: null,
  analysis: null,
  settings: JSON.parse(JSON.stringify(defaultSettings)),
  preview: { status: 'idle', src: null },
  isProcessingAI: false,
  aiImageUrl: null,
  batchMockups: [],
  isBatchGenerating: false,
  productStyle: 'digital-planner' as ('digital-planner' | 'planner-utility' | 'composite'),
  infographicText: '🌟 Features:\n- Premium Template\n- Editable in Canva\n- Instant Download',
  youWillGetText: '🎁 WHAT YOU WILL GET:\n- 1x PDF Planner\n- 500+ Digital Stickers\n- Covers & Widgets',
  showcaseTitle: 'All-In-One Digital Planner',
  showcaseSubtitle: '2026 - LANDSCAPE',
  fileFormats: 'PDF',
  paperSizes: 'A4 & LETTER',
  ui: {
    activePanel: 'enhancement',
    compareMode: false,
    zoom: 100
  },

  setBatchMockups: (mockups) => set({ batchMockups: mockups }),
  setBatchGenerating: (isGenerating) => set({ isBatchGenerating: isGenerating }),
  setProductStyle: (style) => set({ productStyle: style }),
  setInfographicText: (text) => set({ infographicText: text }),
  setYouWillGetText: (text) => set({ youWillGetText: text }),
  setShowcaseTitle: (text) => set({ showcaseTitle: text }),
  setShowcaseSubtitle: (text) => set({ showcaseSubtitle: text }),
  setFileFormats: (text) => set({ fileFormats: text }),
  setPaperSizes: (text) => set({ paperSizes: text }),

  addImages: (newImages) => set((state) => {
    const combined = [...state.images, ...newImages]
    if (combined.length > 0 && !state.activeImageId) {
      return { 
        images: combined,
        activeImageId: combined[0].id,
        sourceImage: combined[0],
        preview: { status: 'idle', src: null },
        analysis: null
      }
    }
    return { images: combined }
  }),

  setActiveImage: (id, analysis) => set((state) => {
    const img = state.images.find(img => img.id === id) || null
    return {
      activeImageId: id,
      sourceImage: img,
      preview: { status: 'idle', src: null },
      analysis: analysis || null
    }
  }),

  removeImage: (id) => set((state) => {
    const remaining = state.images.filter(img => img.id !== id)
    let newActiveId = state.activeImageId
    let newSourceImg = state.sourceImage

    if (state.activeImageId === id) {
      newActiveId = remaining.length > 0 ? remaining[0].id : null
      newSourceImg = remaining.length > 0 ? remaining[0] : null
    }
    return {
      images: remaining,
      activeImageId: newActiveId,
      sourceImage: newSourceImg,
      preview: newActiveId === id ? { status: 'idle', src: null } : state.preview,
      analysis: newActiveId === id ? null : state.analysis
    }
  }),
  
  setAnalysis: (analysis) => set({ analysis }),
  
  setAiProcessing: (status) => set({ isProcessingAI: status }),
  setAiImageUrl: (url) => set({ aiImageUrl: url }),
  
  updateEnhancementSettings: (updates) => set((state) => ({
    settings: { ...state.settings, enhancement: { ...state.settings.enhancement, ...updates } }
  })),
  
  updateBackgroundSettings: (updates) => set((state) => ({
    settings: { ...state.settings, background: { ...state.settings.background, ...updates } }
  })),
  
  updateTextSettings: (updates) => set((state) => ({
    settings: { ...state.settings, text: { ...state.settings.text, ...updates } }
  })),
  
  updateWatermarkSettings: (updates) => set((state) => ({
    settings: { ...state.settings, watermark: { ...state.settings.watermark, ...updates } }
  })),

  updateTextBlock: (id, updates) => set((state) => {
    if (!state.analysis) return state
    return {
      analysis: {
        ...state.analysis,
        textRegions: state.analysis.textRegions.map(tb => 
          tb.id === id ? { ...tb, ...updates } : tb
        )
      }
    }
  }),
  
  setPreview: (status, src) => set((state) => ({
    preview: { status, src: src !== undefined ? src : state.preview.src }
  })),
  
  setUI: (updates) => set((state) => ({
    ui: { ...state.ui, ...updates }
  })),

  reset: () => set({
    images: [],
    activeImageId: null,
    sourceImage: null,
    analysis: null,
    settings: JSON.parse(JSON.stringify(defaultSettings)),
    preview: { status: 'idle', src: null },
    isProcessingAI: false,
    aiImageUrl: null,
    batchMockups: [],
    isBatchGenerating: false,
    infographicText: '🌟 Features:\n- Premium Template\n- Editable in Canva\n- Instant Download',
    youWillGetText: '🎁 WHAT YOU WILL GET:\n- 1x PDF Planner\n- 500+ Digital Stickers\n- Covers & Widgets',
    showcaseTitle: 'All-In-One Digital Planner',
    showcaseSubtitle: '2026 - LANDSCAPE',
    fileFormats: 'PDF',
    paperSizes: 'A4 & LETTER',
    ui: { activePanel: 'enhancement', compareMode: false, zoom: 100 }
  })
}))
