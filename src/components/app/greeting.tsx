"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function partOfDay() {
  const hour = new Date().getHours();
  return hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
}

/** "Morning, Morgan 👋" in the viewer's local time. The server renders "Hi". */
export function Greeting({ name }: { name: string }) {
  const salutation = useSyncExternalStore(subscribe, partOfDay, () => "Hi");
  return (
    <>
      {salutation}, {name} 👋
    </>
  );
}
