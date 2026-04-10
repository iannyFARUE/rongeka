"use client";

import { Star, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCollectionActions } from "@/hooks/useCollectionActions";
import CollectionEditDeleteDialogs from "./CollectionEditDeleteDialogs";

interface Props {
  collectionId: string;
  collectionName: string;
  collectionDescription: string | null;
  isFavorite: boolean;
}

export default function CollectionDetailActions({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite,
}: Props) {
  const router = useRouter();
  const actions = useCollectionActions({
    collectionId,
    collectionName,
    collectionDescription,
    isFavorite,
    onDeleted: () => router.push("/dashboard/collections"),
  });

  return (
    <>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={actions.openEdit} title="Edit collection">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={actions.handleToggleFavorite}
          title={actions.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className="h-4 w-4"
            style={actions.isFavorite ? { fill: "#fde047", color: "#fde047" } : {}}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => actions.setDeleteOpen(true)}
          title="Delete collection"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <CollectionEditDeleteDialogs collectionName={collectionName} actions={actions} />
    </>
  );
}
