import { cn } from "@/lib/utils";

/** 44×26 toggle from the design: green when on. */
export function Switch({
  checked,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "role" | "aria-checked"> & { checked: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      {...props}
      className={cn(
        "relative h-[26px] w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
        checked ? "bg-green" : "bg-toggle-off",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-[2.5px] left-[2.5px] size-[21px] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-200",
          checked && "translate-x-[18px]",
        )}
      />
    </button>
  );
}
