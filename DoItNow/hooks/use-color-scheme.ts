
// Import a custom hook that gives theme info (light/dark)
import { useThemeMode } from '@/context/theme-mode-context';

// Get current color scheme
export function useColorScheme() {
  const { resolvedScheme } = useThemeMode();
  return resolvedScheme;
}