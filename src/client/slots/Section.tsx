import { useEffect, useRef, useState, useSyncExternalStore, type ReactElement } from "react"
import { ATTRS } from "../../shared/identity"
import { INPUT_FONT_SIZE, INPUT_RADIUS, type Gate, type NavMode, type SettingsV1, type SidebarWidth } from "../../shared/state"
import type { Controller } from "../core/controller"
import type { HealthReport } from "../core/health"

interface SectionProps {
  close: () => void
  controller: Controller
}

interface Viewport {
  width: number
  height: number
}

interface SwitchProps {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}

function readViewport(): Viewport {
  return { width: window.innerWidth, height: window.innerHeight }
}

function Switch({ label, checked, onChange }: SwitchProps): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      className={checked ? "msm-switch msm-switch-on" : "msm-switch"}
      onClick={() => onChange(!checked)}
    >
      <span className="msm-switch-thumb" aria-hidden="true" />
    </button>
  )
}

export function Section({ controller }: SectionProps): ReactElement {
  const state = useSyncExternalStore(controller.store.subscribe, controller.store.get, controller.store.get)
  const nav = useSyncExternalStore(controller.subscribeNav, controller.getNavState, controller.getNavState)
  const [viewport, setViewport] = useState<Viewport>(readViewport)
  const [health, setHealth] = useState<HealthReport>(() => controller.refreshHealth())
  const [confirmReset, setConfirmReset] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onResize = (): void => setViewport(readViewport())
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  useEffect(() => {
    const dialog = rootRef.current?.closest("[role=dialog]")
    dialog?.setAttribute(ATTRS.dialog, "")
    return () => {
      dialog?.removeAttribute(ATTRS.dialog)
    }
  }, [])

  useEffect(() => {
    const dialog = rootRef.current?.closest("[role=dialog]")
    if (!dialog) return
    const navItem = [...dialog.querySelectorAll<HTMLElement>('button, [role="button"], [role="tab"], a')]
      .find((element) => (element.textContent || "").trim() === "Mobile styles")
    navItem?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [])

  const update = (patch: Partial<SettingsV1>): void => {
    controller.store.set(patch)
  }

  const recheckHealth = (): void => {
    setHealth(controller.refreshHealth())
  }

  const mobile = state.enabled
    && viewport.width <= state.breakpoint
    && (state.gate === "viewport" || window.matchMedia("(pointer: coarse)").matches)

  return (
    <div className="msm-section" data-dsh-msm-section="" ref={rootRef}>
      <header className="msm-header">
        <h2 className="msm-title">Mobile styles</h2>
        <p className="msm-subtitle">
          Controls the layout below the breakpoint. Desktop layout is unchanged.
        </p>
      </header>

      <section className="msm-card" aria-labelledby="msm-status-title">
        <h3 className="msm-card-title" id="msm-status-title">Status</h3>
        <div className="msm-kv">
          <span>Viewport</span>
          <span>{viewport.width} x {viewport.height} px</span>
        </div>
        <div className="msm-kv">
          <span>Mobile mode</span>
          <span>{mobile ? "Active" : "Inactive"}</span>
        </div>
        <div className="msm-kv">
          <span>Settings storage</span>
          <span>{controller.store.isPersistent() ? "Local browser" : "Memory only"}</span>
        </div>
      </section>

      <section className="msm-card" aria-labelledby="msm-layout-title">
        <h3 className="msm-card-title" id="msm-layout-title">Layout</h3>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Enabled</span>
            <span className="msm-hint">Apply mobile styles in narrow viewports.</span>
          </div>
          <Switch label="Enabled" checked={state.enabled} onChange={(value) => update({ enabled: value })} />
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Built-in skin</span>
            <span className="msm-hint">Use the bundled mobile layout rules.</span>
          </div>
          <Switch label="Built-in skin" checked={state.useBuiltinSkin} onChange={(value) => update({ useBuiltinSkin: value })} />
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Breakpoint</span>
            <span className="msm-hint">Widths at or below this value use mobile styles.</span>
          </div>
          <div className="msm-range">
            <input
              aria-label="Breakpoint"
              type="range"
              min={480}
              max={1024}
              step={1}
              value={state.breakpoint}
              onChange={(event) => update({ breakpoint: Number(event.currentTarget.value) })}
            />
            <output>{state.breakpoint}px</output>
          </div>
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Apply to</span>
            <span className="msm-hint">Choose the signal that activates mobile styles.</span>
          </div>
          <select
            aria-label="Apply to"
            className="msm-select"
            value={state.gate}
            onChange={(event) => update({ gate: event.currentTarget.value as Gate })}
          >
            <option value="viewport">Viewport width</option>
            <option value="device">Touch devices</option>
          </select>
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Safe area</span>
            <span className="msm-hint">Reserve bottom space for device insets.</span>
          </div>
          <Switch label="Safe area" checked={state.safeArea} onChange={(value) => update({ safeArea: value })} />
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Compact buttons</span>
            <span className="msm-hint">Reduce button padding across the shell and settings panel.</span>
          </div>
          <Switch label="Compact buttons" checked={state.compactButtons} onChange={(value) => update({ compactButtons: value })} />
        </div>
      </section>

      <section className="msm-card" aria-labelledby="msm-navigation-title">
        <h3 className="msm-card-title" id="msm-navigation-title">Navigation</h3>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Navigation mode</span>
            <span className="msm-hint">Choose how the sidebar is presented on mobile.</span>
          </div>
          <select
            aria-label="Navigation mode"
            className="msm-select"
            value={state.navMode}
            onChange={(event) => update({ navMode: event.currentTarget.value as NavMode })}
          >
            <option value="rail">Rail</option>
            <option value="drawer" disabled={!nav.drawerAvailable}>Drawer</option>
            {nav.topbarAvailable
              ? <option value="topbar">Top bar</option>
              : <option value="topbar" disabled>Top bar (unavailable)</option>}
          </select>
        </div>
        {state.navMode !== nav.effective ? (
          <div className="msm-kv">
            <span>Effective mode</span>
            <span>{nav.effective === "topbar" ? "Top bar" : nav.effective === "drawer" ? "Drawer" : "Rail"}</span>
          </div>
        ) : null}
        {!nav.drawerAvailable || !nav.topbarAvailable ? (
          <div className="msm-hint">
            {!nav.drawerAvailable ? "Drawer unavailable in this host version. " : ""}
            {!nav.topbarAvailable ? "Top bar unavailable in this host version." : ""}
          </div>
        ) : null}
      </section>

      <section className="msm-card" aria-labelledby="msm-sidebar-title">
        <h3 className="msm-card-title" id="msm-sidebar-title">Sidebar</h3>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Sidebar width</span>
            <span className="msm-hint">Width of the drawer on mobile.</span>
          </div>
          <select
            aria-label="Sidebar width"
            className="msm-select"
            value={state.sidebarWidth}
            onChange={(event) => update({ sidebarWidth: event.currentTarget.value as SidebarWidth })}
          >
            <option value="full">Full width</option>
            <option value="86vw">86% width</option>
          </select>
        </div>
      </section>

      <section className="msm-card" aria-labelledby="msm-page-settings-title">
        <h3 className="msm-card-title" id="msm-page-settings-title">Page: settings</h3>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Full-screen settings panel</span>
            <span className="msm-hint">Expand the host settings panel on narrow viewports.</span>
          </div>
          <Switch label="Full-screen settings panel" checked={state.settingsFullscreen} onChange={(value) => update({ settingsFullscreen: value })} />
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Hide settings descriptions</span>
            <span className="msm-hint">Hide the description lines on official settings pages.</span>
          </div>
          <Switch label="Hide settings descriptions" checked={state.hideSubtitles} onChange={(value) => update({ hideSubtitles: value })} />
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Dense settings rows</span>
            <span className="msm-hint">Compress row spacing on official settings pages.</span>
          </div>
          <Switch label="Dense settings rows" checked={state.denseSettings} onChange={(value) => update({ denseSettings: value })} />
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Hide section descriptions</span>
            <span className="msm-hint">Hide the description lines in this section.</span>
          </div>
          <Switch label="Hide section descriptions" checked={state.hideOwnSubtitles} onChange={(value) => update({ hideOwnSubtitles: value })} />
        </div>
      </section>

      <section className="msm-card" aria-labelledby="msm-page-plugins-title">
        <h3 className="msm-card-title" id="msm-page-plugins-title">Page: plugins</h3>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Hide plugins page subtitle</span>
            <span className="msm-hint">Hide the subtitle under the Plugins page title.</span>
          </div>
          <Switch label="Hide plugins page subtitle" checked={state.hidePluginPageSubtitles} onChange={(value) => update({ hidePluginPageSubtitles: value })} />
        </div>
      </section>

      <section className="msm-card" aria-labelledby="msm-area-session-title">
        <h3 className="msm-card-title" id="msm-area-session-title">Area: session</h3>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Compact session header</span>
            <span className="msm-hint">Hide secondary header actions and collapse breadcrumbs.</span>
          </div>
          <Switch label="Compact session header" checked={state.compactHeader} onChange={(value) => update({ compactHeader: value })} />
        </div>
      </section>

      <section className="msm-card" aria-labelledby="msm-area-input-title">
        <h3 className="msm-card-title" id="msm-area-input-title">Area: input</h3>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Input corner radius</span>
            <span className="msm-hint">Round the composer input container.</span>
          </div>
          <div className="msm-range">
            <input
              aria-label="Input corner radius"
              type="range"
              min={INPUT_RADIUS.min}
              max={INPUT_RADIUS.max}
              step={1}
              value={state.inputRadius}
              onChange={(event) => update({ inputRadius: Number(event.currentTarget.value) })}
            />
            <output>{state.inputRadius}px</output>
          </div>
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Input font size</span>
            <span className="msm-hint">Size of the composer text and placeholder.</span>
          </div>
          <div className="msm-range">
            <input
              aria-label="Input font size"
              type="range"
              min={INPUT_FONT_SIZE.min}
              max={INPUT_FONT_SIZE.max}
              step={1}
              value={state.inputFontSize}
              onChange={(event) => update({ inputFontSize: Number(event.currentTarget.value) })}
            />
            <output>{state.inputFontSize}px</output>
          </div>
        </div>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Hide composer meta</span>
            <span className="msm-hint">Hide the turn, token, and context statistics below the composer.</span>
          </div>
          <Switch label="Hide composer meta" checked={state.hideComposerMeta} onChange={(value) => update({ hideComposerMeta: value })} />
        </div>
      </section>

      <section className="msm-card" aria-labelledby="msm-area-preset-title">
        <h3 className="msm-card-title" id="msm-area-preset-title">Area: preset</h3>
        <div className="msm-row">
          <div className="msm-copy">
            <span className="msm-label">Hide preset descriptions</span>
            <span className="msm-hint">Hide the description under each entry of the preset picker.</span>
          </div>
          <Switch label="Hide preset descriptions" checked={state.hidePresetDescriptions} onChange={(value) => update({ hidePresetDescriptions: value })} />
        </div>
      </section>

      <section className="msm-card" aria-labelledby="msm-compat-title">
        <h3 className="msm-card-title" id="msm-compat-title">Compatibility</h3>
        <div className="msm-kv">
          <span>Host anchors</span>
          <span>{Object.values(health.anchors).filter(Boolean).length} / {Object.keys(health.anchors).length}</span>
        </div>
        <ul className="msm-anchor-list">
          {Object.entries(health.anchors).map(([name, found]) => (
            <li key={name} className={found ? "msm-anchor msm-anchor-found" : "msm-anchor msm-anchor-missing"}>
              <span>{name}</span>
              <span>{found ? "Found" : "Missing"}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="msm-button" onClick={recheckHealth}>Recheck anchors</button>
        {controller.errors.length > 0 ? (
          <div className="msm-errors" role="alert">
            <strong>Feature errors</strong>
            <ul>
              {controller.errors.map((error, index) => (
                <li key={index + ":" + error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="msm-actions">
        <button
          type="button"
          className={confirmReset ? "msm-button msm-button-danger" : "msm-button"}
          onClick={() => {
            if (!confirmReset) {
              setConfirmReset(true)
              return
            }
            controller.store.reset()
            setConfirmReset(false)
          }}
        >
          {confirmReset ? "Click again to reset" : "Reset to defaults"}
        </button>
      </div>
    </div>
  )
}
