import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  // ─── Demo User ───────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@rongeka.io" },
    update: {},
    create: {
      email: "demo@rongeka.io",
      name: "Demo User",
      password: hashedPassword,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  // Delete existing items and collections so the seed is safe to re-run without duplicates
  await prisma.item.deleteMany({ where: { userId: user.id } });
  await prisma.collection.deleteMany({ where: { userId: user.id } });
  console.log("✓ Cleared existing items and collections for demo user");

  console.log("✓ Demo user seeded:", user.email);

  // ─── System Item Types ───────────────────────────────────────────
  const typeDefinitions = [
    { name: "snippet", icon: "Code", color: "#3b82f6" },
    { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
    { name: "command", icon: "Terminal", color: "#f97316" },
    { name: "note", icon: "StickyNote", color: "#fde047" },
    { name: "file", icon: "File", color: "#6b7280" },
    { name: "image", icon: "Image", color: "#ec4899" },
    { name: "link", icon: "Link", color: "#10b981" },
  ];

  const itemTypes: Record<string, { id: string }> = {};

  for (const def of typeDefinitions) {
    const existing = await prisma.itemType.findFirst({
      where: { name: def.name, isSystem: true },
    });
    const type = existing
      ? await prisma.itemType.update({
          where: { id: existing.id },
          data: { icon: def.icon, color: def.color },
        })
      : await prisma.itemType.create({
          data: { name: def.name, icon: def.icon, color: def.color, isSystem: true, userId: null },
        });
    itemTypes[def.name] = type;
  }

  console.log("✓ System item types seeded:", Object.keys(itemTypes).join(", "));

  // ─── Helper ──────────────────────────────────────────────────────
  async function createItem(data: {
    title: string;
    description?: string;
    content?: string;
    language?: string;
    url?: string;
    contentType: "TEXT" | "URL" | "FILE";
    typeName: string;
    tags?: string[];
    isFavorite?: boolean;
    isPinned?: boolean;
  }) {
    const tags = data.tags ?? [];
    // Create tags sequentially to avoid unique constraint races
    for (const name of tags) {
      await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
    }
    return prisma.item.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        language: data.language,
        url: data.url,
        contentType: data.contentType,
        isFavorite: data.isFavorite ?? false,
        isPinned: data.isPinned ?? false,
        lastUsedAt: new Date(),
        userId: user.id,
        itemTypeId: itemTypes[data.typeName].id,
        tags: { connect: tags.map((name) => ({ name })) },
      },
    });
  }

  // ─── React Patterns Collection ───────────────────────────────────
  const reactPatterns = await prisma.collection.create({
    data: {
      name: "React Patterns",
      description: "Reusable React patterns and hooks",
      isFavorite: true,
      userId: user.id,
    },
  });

  const reactItem1 = await createItem({
    title: "useDebounce Hook",
    description: "Delays updating a value until after a specified wait time",
    contentType: "TEXT",
    typeName: "snippet",
    language: "typescript",
    tags: ["react", "hooks", "typescript"],
    isFavorite: true,
    isPinned: true,
    content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}`,
  });

  const reactItem2 = await createItem({
    title: "Context Provider Pattern",
    description: "Compound component pattern using React Context",
    contentType: "TEXT",
    typeName: "snippet",
    language: "typescript",
    tags: ["react", "context", "patterns"],
    content: `import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}`,
  });

  const reactItem3 = await createItem({
    title: "useLocalStorage Hook",
    description: "Persist state to localStorage with automatic JSON serialization",
    contentType: "TEXT",
    typeName: "snippet",
    language: "typescript",
    tags: ["react", "hooks", "storage"],
    content: `import { useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}`,
  });

  const reactItem4 = await createItem({
    title: "Next.js Dockerfile",
    description: "Multi-stage Dockerfile for a production Next.js app",
    contentType: "TEXT",
    typeName: "snippet",
    language: "dockerfile",
    tags: ["docker", "nextjs", "deployment"],
    content: `FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]`,
  });

  const reactItem5 = await createItem({
    title: "Tailwind CSS Docs",
    description: "Official Tailwind CSS v4 documentation",
    contentType: "URL",
    typeName: "link",
    tags: ["tailwind", "css", "docs"],
    url: "https://tailwindcss.com/docs",
  });

  await prisma.itemCollection.createMany({
    data: [reactItem1, reactItem2, reactItem3, reactItem4, reactItem5].map((item) => ({
      itemId: item.id,
      collectionId: reactPatterns.id,
    })),
    skipDuplicates: true,
  });

  console.log("✓ React Patterns collection seeded");

  // ─── AI Workflows Collection ─────────────────────────────────────
  const aiWorkflows = await prisma.collection.create({
    data: {
      name: "AI Workflows",
      description: "AI prompts and workflow automations",
      isFavorite: true,
      userId: user.id,
    },
  });

  const aiItem1 = await createItem({
    title: "Code Review Prompt",
    description: "Thorough code review focusing on correctness, performance and security",
    contentType: "TEXT",
    typeName: "prompt",
    tags: ["ai", "code-review", "prompt"],
    isFavorite: true,
    content: `You are a senior software engineer performing a code review. Review the following code and provide feedback on:

1. **Correctness** — Are there any bugs, edge cases, or logic errors?
2. **Performance** — Are there any unnecessary re-renders, N+1 queries, or inefficient algorithms?
3. **Security** — Are there any vulnerabilities (SQL injection, XSS, insecure auth, etc.)?
4. **Readability** — Is the code clear and maintainable?
5. **Patterns** — Does it follow the existing codebase conventions?

