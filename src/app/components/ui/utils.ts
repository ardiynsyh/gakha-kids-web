import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateDiscountBadge(price: string, originalPrice?: string): string | null {
  if (!originalPrice) return null;
  const p = parseInt(price.replace(/\D/g, ''));
  const op = parseInt(originalPrice.replace(/\D/g, ''));
  if (isNaN(p) || isNaN(op) || op <= p || op === 0) return null;
  const discount = Math.round(((op - p) / op) * 100);
  return `-${discount}%`;
}
