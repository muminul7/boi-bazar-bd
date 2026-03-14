import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RouteFallbackSkeleton() {
  return (
    <div className="min-h-[60vh] w-full px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-5/6 max-w-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BookCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border/70 shadow-brand-sm">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <CardContent className="space-y-3 p-5">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BooksPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero py-12">
        <div className="container mx-auto space-y-3 text-center">
          <Skeleton className="mx-auto h-4 w-28 bg-white/20" />
          <Skeleton className="mx-auto h-10 w-56 max-w-full bg-white/20" />
          <Skeleton className="mx-auto h-4 w-full max-w-xl bg-white/15" />
          <Skeleton className="mx-auto h-4 w-3/4 max-w-lg bg-white/10" />
        </div>
      </div>
      <div className="container mx-auto space-y-8 py-10">
        <div className="flex flex-col gap-4 md:flex-row">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-border pb-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <BookCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BookDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-hero">
        <div className="container mx-auto flex gap-2 py-4">
          <Skeleton className="h-4 w-16 bg-white/20" />
          <Skeleton className="h-4 w-4 bg-white/10" />
          <Skeleton className="h-4 w-20 bg-white/20" />
          <Skeleton className="h-4 w-4 bg-white/10" />
          <Skeleton className="h-4 w-40 bg-white/20" />
        </div>
      </div>
      <section className="container mx-auto py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          <div className="space-y-5 lg:col-span-2">
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Card className="border-border/70 shadow-brand-lg">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8 lg:col-span-3">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-11 w-5/6" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-36 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="border-border/70">
                  <CardContent className="space-y-3 p-4">
                    <Skeleton className="mx-auto h-5 w-5 rounded-full" />
                    <Skeleton className="mx-auto h-6 w-12" />
                    <Skeleton className="mx-auto h-3 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-7 w-52" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((__, itemIndex) => (
                    <Skeleton key={itemIndex} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function AdminLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen w-full">
        <aside className="hidden w-64 border-r border-border bg-card p-4 lg:block">
          <div className="space-y-4">
            <Skeleton className="h-10 w-40" />
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </aside>
        <div className="flex flex-1 flex-col">
          <header className="flex h-14 items-center border-b border-border bg-card px-4">
            <Skeleton className="h-6 w-40" />
          </header>
          <main className="flex-1 space-y-6 p-6">
            <Skeleton className="h-8 w-48" />
            <AdminTableSkeleton />
          </main>
        </div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <Card className="shadow-brand-sm">
      <CardContent className="p-6">
        <AdminTableContentSkeleton rows={rows} columns={columns} />
      </CardContent>
    </Card>
  );
}

export function AdminTableContentSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="grid gap-3 border-b border-border bg-muted/40 px-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-3/4" />
        ))}
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <Skeleton key={columnIndex} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="shadow-brand-sm">
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="shadow-brand-sm lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[260px] w-full rounded-xl" />
          </CardContent>
        </Card>
        <Card className="shadow-brand-sm">
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[260px] w-full rounded-xl" />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AdminTableSkeleton rows={4} columns={3} />
        <AdminTableSkeleton rows={4} columns={3} />
      </div>
    </div>
  );
}

export function AdminSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="shadow-brand-sm">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
