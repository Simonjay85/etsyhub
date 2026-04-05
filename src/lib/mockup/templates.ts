export type TextLayer = {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  align: 'left' | 'center' | 'right';
  fontWeight: string;
  shadowBlur?: number;
  shadowColor?: string;
  backgroundColor?: string;
  padding?: number;
};

export type TemplateType = 'standard' | 'hero' | 'stacked' | 'features' | 'lifestyle' | 'floral' | 'cleandesk' | 'splitcolor';

export type MockupTemplate = {
  id: string;
  backgroundUrl: string;
  templateType: TemplateType;
  screen: { x: number; y: number; width: number; height: number; radius: number };
  frame: { x: number; y: number; width: number; height: number; radius: number; color: string; borderSize: number };
  texts: TextLayer[];
  showBestSeller: boolean;
};

const BACKGROUNDS = Array.from({ length: 10 }).map((_, i) => `/mockups/bg_${i + 1}.png`);
const DUMMY_RECT = { x: 0, y: 0, width: 0, height: 0, radius: 0 };
const DUMMY_FRAME = { ...DUMMY_RECT, color: '#000', borderSize: 0 };

// 10 templates: 7 special + 3 standard iPad
const SPECIAL_TEMPLATES: Array<{ id: string; type: TemplateType }> = [
  { id: 'hero_thumbnail',   type: 'hero' },
  { id: 'stacked_pages',    type: 'stacked' },
  { id: 'features_callout', type: 'features' },
  { id: 'lifestyle_desk',   type: 'lifestyle' },
  { id: 'floral_pink',      type: 'floral' },
  { id: 'clean_desk',       type: 'cleandesk' },
  { id: 'split_color',      type: 'splitcolor' },
];

export const MOCKUP_TEMPLATES: MockupTemplate[] = Array.from({ length: 10 }).map((_, i) => {
  // First 7 are special templates
  if (i < SPECIAL_TEMPLATES.length) {
    return {
      id: SPECIAL_TEMPLATES[i].id,
      backgroundUrl: BACKGROUNDS[i],
      templateType: SPECIAL_TEMPLATES[i].type,
      screen: DUMMY_RECT,
      frame: DUMMY_FRAME,
      texts: [],
      showBestSeller: false,
    };
  }

  // #8-10 — Standard iPad mockups
  const isAltLayout = i % 2 === 0;
  const sw = 1400;
  const sh = 960;
  const xOffset = isAltLayout ? 0 : 50;
  const yOffset = isAltLayout ? 100 : 150;
  
  return {
    id: `template_${i + 1}`,
    backgroundUrl: BACKGROUNDS[i],
    templateType: 'standard' as TemplateType,
    screen: {
      x: 1000 - sw / 2 + xOffset,
      y: 1000 - sh / 2 + yOffset,
      width: sw, height: sh, radius: 12,
    },
    frame: {
      x: 1000 - (sw + 80) / 2 + xOffset,
      y: 1000 - (sh + 80) / 2 + yOffset,
      width: sw + 80, height: sh + 80, radius: 40,
      color: '#1a1a1a', borderSize: 4,
    },
    texts: [
      {
        text: 'CUTE DIGITAL PLANNER',
        x: 1000 + xOffset, y: yOffset > 0 ? 200 : 150,
        fontSize: 100, fontFamily: 'sans-serif', fontWeight: '900',
        fill: '#ffffff', align: 'center',
        shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.4)',
      },
      {
        text: 'Ready to use, easy edit in Canva',
        x: 1000 + xOffset, y: (yOffset > 0 ? 200 : 150) + 120,
        fontSize: 45, fontFamily: 'sans-serif', fontWeight: '600',
        fill: '#ffffff', align: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', padding: 20,
      },
    ],
    showBestSeller: i % 3 === 0,
  };
});
