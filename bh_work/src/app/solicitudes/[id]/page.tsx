
import { RequestDetail, Layout } from "@/app/App"

export function generateStaticParams() {
  return [{"id": "BH-0018"}, {"id": "BH-0017"}, {"id": "BH-0016"}, {"id": "BH-0015"}, {"id": "BH-0014"}, {"id": "BH-0013"}]
}

export default function Page() {
  return (
    <Layout>
      <RequestDetail />
    </Layout>
  )
}
