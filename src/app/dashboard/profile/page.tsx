import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Layers,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/auth";
import { getProfileData } from "@/lib/db/profile";
import { UserAvatar } from "@/components/layout/UserAvatar";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ProfilePage() {
  const session = await auth();
  const userId = session!.user.id;
  const profile = await getProfileData(userId);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* User Info */}
      <section className="flex items-center gap-5">
        <UserAvatar image={profile.image} name={profile.name} className="h-16 w-16 text-xl" />
        <div>
          <h1 className="text-xl font-semibold">{profile.name ?? "No name"}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Member since {formatDate(profile.createdAt)}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Usage
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md shrink-0"
              style={{ backgroundColor: "#3b82f618" }}
            >
              <Layers className="h-4 w-4" style={{ color: "#3b82f6" }} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{profile.totalItems}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-md shrink-0"
              style={{ backgroundColor: "#8b5cf618" }}
            >
              <FolderOpen className="h-4 w-4" style={{ color: "#8b5cf6" }} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{profile.totalCollections}</p>
              <p className="text-xs text-muted-foreground mt-1">Collections</p>
            </div>
          </div>
        </div>

        {/* Per-type breakdown */}
        <div className="rounded-lg border border-border bg-card divide-y divide-border">
          {profile.itemTypeCounts.map((type) => {
            const Icon = ICON_MAP[type.icon];
            return (
              <div
                key={type.name}
                className="flex items-center gap-3 px-4 py-3"
              >
                {Icon && (
                  <Icon className="h-4 w-4 shrink-0" style={{ color: type.color }} />
                )}
                <span className="flex-1 capitalize text-sm">{type.name}s</span>
                <span className="text-sm font-medium tabular-nums">{type.count}</span>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
