export interface TrendingProduct {
  id: string;
  title: string;
  shopName: string;
  shopLink: string;
  productLink: string;
  estimatedRevenue: number;
  sales: number;
  thumbnail: string;
}

export interface TrendingKeyword {
  id: string;
  keyword: string;
  searchVolume: number;
  trendPercentage: number;
  competition: 'Low' | 'Medium' | 'High';
}

// Sample data only: links open an Etsy search for the product, not a specific listing.
function generateMockProducts(count: number, baseRevenue: number, offset = 0): TrendingProduct[] {
  const titles = [
    'That Girl Digital Planner, iPad Goodnotes Planner',
    'Kawaii Sticker Bundle, Pre-cropped Goodnotes Stickers',
    'ADHD Digital Planner, Neurodivergent iPad Journal',
    'Dark Mode Minimalist Notebook, Notability Template',
    'Fitness & Meal Prep Digital Journal, iPad Tracker',
    'Student Setup Digital Planner, High School & College',
    'Aesthetic Budget Planner, Digital Finance Tracker',
    'Reading Journal for iPad, Book Tracker Goodnotes',
    'Self Care Digital Journal, Therapy Notebook',
    'Minimalist Recipe Book, Digital Cook Book Goodnotes'
  ];
  
  const shops = ['DaisyFlow', 'TemplyStudio', 'PaperlessAesthetic', 'TheDigitalGirl', 'KawaiiPlans'];
  
  return Array.from({ length: Math.min(count, titles.length) }).map((_, i) => ({
    id: `prod_${baseRevenue}_${i}`,
    title: titles[(i + offset) % titles.length],
    shopName: shops[(i + offset) % shops.length],
    shopLink: `https://www.etsy.com/search?q=${encodeURIComponent(shops[(i + offset) % shops.length])}`,
    productLink: `https://www.etsy.com/search?q=${encodeURIComponent(titles[(i + offset) % titles.length].split(',')[0])}`,
    estimatedRevenue: baseRevenue - (i * (baseRevenue / 20)),
    sales: Math.floor((baseRevenue - (i * (baseRevenue / 20))) / 15),
    thumbnail: `/thumbnails/thumb_${(i % 3) + 1}.png`
  }));
}

export const dailyTrends = generateMockProducts(10, 850);
export const weeklyTrends = generateMockProducts(10, 5400, 3);
export const monthlyTrends = generateMockProducts(10, 24500, 6);

export const topKeywords: TrendingKeyword[] = [
  { id: 'k1', keyword: 'undated digital planner', searchVolume: 125000, trendPercentage: 15.4, competition: 'High' },
  { id: 'k2', keyword: 'goodnotes planner', searchVolume: 95000, trendPercentage: 8.2, competition: 'High' },
  { id: 'k3', keyword: 'adhd digital planner', searchVolume: 45000, trendPercentage: 35.6, competition: 'Medium' },
  { id: 'k4', keyword: 'dark mode journal', searchVolume: 28000, trendPercentage: 22.1, competition: 'Low' },
  { id: 'k5', keyword: 'reading tracker ipad', searchVolume: 32000, trendPercentage: -5.4, competition: 'Medium' },
  { id: 'k6', keyword: 'kawaii digital stickers', searchVolume: 65000, trendPercentage: 12.0, competition: 'High' },
  { id: 'k7', keyword: 'that girl planner', searchVolume: 88000, trendPercentage: 45.8, competition: 'Medium' },
  { id: 'k8', keyword: 'student digital planner', searchVolume: 110000, trendPercentage: -12.4, competition: 'High' },
];
