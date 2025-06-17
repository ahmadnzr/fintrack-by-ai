
"use client"; // This map will be used by client components

import {
  Briefcase, Gift, ShoppingCart, Utensils, Car, Receipt, Home, Film, HeartPulse, BookOpen, Tag,
  type LucideProps
} from 'lucide-react';
import type { ElementType } from 'react';

interface IconMap {
  [key: string]: ElementType<LucideProps>;
}

export const iconMap: IconMap = {
  Briefcase,
  Gift,
  ShoppingCart,
  Utensils,
  Car,
  Receipt,
  Home,
  Film,
  HeartPulse,
  BookOpen,
  Tag,
};

export const getIconComponent = (iconName?: string): ElementType<LucideProps> => {
  if (iconName && iconMap[iconName]) {
    return iconMap[iconName];
  }
  return Tag; // Default icon if name is not found or undefined
};
