import { createElement } from "react"
import { PKG } from "../../shared/identity"
import { Section } from "../slots/Section"
import type { MsmFeature } from "./registry"

export const settingsFeature: MsmFeature = {
  name: "settings",
  install(controller, ctx) {
    const MobileStylesSection = (props: { close: () => void }) =>
      createElement(Section, { close: props.close, controller })

    return ctx.slots.inject("settings.section", () =>
      ctx.slots.register({
        name: "settings.section",
        id: PKG,
        order: 60,
        label: () => "Mobile styles",
        registrant: PKG,
      }, MobileStylesSection),
    )
  },
}
