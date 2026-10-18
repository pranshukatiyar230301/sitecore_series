import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export function useCategories() {
  return useQuery<Category[]>({ queryKey: ["/api/categories"], staleTime: 60_000 });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
