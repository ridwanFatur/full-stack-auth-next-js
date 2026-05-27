import Navbar from "./Navbar";
import { AuthUser } from "@/lib/auth/types";

interface MainLayoutProps {
  children: React.ReactNode;
  user: AuthUser | null;
}

export default function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
