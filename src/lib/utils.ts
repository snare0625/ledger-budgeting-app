import { createCn } from "cn/config"

// Teach the class merger the custom theme scales in globals.css. Without this
// it reads `text-display`, `text-body`… as text colors, so `cn("text-display",
// "text-white")` would drop the font size.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "title", "title-sm", "heading", "row", "body", "label", "tab", "overline"] },
      ],
      shadow: [{ shadow: ["nav", "pill", "success", "toast", "device"] }],
    },
  },
})
