import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 h-screen overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                    <div className="mb-4">
                        <h2 className="font-bold">Error:</h2>
                        <pre className="bg-red-100 p-4 rounded">{this.state.error?.toString()}</pre>
                    </div>
                    <div>
                        <h2 className="font-bold">Component Stack:</h2>
                        <pre className="bg-red-100 p-4 rounded text-sm overflow-auto">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <div className="mt-8">
                        <h2 className="font-bold">Environment Debug:</h2>
                        <pre className="bg-gray-100 p-4 rounded text-sm">
                            VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing'}
                            {'\n'}
                            VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
