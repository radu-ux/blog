import { Button } from '@/components/ui/button'

export function Home() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">Home</h1>
      <Button>Get started</Button>
    </section>
  )
}
