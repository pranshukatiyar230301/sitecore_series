import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function usePosts(category?: string) {
  return useQuery({
    queryKey: [api.posts.list.path, category],
    queryFn: async () => {
      const url = new URL(api.posts.list.path, window.location.origin);
      if (category) {
        url.searchParams.append('category', category);
      }
      const token = typeof window !== "undefined" ? localStorage.getItem("ss_admin_token") : null;
      const headers: Record<string, string> = token ? { "x-admin-token": token } : {};
      const res = await fetch(url.toString(), { credentials: "include", headers });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.posts.list.responses[200].parse(await res.json());
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: [api.posts.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.posts.get.path, { slug });
      const token = typeof window !== "undefined" ? localStorage.getItem("ss_admin_token") : null;
      const headers: Record<string, string> = token ? { "x-admin-token": token } : {};
      const res = await fetch(url, { credentials: "include", headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch post");
      return api.posts.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
