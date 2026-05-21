declare module "gif.js" {
  interface GIFOptions {
    /** Number of web workers to spawn (default: 2) */
    workers?: number
    /** Quantization quality — 1 is best, 30 is worst (default: 10) */
    quality?: number
    width?: number
    height?: number
    /** Path to gif.worker.js served as a static asset */
    workerScript?: string
    /** Transparent colour as 0xRRGGBB int, or null for no transparency */
    transparent?: number | null
    /** Background colour string (default: '#fff') */
    background?: string
    /** -1 = forever, 0 = once, n = n times (default: -1) */
    repeat?: number
    dither?: boolean | string
    debug?: boolean
  }

  interface AddFrameOptions {
    /** Frame delay in milliseconds */
    delay?: number
    /** Make a snapshot of the image now (required when reusing the same canvas) */
    copy?: boolean
    /** Disposal method (-1 = keep, 2 = clear) */
    dispose?: number
  }

  class GIF {
    constructor(options?: GIFOptions)
    addFrame(
      source: HTMLCanvasElement | CanvasRenderingContext2D | ImageData,
      options?: AddFrameOptions
    ): void
    render(): void
    abort(): void
    on(event: "finished", cb: (blob: Blob) => void): void
    on(event: "progress", cb: (progress: number) => void): void
    on(event: "error", cb: (err: Error) => void): void
  }

  export default GIF
}
