// A helper to parse owner/repo from URL
const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname !== 'github.com') {
            return null;
        }
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        if (pathParts.length < 2) {
            return null;
        }
        const [owner, repo] = pathParts;
        return { owner, repo: repo.replace('.git', '') };
    } catch (e) {
        return null;
    }
};

const GITHUB_API_BASE = 'https://api.github.com';

export const pushToRepo = async (
    repoUrl: string,
    token: string,
    fileContent: string,
    filePath: string,
    commitMessage: string = 'feat: initial commit from Silo Create'
): Promise<string> => {
    
    const repoDetails = parseRepoUrl(repoUrl);
    if (!repoDetails) {
        throw new Error('Invalid GitHub repository URL.');
    }
    const { owner, repo } = repoDetails;

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28',
    };

    // Helper for API calls
    const ghFetch = async (endpoint: string, options: RequestInit = {}) => {
        const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
            ...options,
            headers: { ...headers, ...options.headers },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
        }
        return response.json();
    };

    // 1. Get the main branch name and latest commit SHA
    let branch = 'main';
    let latestCommitSha: string;
    try {
        const refData = await ghFetch(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
        latestCommitSha = refData.object.sha;
    } catch (e) {
        // If 'main' fails, try 'master'
        try {
            branch = 'master';
            const refData = await ghFetch(`/repos/${owner}/${repo}/git/ref/heads/${branch}`);
            latestCommitSha = refData.object.sha;
        } catch (e2) {
            throw new Error("Could not find 'main' or 'master' branch. Please ensure your repository is initialized.");
        }
    }
    
    // 2. Create a blob for the file content
    const blobData = await ghFetch(`/repos/${owner}/${repo}/git/blobs`, {
        method: 'POST',
        body: JSON.stringify({
            content: fileContent,
            encoding: 'utf-8',
        }),
    });
    const blobSha = blobData.sha;

    // 3. Create a new tree with the new file blob. To avoid deleting other files, we get the base tree.
    const latestCommit = await ghFetch(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
    
    const treeData = await ghFetch(`/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({
            base_tree: latestCommit.tree.sha,
            tree: [{
                path: filePath,
                mode: '100644', // file
                type: 'blob',
                sha: blobSha,
            }],
        }),
    });
    const treeSha = treeData.sha;

    // 4. Create a new commit pointing to the new tree
    const commitData = await ghFetch(`/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        body: JSON.stringify({
            message: commitMessage,
            tree: treeSha,
            parents: [latestCommitSha],
        }),
    });
    const newCommitSha = commitData.sha;

    // 5. Update the branch reference to point to the new commit
    await ghFetch(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({
            sha: newCommitSha,
        }),
    });

    return `https://github.com/${owner}/${repo}/commit/${newCommitSha}`;
};
