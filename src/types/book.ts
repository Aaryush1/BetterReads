export interface Book {
  googleBookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  pageCount: number | null;
  publishedDate: string | null;
  genre: string | null;
  isbn: string | null;
}

export interface Shelf {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  position: number;
}

export interface UserBook {
  id: string;
  googleBookId: string;
  shelfId: string;
  shelf?: Shelf;
  rating: number | null;
  coverUrl: string | null;
  title: string;
  author: string | null;
  addedAt: string;
  updatedAt: string;
}

export type Rating = 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
