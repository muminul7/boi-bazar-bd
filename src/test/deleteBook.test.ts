import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { Database } from "@/integrations/supabase/types";
import { deleteBookWithDependencies } from "@/pages/admin/deleteBook";

function createSupabaseMock(options?: {
  detachOrdersError?: string;
  deleteBookError?: string;
}) {
  const ordersEq = vi.fn().mockResolvedValue({
    error: options?.detachOrdersError ? { message: options.detachOrdersError } : null,
  });
  const ordersUpdate = vi.fn(() => ({ eq: ordersEq }));
  const booksEq = vi.fn().mockResolvedValue({
    error: options?.deleteBookError ? { message: options.deleteBookError } : null,
  });
  const booksDelete = vi.fn(() => ({ eq: booksEq }));

  const from = vi.fn((table: string) => {
    if (table === "orders") {
      return { update: ordersUpdate };
    }

    if (table === "books") {
      return { delete: booksDelete };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    supabase: { from } as unknown as SupabaseClient<Database>,
    from,
    ordersUpdate,
    ordersEq,
    booksDelete,
    booksEq,
  };
}

describe("deleteBookWithDependencies", () => {
  it("detaches dependent orders before deleting the book", async () => {
    const { supabase, from, ordersUpdate, ordersEq, booksDelete, booksEq } = createSupabaseMock();

    await deleteBookWithDependencies(supabase, "book-123");

    expect(from).toHaveBeenNthCalledWith(1, "orders");
    expect(ordersUpdate).toHaveBeenCalledWith({ book_id: null });
    expect(ordersEq).toHaveBeenCalledWith("book_id", "book-123");
    expect(from).toHaveBeenNthCalledWith(2, "books");
    expect(booksDelete).toHaveBeenCalledTimes(1);
    expect(booksEq).toHaveBeenCalledWith("id", "book-123");
  });

  it("surfaces order-detach failures and skips the delete", async () => {
    const { supabase, booksDelete } = createSupabaseMock({
      detachOrdersError: "permission denied",
    });

    await expect(deleteBookWithDependencies(supabase, "book-123")).rejects.toThrow(
      "Could not detach existing orders: permission denied",
    );
    expect(booksDelete).not.toHaveBeenCalled();
  });
});
