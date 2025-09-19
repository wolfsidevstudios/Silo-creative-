

const VERCEL_API_BASE = 'https://api.vercel.com';

export const deployToVercel = async (
    token: string,
    projectName: string,
    files: { [path: string]: string },
    projectId?: string,
): Promise<{ url: string; projectId: string; deploymentId: string }> => {
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Determine the main entry file, default to index.html
    const mainFile = files['index.html'] ? 'index.html' : Object.keys(files)[0];

    // Vercel CLI compatible config for a simple static site
    const vercelConfig = {
        "version": 2,
        "builds": [
            { "src": mainFile, "use": "@vercel/static" }
        ],
        "routes": [
            { "src": "/(.*)", "dest": `/${mainFile}` }
        ]
    };

    const filesPayload = Object.entries(files).map(([path, data]) => ({
        file: path,
        data: data,
    }));

    // Add vercel.json to the payload
    filesPayload.push({
        file: 'vercel.json',
        data: JSON.stringify(vercelConfig, null, 2)
    });

    const body: any = {
        name: projectName,
        files: filesPayload,
        projectSettings: {
            framework: null // Indicates a static site
        }
    };

    if (projectId) {
        body.project = projectId;
    }

    const response = await fetch(`${VERCEL_API_BASE}/v13/deployments`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(`Vercel API Error: ${responseData.error?.message || response.statusText}`);
    }

    if (!responseData.url) {
        throw new Error('Deployment did not return a URL.');
    }
    
    // The URL returned is the inspector URL. We need to add the protocol.
    return {
        url: `https://${responseData.url}`,
        projectId: responseData.projectId,
        deploymentId: responseData.id,
    };
};