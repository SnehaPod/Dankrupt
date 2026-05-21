import { redirect } from "next/navigation"

// Root → trending templates (the actual home experience lives at /trending
// inside the (app) route group so it gets the app shell / header).
export default function Root() {
  redirect("/trending")
}
