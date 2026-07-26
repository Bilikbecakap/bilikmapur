import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div className="flex min-h-screen flex-col">
      <Header isLoggedIn={!!session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
