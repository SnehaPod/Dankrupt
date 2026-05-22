import Image from "next/image"

interface Props {
  className?: string
  /** px size passed to next/image — should match the CSS size. Default 32. */
  size?: number
}

/** Dankrupt brand icon — pixel-art frog mascot.
 *  Use className to control visual size (e.g. "w-8 h-8"). */
export function DankruptIcon({ className = "w-8 h-8", size = 32 }: Props) {
  return (
    <Image
      src="/icon.png"
      alt="Dankrupt"
      width={size}
      height={size}
      className={`rounded-xl ${className}`}
      priority
    />
  )
}
