import { redirect } from "next/navigation"

// The (marketing) route group is no longer the home experience.
// Redirect any traffic here to the trending page inside the app shell.
export default function MarketingRoot() {
  redirect("/trending")
}
