import type { Metadata } from "next";
import { SubScreen } from "@/components/app/chrome";
import { ItemForm } from "../item-form";

export const metadata: Metadata = { title: "New item · Ledger" };

export default function NewItemPage() {
  return (
    <SubScreen back="/items" backLabel="Line items">
      <h1 className="mb-[22px] text-title-sm text-ink">New item</h1>
      <ItemForm />
    </SubScreen>
  );
}
