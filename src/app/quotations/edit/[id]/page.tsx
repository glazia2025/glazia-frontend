import { redirect } from "next/navigation";

export default async function LegacyEditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`https://quotation.glazia.in/quotations/${encodeURIComponent(id)}`);
}
