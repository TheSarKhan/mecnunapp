// Shim so the design-kit components (copied verbatim from docs/design/mecnun-ui-kit)
// keep importing './tokens' while the real values live in src/theme.
// Edit src/theme/colors.ts — never this file.
export { kitColors as colors, radii, spacing, fontFamily, type, bubbleMaxWidth } from '../../theme';
