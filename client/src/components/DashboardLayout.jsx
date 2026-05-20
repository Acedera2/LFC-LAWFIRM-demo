export default function DashboardLayout({ children, sidebar = null }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-0 sm:px-6 lg:px-8">
      {sidebar ? (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">{sidebar}</aside>
          <main className="min-w-0">{children}</main>
        </div>
      ) : (
        <main className="min-w-0">{children}</main>
      )}
    </div>
  );
}
