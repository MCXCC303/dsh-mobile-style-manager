export interface CssError {
  line: number
  message: string
}

export interface CssScan {
  ok: boolean
  error?: CssError
}

export function scanCss(css: string): CssScan {
  let depth = 0
  let line = 1
  let quote: '"' | "'" | null = null
  let escaped = false
  let inComment = false
  let commentLine = 1
  const openLines: number[] = []

  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i]
    if (ch === "\n") line += 1

    if (inComment) {
      if (ch === "*" && css[i + 1] === "/") {
        inComment = false
        i += 1
      }
      continue
    }

    if (quote !== null) {
      if (escaped) {
        escaped = false
      } else if (ch === "\\") {
        escaped = true
      } else if (ch === quote) {
        quote = null
      }
      continue
    }

    if (ch === "/" && css[i + 1] === "*") {
      inComment = true
      commentLine = line
      i += 1
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === "{") {
      depth += 1
      openLines.push(line)
    } else if (ch === "}") {
      depth -= 1
      if (depth < 0) return { ok: false, error: { line, message: "Unexpected closing brace." } }
      openLines.pop()
    }
  }

  if (inComment) return { ok: false, error: { line: commentLine, message: "Unterminated comment." } }
  if (quote !== null) return { ok: false, error: { line, message: "Unterminated string." } }
  if (depth !== 0) {
    return { ok: false, error: { line: openLines.at(-1) ?? line, message: "Unbalanced braces." } }
  }
  return { ok: true }
}

export function gateQuery(breakpoint: number, mode: "viewport" | "device"): string {
  const base = "(max-width: " + breakpoint + "px)"
  return mode === "device" ? base + " and (pointer: coarse)" : base
}

export function wrapCss(css: string, breakpoint: number, mode: "viewport" | "device", raw = false): string {
  if (css.trim() === "") return ""
  if (raw) return css
  return "@media " + gateQuery(breakpoint, mode) + " {\n" + css + "\n}"
}
