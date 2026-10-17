/** CSS imported with ?inline is bundled as a string; no separate stylesheet is emitted. */
declare module "*.css?inline" {
  const css: string
  export default css
}
