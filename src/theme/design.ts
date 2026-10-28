/** Native type and spacing roles from the supplied design-system board. */
export const type = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: -1.1,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  section: { fontSize: 20, lineHeight: 26, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 24 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
  meta: { fontSize: 12, lineHeight: 16 },
} as const;
export const spacing = {
  page: 24,
  section: 24,
  control: 16,
  compact: 8,
} as const;
