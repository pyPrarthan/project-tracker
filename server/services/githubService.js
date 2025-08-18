import { request } from "undici";

const API_BASE = process.env.GITHUB_API_BASE || "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;
const TTL_MIN = Number(process.env.GITHUB_CACHE_TTL_MINUTES || 60);

const headers = (extra = {}) => ({
  "User-Agent": "Project-Tracker",
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  ...extra,
});

const isFresh = (ts) => ts && Date.now() - new Date(ts).getTime() < TTL_MIN * 60 * 1000;

export async function fetchRepo(ownerRepo, etag = null) {
  const repoRes = await request(`${API_BASE}/repos/${ownerRepo}`, {
    method: "GET",
    headers: etag ? headers({ "If-None-Match": etag }) : headers(),
  });

  if (repoRes.statusCode === 304) return { notModified: true };
  if (repoRes.statusCode === 404)return { error: "Repo not found", status: 404 };
  if (repoRes.statusCode >= 400) {
    const body = await repoRes.body.text();
    return {
      error: `GitHub ${repoRes.statusCode}: ${body}`,
      status: repoRes.statusCode,
    };
  }

  const repo = await repoRes.body.json();
  const newEtag = repoRes.headers.etag || null;

  // latest commit date
  let lastCommitDate = null;
  const commitsRes = await request(
    `${API_BASE}/repos/${ownerRepo}/commits?per_page=1`,
    {
      method: "GET",
      headers: headers(),
    }
  );
  if (commitsRes.statusCode === 200) {
    const commits = await commitsRes.body.json();
    const c = Array.isArray(commits) ? commits[0] : null;
    lastCommitDate =
      c?.commit?.committer?.date || c?.commit?.author?.date || null;
  }

  return {
    etag: newEtag,
    data: {
      name: repo.name,
      description: repo.description,
      homepage: repo.homepage,
      defaultBranch: repo.default_branch,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      pushedAt: repo.pushed_at ? new Date(repo.pushed_at) : null,
      updatedAt: repo.updated_at ? new Date(repo.updated_at) : null, // ⬅️ correct field
      lastCommitDate: lastCommitDate ? new Date(lastCommitDate) : null,
    },
  };
}

export async function getReposForProject(projectDoc, { forceRefresh = false } = {}) {
  const results = [];
  const now = new Date();

  for (const fullName of projectDoc.githubRepos || []) {
    const key = fullName.toLowerCase();
    const cached = (projectDoc.repoCache || []).find((r) => r.fullName.toLowerCase() === key
    );

    if (!forceRefresh && cached && isFresh(cached.fetchedAt)) {
      results.push({
        fullName,
        ...cached.data,
        fetchedAt: cached.fetchedAt,
        source: "cache",
      });
      continue;
    }

    const res = await fetchRepo(fullName, cached?.etag || null);

    if (res.notModified && cached) {
      cached.fetchedAt = now;
      results.push({
        fullName,
        ...cached.data,
        fetchedAt: now,
        source: "cache-validated",
      });
      continue;
    }

    if (res.error) {
      results.push({
        fullName,
        error: res.error,
        status: res.status || 500,
        fetchedAt: cached?.fetchedAt || null,
        source: cached ? "stale-cache-with-error" : "error",
      });
      continue;
    }

    const next = { fullName, etag: res.etag, data: res.data, fetchedAt: now };
    if (!projectDoc.repoCache) projectDoc.repoCache = [];
    const idx = projectDoc.repoCache.findIndex(
      (r) => r.fullName.toLowerCase() === key
    );
    if (idx >= 0) projectDoc.repoCache[idx] = next;
    else projectDoc.repoCache.push(next);

    results.push({ fullName, ...res.data, fetchedAt: now, source: "github" });
  }

  await projectDoc.save();
  return results;
}
