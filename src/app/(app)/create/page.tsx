import { redirect } from "next/navigation"

/**
 * /create without a template ID has no useful state — redirect users to
 * the template browser so they can pick one and start creating.
 */
export default function CreatePage() {
  redirect("/trending")
}
