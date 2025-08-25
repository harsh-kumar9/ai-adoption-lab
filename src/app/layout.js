import "./globals.css";
import Link from "next/link";

export const metadata = { title: "AI Adoption Lab" };

export default function RootLayout({ children }) {
  const NavLink = ({href, children}) => (
    <Link href={href} className="px-3 py-1 rounded-lg hover:bg-black/5 transition-colors">
      {children}
    </Link>
  );

  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <div className="font-semibold">
              <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
                AI Adoption Lab
              </span>
            </div>
            <nav className="flex gap-2">
              <NavLink href="/control">Control</NavLink>
              <NavLink href="/proto/onboarding">Prototype</NavLink>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
