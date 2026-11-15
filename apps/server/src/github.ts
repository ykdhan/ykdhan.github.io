import type { GithubRepo } from "@yk/shared";
import { slugify } from "@yk/shared";
import { env } from "./env.ts";
import { indexEntry, indexMemory } from "./memory.ts";
import {
  createEntry,
  createMemory,
  findEntryBySourceRef,
  findMemoryBySourceRef,
  getSetting,
  updateEntry,
  updateMemory
} from "./repo.ts";

const API = "https://api.github.com";

async function gh(path: string, accept = "application/vnd.github+json") {
  const res = await fetch(`${API}${path}`, {
    headers: {
      accept,
      "user-agent": "yk-portfolio-server",
      ...(env.githubToken ? { authorization: `Bearer ${env.githubToken}` } : {})
    }
  });
  if (!res.ok) {
    const hint =
      res.status === 401
        ? " (GITHUB_TOKEN is invalid)"
        : res.status === 403 || res.status === 429
          ? " (rate limited: set GITHUB_TOKEN for 5,000 requests/hour)"
          : res.status === 404
            ? " (user or repository not found)"
            : "";
    throw new Error(`GitHub API ${res.status}${hint}`);
  }
  return res;
}

export const githubSettings = () => getSetting<{ username: string }>("github", { username: "" });

type ApiRepo = {
  full_name: string;
  name: string;
  description: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  html_url: string;
  homepage: string | null;
  pushed_at: string;
  fork: boolean;
};

const ref = (fullName: string) => `github:${fullName}`;

export async function listRepos(): Promise<GithubRepo[]> {
  const { username } = await githubSettings();
  if (!username) throw new Error("Set a GitHub username first.");
  const repos = (await (
    await gh(`/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`)
  ).json()) as ApiRepo[];

  return Promise.all(
    repos.map(async (r) => ({
      fullName: r.full_name,
      name: r.name,
      description: r.description,
      language: r.language,
      topics: r.topics ?? [],
      stars: r.stargazers_count,
      url: r.html_url,
      homepage: r.homepage || null,
      pushedAt: r.pushed_at,
      fork: r.fork,
      imported:
        !!(await findEntryBySourceRef(ref(r.full_name))) || !!(await findMemoryBySourceRef(ref(r.full_name)))
    }))
  );
}

/** README as plain-ish text: drops images, HTML tags and badges. */
async function readme(fullName: string) {
  try {
    const raw = await (await gh(`/repos/${fullName}/readme`, "application/vnd.github.raw")).text();
    return raw
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/!\[[^\]]*]\([^)]*\)/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, 8000);
  } catch {
    return "";
  }
}

/**
 * Imports (or re-syncs) repositories. As "project" they become hidden project
 * entries you can publish from the admin; as "memory" they only feed retrieval.
 */
export async function importRepos(fullNames: string[], as: "project" | "memory") {
  const results: { fullName: string; id: string; created: boolean }[] = [];
  for (const fullName of fullNames.slice(0, 30)) {
    const repo = (await (await gh(`/repos/${fullName}`)).json()) as ApiRepo;
    const text = await readme(fullName);
    const tags = [repo.language, ...(repo.topics ?? [])].filter(Boolean) as string[];
    const links = [
      { label: "GitHub", url: repo.html_url },
      ...(repo.homepage ? [{ label: "Website", url: repo.homepage }] : [])
    ];

    if (as === "project") {
      const input = {
        kind: "project" as const,
        slug: slugify(repo.name),
        title: repo.name,
        subtitle: repo.description ?? "",
        period: "",
        body: text,
        tags,
        links,
        visible: false,
        sort: 100,
        source: "github" as const,
        sourceRef: ref(fullName)
      };
      const existing = await findEntryBySourceRef(ref(fullName));
      const saved = existing
        ? await updateEntry(existing.id, {
            ...input,
            slug: existing.slug,
            visible: existing.visible,
            sort: existing.sort,
            period: existing.period
          })
        : await createEntry(input);
      await indexEntry(saved!);
      results.push({ fullName, id: saved!.id, created: !existing });
    } else {
      const input = {
        title: `GitHub: ${repo.name}`,
        content: [repo.description, `Repository: ${repo.html_url}`, text].filter(Boolean).join("\n\n"),
        tags,
        source: "github" as const,
        sourceRef: ref(fullName)
      };
      const existing = await findMemoryBySourceRef(ref(fullName));
      const saved = existing ? await updateMemory(existing.id, input) : await createMemory(input);
      await indexMemory(saved!);
      results.push({ fullName, id: saved!.id, created: !existing });
    }
  }
  return results;
}
