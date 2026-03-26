export type ListingStatus = 'published' | 'draft' | 'processing';

export interface Listing {
  id: string;
  title: string;
  niche: string;
  status: ListingStatus;
  price: number;
  seoScore: number;
  views: number;
  sales: number;
  thumbnail: string; // gradient CSS string used as placeholder
  createdAt: string;
}

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Creative Director Resume',
    niche: 'Creative Director',
    status: 'published',
    price: 7.99,
    seoScore: 92,
    views: 1204,
    sales: 38,
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    createdAt: '2026-03-10',
  },
  {
    id: '2',
    title: 'UX Designer Portfolio Resume',
    niche: 'UX Designer',
    status: 'published',
    price: 6.99,
    seoScore: 88,
    views: 876,
    sales: 21,
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    createdAt: '2026-03-12',
  },
  {
    id: '3',
    title: 'Software Engineer Modern CV',
    niche: 'Software Engineer',
    status: 'published',
    price: 8.49,
    seoScore: 95,
    views: 2103,
    sales: 67,
    thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    createdAt: '2026-03-08',
  },
  {
    id: '4',
    title: 'Marketing Manager Resume Template',
    niche: 'Marketing Manager',
    status: 'draft',
    price: 6.49,
    seoScore: 74,
    views: 0,
    sales: 0,
    thumbnail: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    createdAt: '2026-03-20',
  },
  {
    id: '5',
    title: 'Data Scientist Resume Bundle',
    niche: 'Data Scientist',
    status: 'processing',
    price: 9.99,
    seoScore: 81,
    views: 0,
    sales: 0,
    thumbnail: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    createdAt: '2026-03-25',
  },
  {
    id: '6',
    title: 'Product Manager Executive CV',
    niche: 'Product Manager',
    status: 'draft',
    price: 7.49,
    seoScore: 69,
    views: 0,
    sales: 0,
    thumbnail: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    createdAt: '2026-03-26',
  },
];

export const listingStats = {
  totalListings: mockListings.length,
  published: mockListings.filter((l) => l.status === 'published').length,
  totalRevenue: mockListings.reduce((sum, l) => sum + l.sales * l.price, 0),
  totalViews: mockListings.reduce((sum, l) => sum + l.views, 0),
};
