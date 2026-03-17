import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function deleteBookWithDependencies(
  supabase: SupabaseClient<Database>,
  bookId: string,
) {
  const { error: detachOrdersError } = await supabase
    .from("orders")
    .update({ book_id: null })
    .eq("book_id", bookId);

  if (detachOrdersError) {
    throw new Error(`Could not detach existing orders: ${detachOrdersError.message}`);
  }

  const { error: deleteBookError } = await supabase
    .from("books")
    .delete()
    .eq("id", bookId);

  if (deleteBookError) {
    throw new Error(deleteBookError.message);
  }
}
