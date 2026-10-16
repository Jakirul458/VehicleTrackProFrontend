import { Outlet, Link, useLocation } from "react-router-dom";

export default function PublicLayout() {
  const location = useLocation();
  const isAuthPage = ["/login", "/signup", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background">
      {!isAuthPage && (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">V</span>
                </div>
                <span className="font-bold text-xl">VehicleTrack Pro</span>
              </Link>
              <div className="flex items-center space-x-6">
                <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                  Home
                </Link>
                <Link
                  to="/about"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  Start free trial
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}
      <Outlet />
      {!isAuthPage && (
        <footer className="border-t mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">V</span>
                  </div>
                  <span className="font-bold text-lg">VehicleTrack Pro</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Professional vehicle document management system for insurance agents and service
                  providers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/about" className="hover:text-primary">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link to="/#pricing" className="hover:text-primary">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-primary">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/about" className="hover:text-primary">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="hover:text-primary">
                      Support
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <Link to="/about" className="hover:text-primary">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className="hover:text-primary">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} VehicleTrack Pro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
