import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapDbBookToBook, type Book } from "@/data/books";

export function useBooks() {
  return useQuery<Book[]>({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapDbBookToBook);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useBook(slug: string | undefined) {
  return useQuery<Book | null>({
    queryKey: ["book", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data ? mapDbBookToBook(data) : null;
    },
    enabled: !!slug,
  });
}
