export default function DebugPage() {
    return (
        <div>
            <p><strong>API Base URL NEXT JS Frontend:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL_FRONTEND}</p>
            <p><strong>API Base URL NEXT JS Backend:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL_BACKEND}</p>
            <p><strong>Backend APP:</strong> {process.env.NEXT_PUBLIC_FRONTEND_APP}</p>
            <p><strong>Frontend APP:</strong> {process.env.NEXT_PUBLIC_BACKEND_APP}</p>
            <p><strong>Secret:</strong> {process.env.AUTH_SECRET}</p>
        </div>
    );
}
