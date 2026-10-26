// One-shot toast messages that survive a Server Action redirect. The action
// sets a short-lived cookie holding a code; the client Toaster reads it on the
// next route, shows the message and clears it. Codes (not text) keep the
// cookie value plain ASCII and stop it from showing arbitrary text.

export const FLASH_COOKIE = "ledger_flash";

export const FLASH_MESSAGES = {
  "item-added": "Line item added.",
  "item-updated": "Line item updated.",
  "item-deleted": "Line item deleted.",
  "goal-added": "Goal added.",
  "goal-updated": "Goal updated.",
  "goal-deleted": "Goal deleted.",
  "cycle-opened": "New cycle opened.",
  "activity-added": "Activity logged.",
  "income-updated": "Monthly income updated.",
  "currency-updated": "Currency updated.",
} as const;

export type FlashCode = keyof typeof FLASH_MESSAGES;