Be concise. For each issue, provide the line reference and a suggested fix.

\`\`\`
[PASTE CODE HERE]
\`\`\``,
  });

  const aiItem2 = await createItem({
    title: "Documentation Generator",
    description: "Generate clear JSDoc and inline comments for a function or module",
    contentType: "TEXT",
    typeName: "prompt",
    tags: ["ai", "documentation", "prompt"],
    content: `Generate comprehensive documentation for the following code. Include:

- A JSDoc comment block with @param, @returns, and @throws where applicable
- A brief description of what the function/module does
- Usage example in a code block
- Any important notes about edge cases or gotchas

Keep the documentation concise and developer-friendly.

\`\`\`
[PASTE CODE HERE]
\`\`\``,
  });

  const aiItem3 = await createItem({
    title: "Refactoring Assistant",
    description: "Refactor code to improve readability and maintainability without changing behavior",
    contentType: "TEXT",
    typeName: "prompt",
    tags: ["ai", "refactoring", "prompt"],
    content: `Refactor the following code to improve its quality. Rules:

- Do NOT change the external behavior or API
- Improve naming for clarity
- Extract repeated logic into helpers
- Simplify complex conditionals
- Remove unnecessary complexity
- Follow modern best practices for the language/framework

Show the refactored code and briefly explain each significant change.

\`\`\`
[PASTE CODE HERE]
\`\`\``,
  });

  await prisma.itemCollection.createMany({
    data: [aiItem1, aiItem2, aiItem3].map((item) => ({
      itemId: item.id,
      collectionId: aiWorkflows.id,
    })),
    skipDuplicates: true,
  });

  console.log("✓ AI Workflows collection seeded");

  // ─── Terminal Commands Collection ────────────────────────────────
  const terminal = await prisma.collection.create({
    data: {
      name: "Terminal Commands",
      description: "Useful shell commands for everyday development",
      userId: user.id,
    },
  });

  const termItem1 = await createItem({
    title: "Git: interactive rebase last N commits",
    description: "Squash, reorder, or edit the last N commits interactively",
    contentType: "TEXT",
    typeName: "command",
    tags: ["git", "rebase"],
    content: `git rebase -i HEAD~N`,
  });

  const termItem2 = await createItem({
    title: "Docker: remove all stopped containers and unused images",
    description: "Free up disk space by pruning Docker artifacts",
    contentType: "TEXT",
    typeName: "command",
    tags: ["docker", "cleanup"],
    content: `docker system prune -af`,
  });

  const termItem3 = await createItem({
    title: "Find and kill process on port",
    description: "Kill whatever is listening on a given port",
    contentType: "TEXT",
    typeName: "command",
    tags: ["process", "port", "kill"],
    content: `lsof -ti tcp:<PORT> | xargs kill -9`,
  });

  const termItem4 = await createItem({
    title: "npm: list outdated packages",
    description: "Show all packages that have newer versions available",
    contentType: "TEXT",
    typeName: "command",
    tags: ["npm", "packages"],
    content: `npm outdated`,
  });

  const termItem5 = await createItem({
    title: "Deploy to Production",
    description: "Run database migrations and restart the app in production",
    contentType: "TEXT",
    typeName: "command",
    tags: ["deployment", "prisma", "production"],
    content: `npx prisma migrate deploy && pm2 restart app`,
  });

  await prisma.itemCollection.createMany({
    data: [termItem1, termItem2, termItem3, termItem4, termItem5].map((item) => ({
      itemId: item.id,
      collectionId: terminal.id,
    })),
    skipDuplicates: true,
  });

  console.log("✓ Terminal Commands collection seeded");

  // ─── Standalone Items (no collection) ────────────────────────────
  await createItem({
    title: "Neon Documentation",
    description: "Official Neon serverless PostgreSQL documentation",
    contentType: "URL",
    typeName: "link",
    tags: ["neon", "postgres", "docs"],
    url: "https://neon.tech/docs",
  });

  await createItem({
    title: "Prisma Migrate Docs",
    description: "Prisma migration workflow documentation",
    contentType: "URL",
    typeName: "link",
    tags: ["prisma", "migrations", "docs"],
    url: "https://www.prisma.io/docs/orm/prisma-migrate",
  });

  await createItem({
    title: "shadcn/ui Components",
    description: "Beautifully designed components built with Radix and Tailwind",
    contentType: "URL",
    typeName: "link",
    tags: ["shadcn", "components", "ui"],
    url: "https://ui.shadcn.com",
  });

  await createItem({
    title: "Lucide Icons",
    description: "Beautiful & consistent open-source icon library",
    contentType: "URL",
    typeName: "link",
    tags: ["icons", "lucide", "design"],
    url: "https://lucide.dev/icons",
  });

  await createItem({
    title: "Quick Dev Note",
    description: "Scratch pad for short notes during development",
    contentType: "TEXT",
    typeName: "note",
    tags: ["notes"],
    content: `## Dev Notes

- Check Neon dashboard for query performance
- Remember to run \`prisma migrate deploy\` before pushing to prod
- Stripe webhook secret must be updated when switching environments`,
  });

  console.log("✓ Standalone items seeded");
  console.log("\n✅ Database seeded successfully (3 collections, 18 items)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
