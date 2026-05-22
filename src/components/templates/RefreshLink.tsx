"use client"

export function RefreshLink() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="underline underline-offset-2 hover:text-accent transition-colors"
    >
      reload the page
    </button>
  )
}
