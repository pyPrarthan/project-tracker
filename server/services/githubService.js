import { request } from "undici"

const API_BASE = process.env.GITHUB_API_BASE || "https://api.github.com"
const TOKEN = process.env.GITHUB_TOKEN
const TTL_MIN = Number(process.env.GITHUB_CACHE_TTL_MIN || 60)

const headers = extra =>({
    "User-Agent": "Request", 
    "Accept": "application/vnd.github+json",
    ...(TOKEN ? {Authorization: `Bearer ${TOKEN}`} : {}),
    ...extra
})

const isFresh = ts => ts && (Date.now() - new Date(ts).getTime()) < TTL_MIN * 60 * 1000

export async function fetchRepo(ownerRepo, etag=null){
    const repoRs = await request(`${API_BASE}/repos/${ownerRepo}`, {
        method: "GET", 
        headers: etag ? headers({"If-none-Match":etag}): headers()
    })

    if (repoRs.statusCode === 304) return {notModified: true}
    if (repoRs.statusCode === 404) return {error: "Repo not found", status: 404}
    if (repoRs.statusCode >= 400){
        const body = await repoRs.body.text()
        return{error: `GitHub ${repoRs.statusCode}:${body}`, status: repoRs.statusCode}
    }

    const repo = await repoRs.body.json()
    const newEtag = repoRs.headers.etag || null

    // get latest commit data (1 commit)
    let latestCommitData = null
    const commitRes = await request(`${API_BASE}/repos/${ownerRepo}/commits?per_page=1`, { headers: headers() })
    if (commitRes.statusCode === 200){
        const comits = await commitRes.body.json()
        const c = Array.isArray(comits) ? commits[0] : null
        lastCommitDate = c?.commit?.committer?.date || c?.commit?.author?.date || null;
    }
    return{
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
            updatedAt: repo.updatedAt ? new Date(repo.updatedAt) : null, 
            lastCommitDate: lastCommitDate ? new Date(lastCommitDate) : null
        }
    }
}

