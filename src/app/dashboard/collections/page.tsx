import { auth } from "@/auth";
import { getCollections } from "@/lib/db/collections";
import CollectionCard from "@/components/collections/CollectionCard";

export default async function CollectionsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const collections = await getCollections(userId);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold">Collections</h1>
        <span className="text-sm text-muted-foreground tabular-nums">
          {collections.length} {collections.length === 1 ? "collection" : "collections"}
        </span>
      </div>

      {collections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((col) => (
            <CollectionCard key={col.id} collection={col} />
          ))}
        </div>
      )}
    </div>
  );
}
