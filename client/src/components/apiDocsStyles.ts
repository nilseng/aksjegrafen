// Shared "cleaner neumorphic" surfaces for the API docs: keeps the site's soft-shadow
// language but swaps the muddy warm-grey shadows for cooler, lighter ones and lifts the
// content onto crisp white surfaces so the teal reads as a clean accent instead of dirty.
interface DocsTheme {
  id: string;
  text: string;
  primary: string;
  backgroundSecondary: string;
}

export const docsStyles = (theme: DocsTheme) => {
  const isDark = theme.id === "dark";

  const raised = isDark
    ? "5px 5px 12px rgba(0,0,0,0.32), -5px -5px 12px rgba(255,255,255,0.035)"
    : "6px 6px 16px rgba(196,203,214,0.5), -6px -6px 16px rgba(255,255,255,0.9)";
  const inset = isDark
    ? "inset 2px 2px 6px rgba(0,0,0,0.4)"
    : "inset 2px 2px 6px rgba(196,203,214,0.55), inset -2px -2px 6px rgba(255,255,255,0.95)";
  const panelInset = isDark
    ? "inset 1px 1px 4px rgba(0,0,0,0.3)"
    : "inset 1px 1px 4px rgba(196,203,214,0.4), inset -1px -1px 4px rgba(255,255,255,0.9)";

  return {
    isDark,
    // Outer info-page container.
    panel: {
      backgroundColor: isDark ? theme.backgroundSecondary : "#ffffff",
      borderRadius: 12,
      boxShadow: panelInset,
    },
    // A raised endpoint card.
    card: {
      backgroundColor: isDark ? "#3a4046" : "#ffffff",
      borderRadius: 12,
      boxShadow: raised,
    },
    // An inset code / info well.
    code: {
      backgroundColor: isDark ? "#23282d" : "#f4f6f9",
      color: theme.text,
      borderRadius: 8,
      boxShadow: inset,
    },
  };
};
