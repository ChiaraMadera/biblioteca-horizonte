
import { ResourceDetail, Layout } from "@/app/App"

export function generateStaticParams() {
  return [{"id": "proyector"}, {"id": "sala"}, {"id": "notebook"}, {"id": "sonido"}, {"id": "lectura"}, {"id": "tablet"}]
}

export default function Page() {
  return (
    <Layout>
      <ResourceDetail />
    </Layout>
  )
}
