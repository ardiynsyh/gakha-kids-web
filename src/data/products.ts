import productsData from './products.json';

export interface Product {
  id: number;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  tag?: string;
  color: string;
  categories?: string[];
  details?: string;
  linktreeUrl?: string;
  rating?: number;
  reviews?: number;
}

export const products: Product[] = productsData as Product[];
