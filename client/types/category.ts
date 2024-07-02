import type { CloudinaryImage } from "./user";

export interface Category {
  _id: string;
  categoryName: string;
  categoryImg: CloudinaryImage;
}

export interface Subcategory {
  _id: string;
  subcategoryName: string;
  category: string;
  monthPercent: number;
  threeMonthPercent: number;
  sixMonthPercent: number;
  oneYearPercent: number;
  twoYearPercent: number;
}
