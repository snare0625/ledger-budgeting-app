import type { Activity } from "@/lib/data/queries";
import { formatDay, formatMoney, type Currency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { IconTile } from "./chrome";

export function ActivityList({ activity, currency }: { activity: Activity[]; currency: Currency }) {
  if (!activity.length) {
    return <p className="py-5 text-label font-medium text-sub">No activity yet this cycle.</p>;
  }

  return (
    <ul className="mt-2">
      {activity.map((a, i) => (
        <li key={a.id} className={cn("flex items-center gap-[13px] py-3", i > 0 && "border-t border-line")}>
          <IconTile category={a.category} small />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-bold text-ink">{a.name}</p>
            <p className="text-[13px] font-medium text-sub">{formatDay(a.occurred_at)}</p>
          </div>
          <span className={cn("text-body font-bold", a.amount > 0 ? "text-green" : "text-ink")}>
            {formatMoney(a.amount, currency, { signed: true })}
          </span>
        </li>
      ))}
    </ul>
  );
}
