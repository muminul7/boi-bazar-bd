// Book interface — shared across the app
// Data is now fetched from the database, not hardcoded here.

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  cover: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  category: string;
  tags: string[];
  featured: boolean;
  bestSeller: boolean;
  newRelease: boolean;
  description: string;
  shortDescription: string;
  outcomes: string[];
  chapters: { title: string; topics: string[] }[];
  suitableFor: string[];
  pages: number;
  format: string;
  language: string;
  publishedDate: string;
  previewPages: { pageNumber: number; content: string }[];
  reviews: {
    name: string;
    avatar: string;
    rating: number;
    text: string;
    date: string;
    verified: boolean;
  }[];
  faq: { question: string; answer: string }[];
}

export function mapDbBookToBook(db: any): Book {
  return {
    id: db.id,
    slug: db.slug,
    title: db.title,
    subtitle: db.subtitle || "",
    author: db.author,
    cover: db.cover_url || "",
    price: db.price || 0,
    originalPrice: db.original_price || db.price || 0,
    rating: Number(db.rating) || 0,
    reviewCount: db.review_count || 0,
    category: db.category || "",
    tags: db.tags || [],
    featured: db.featured || false,
    bestSeller: db.best_seller || false,
    newRelease: db.new_release || false,
    description: db.description || "",
    shortDescription: db.short_description || "",
    outcomes: db.outcomes || [],
    chapters: (db.chapters as any[]) || [],
    suitableFor: db.suitable_for || [],
    pages: db.pages || 0,
    format: db.format || "PDF",
    language: db.language || "বাংলা",
    publishedDate: db.published_date || "",
    previewPages: [],
    reviews: ((db.reviews as any[]) || []).map((r: any) => ({
      name: r.name || "",
      avatar: r.name ? r.name.charAt(0) : "",
      rating: r.rating || 5,
      text: r.comment || r.text || "",
      date: r.date || "",
      verified: r.verified || false,
    })),
    faq: (db.faq as any[]) || [],
  };
}
