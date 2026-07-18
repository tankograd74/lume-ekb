import pricesData from "./prices.json";

export type PriceItem = {
  name: string;
  description: string | null;
  price: number;
};

export type ServiceCategory = {
  id: string;
  name: string;
  desc: string;
  items: PriceItem[];
};

type PricesFile = {
  source: string;
  currency: string;
  updated_at: string;
  categories_count: number;
  items_count: number;
  categories: ServiceCategory[];
};

const data = pricesData as PricesFile;

export const PRICES_META = {
  source: data.source,
  updatedAt: data.updated_at,
  categoriesCount: data.categories_count,
  itemsCount: data.items_count,
};

export const SERVICE_CATEGORIES: ServiceCategory[] = data.categories;

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}
