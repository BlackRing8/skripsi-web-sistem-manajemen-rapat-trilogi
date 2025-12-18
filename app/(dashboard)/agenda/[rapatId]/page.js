// app/(dashboard)/agenda/[rapatId]/page.js
import DetailRapatClient from "./DetailRapatClient";

export default async function Page({ params }) {
  const { rapatId } = await params;
  return <DetailRapatClient rapatId={rapatId} />;
}
