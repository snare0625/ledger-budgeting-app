import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FormSkeleton, SubScreen } from "@/components/app/chrome";
import { getOpenItem } from "@/lib/data/queries";
import { ItemForm } from "../item-form";

export const metadata: Metadata = { title: "Edit item · Ledger" };

export default function EditItemPage({ params }: PageProps<"/items/[id]">) {
  return (
    <SubScreen back="/items" backLabel="Line items">
      <h1 className="mb-[22px] text-title-sm text-ink">Edit item</h1>
      <Suspense fallback={<FormSkeleton fields={3} />}>
        <EditItem params={params} />
      </Suspense>
    </SubScreen>
  );
}

async function EditItem({ params }: Pick<PageProps<"/items/[id]">, "params">) {
  const { id } = await params;
  const item = await getOpenItem(id);
  if (!item) notFound();
  return <ItemForm item={item} />;
}
