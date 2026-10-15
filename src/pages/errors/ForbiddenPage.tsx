import { Link } from 'react-router-dom';
import { Shield, Home } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="flex justify-center mb-4">
          <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">Access Denied</h1>
        <h2 className="text-2xl font-semibold mb-2">403 Forbidden</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
