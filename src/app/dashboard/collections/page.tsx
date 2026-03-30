import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCollections } from "@/lib/db/collections";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import CollectionCard from "@/components/collections/CollectionCard";
import Pagination from "@/components/ui/Pagination";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const session = await auth();
  const userId = session!.user.id;
  const { collections, totalCount } = await getCollections(userId, { page, limit: COLLECTIONS_PER_PAGE });
  const totalPages = Math.ceil(totalCount / COLLECTIONS_PER_PAGE);
  if (totalCount > 0 && page > totalPages) redirect(`/dashboard/collections?page=${totalPages}`);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold">Collections</h1>
        <span className="text-sm text-muted-foreground tabular-nums">
          {totalCount} {totalCount === 1 ? "collection" : "collections"}
        </span>
      </div>

      {totalCount === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
