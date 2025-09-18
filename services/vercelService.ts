
const VERCEL_API_BASE = 'https://api.vercel.com';

export const deployToVercel = async (
    token: string,
    projectName: string,
    fileContent: string,
    filePath: string,
    projectId?: string,
): Promise<{ url: string; projectId: string; deploymentId: string }> => {
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    // Vercel CLI compatible config for a simple static site
    const vercelConfig = {
        "version": 2,
        "builds": [
            { "src": filePath, "use": "@vercel/static" }
        ],
        "routes": [
            { "src": "/(.*)", "dest": `/${filePath}` }
        ]
    };

    const body: any = {
        name: projectName,
        files: [
            {
                file: filePath,
                data: fileContent,
            },
            {
                file: 'vercel.json',
                data: JSON.stringify(vercelConfig, null, 2)
            }
        ],
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
