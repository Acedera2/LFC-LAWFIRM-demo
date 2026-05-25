export function useTheme() {
  // Dark mode removed for demo — always report light theme and provide noop toggle
  return { theme: "light", toggleTheme: () => {} };
}
