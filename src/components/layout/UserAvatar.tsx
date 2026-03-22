import { cn } from "@/lib/utils";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  className?: string;
}

export function UserAvatar({ image, name, className }: UserAvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
