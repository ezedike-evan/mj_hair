import { useUser, RedirectToSignIn, useClerk } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { adminEmails } from "../config/admin";
import { type ReactNode } from "react";
import { ShieldAlert, LogOut, ExternalLink } from "lucide-react";

export function AdminRoute({ children }: { children: ReactNode }) {
    const { user, isLoaded, isSignedIn } = useUser();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { signOut } = useClerk();

    // Wait until both Clerk and Convex are loaded
    // If Clerk is signed in, we must wait for Convex to agree (token exchange)
    const showLoading = !isLoaded || isLoading || (isSignedIn && !isAuthenticated);

    if (showLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;

    if (!userEmail || !adminEmails.includes(userEmail)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        This area is exclusively for administrators. It looks like you don't have the necessary permissions.
                    </p>

                    <div className="space-y-4">
                        <a
                            href="mjhairpalace.co.uk"
                            className="flex items-center justify-center gap-2 w-full py-3.5 px-6 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity font-semibold shadow-sm shadow-primary/20"
                        >
                            <ExternalLink size={18} />
                            Go to User Site
                        </a>

                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400 mb-3">Signed in as {userEmail}</p>
                            <button
                                onClick={() => signOut()}
                                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
