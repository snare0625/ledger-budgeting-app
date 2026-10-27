import { Suspense, ViewTransition } from "react";

// Screen motion, built on React's <ViewTransition> (see the Next.js "View
// transitions" guide). Links tag each navigation with a direction, and the
// matching CSS in globals.css decides how screens move:
//   forward — into a sub-screen: slide in from the right
//   back    — back pills / finishing a flow: slide in from the left
//   tab     — bottom nav and sibling screens: quick crossfade
// Untagged updates (Server Action redirects, refreshes) swap without motion.

export const nav = {
  forward: ["nav-forward"],
  back: ["nav-back"],
  tab: ["nav-tab"],
};

const DIRECTIONAL = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  "nav-tab": "nav-tab",
  default: "none",
};

// Navigations are handled by <Screen>; only a late Suspense reveal fades in.
const REVEAL = { "nav-forward": "none", "nav-back": "none", "nav-tab": "none", default: "reveal" };
const FALLBACK_OUT = { "nav-forward": "none", "nav-back": "none", "nav-tab": "none", default: "fallback-out" };

/** Wraps a whole screen (in each page, not a layout) so it enters and exits with the navigation. */
export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={DIRECTIONAL} exit={DIRECTIONAL} default="none">
      {children}
    </ViewTransition>
  );
}

/** Suspense whose placeholder fades out and whose content rises in when the data arrives. */
export function Streamed({ fallback, children }: { fallback: React.ReactNode; children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <ViewTransition exit={FALLBACK_OUT} default="none">
          {fallback}
        </ViewTransition>
      }
    >
      <ViewTransition enter={REVEAL} default="none">
        {children}
      </ViewTransition>
    </Suspense>
  );
}
