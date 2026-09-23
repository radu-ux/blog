import { Link, Outlet } from 'react-router'

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <nav className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link to="/" className="font-semibold">
            blog
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
