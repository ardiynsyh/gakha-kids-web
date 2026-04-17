import productsData from './products.json';

export interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  image2?: string;
  image3?: string;
  image4?: string;
  tag?: string;
  color: string;
  categories?: string[];
  details?: string;
  linktreeUrl?: string;
  rating?: number;
  reviews?: number;
  sizes?: string[];
  inventory?: Record<string, number>;
  weight?: number;
  sold?: number;
}

export const products: Product[] = productsData as Product[];
