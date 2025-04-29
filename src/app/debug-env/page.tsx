// app/debug-env/page.tsx
// import getConfig from 'next/config';
// const { publicRuntimeConfig } = getConfig();
// const { backendUrlConfig, frontendUrlConfig } = publicRuntimeConfig;

export default function DebugPage() {
    return (
        <div>
            <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
            <p><strong>API Base URL V2:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL_V2}</p>
            <p><strong>Secret:</strong> {process.env.AUTH_SECRET}</p>
            {/* <p>API Base URL(frontend) : {frontendUrlConfig}</p>
            <p>API Base URL V2(backend) : {backendUrlConfig}</p> */}
        </div>
    );
}
