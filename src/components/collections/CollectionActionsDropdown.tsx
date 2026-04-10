"use client";

import { Star, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCollectionActions } from "@/hooks/useCollectionActions";
import CollectionEditDeleteDialogs from "./CollectionEditDeleteDialogs";

interface Props {
  collectionId: string;
  collectionName: string;
  collectionDescription: string | null;
  isFavorite: boolean;
  onDeleted?: () => void;
}

export default function CollectionActionsDropdown({
  collectionId,
  collectionName,
  collectionDescription,
  isFavorite,
  onDeleted,
}: Props) {
  const actions = useCollectionActions({
    collectionId,
    collectionName,
    collectionDescription,
    isFavorite,
    onDeleted,
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-accent transition-colors">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Collection actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={actions.openEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={actions.handleToggleFavorite}>
            <Star
              className="mr-2 h-4 w-4"
              style={actions.isFavorite ? { fill: "#fde047", color: "#fde047" } : {}}
            />
            {actions.isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => actions.setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CollectionEditDeleteDialogs collectionName={collectionName} actions={actions} />
    </>
  );
}
