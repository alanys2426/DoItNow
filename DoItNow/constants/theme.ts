
import { ColorSchemeName, Platform } from 'react-native';

// App color palette
export const palette = {
  inkBlack: '#040F0F',
  whiteSmoke: '#F2F2F2',
  shadowGray: '#2E282A',
  mintLeaf: '#49AE79',
  mintLeafHover: '#5EB88A',
  mintLeafPressed: '#3D8F63',
  slateGray: '#627C85',
} as const; // 

// Possible board column IDs
export type BoardColumnId = 
  | 'todo'
  | 'inprogress'
  | 'review'
  | 'done';

// List of board columns
export const boardColumns: Array<{
  id: BoardColumnId;
  label: string;
}> = [
  { id: 'todo', label: 'To Do' },
  { id: 'inprogress', label: 'In Progress' },
  { id: 'review', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

// Platform-specific fonts
export const Fonts = Platform.select({
  ios: {
    heading: 'ui-rounded',
    body: 'system-ui',
  },
  web: {
    heading: "'SF Pro Rounded', 'Segoe UI', Inter, Arial, sans-serif",
    body: "Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  },
  default: {
    heading: 'sans-serif',
    body: 'sans-serif',
  },
});

// Type for app theme object
export type AppTheme = ReturnType<typeof getAppTheme>;

// Function to generate app theme
export function getAppTheme (
  colorScheme: ColorSchemeName
) {

  // Check if dark mode is active
  const dark = colorScheme === 'dark';

  // Return theme object
  return {
    // Boolean showing if theme is dark
    dark,

    // App colors
    colors: {

      background: dark ? palette.inkBlack : palette.whiteSmoke,
      surface: dark ? palette.shadowGray : palette.whiteSmoke,
      surfaceAlt: dark ? palette.inkBlack : palette.whiteSmoke,
      text: dark ? palette.whiteSmoke : palette.shadowGray,
      textMuted: palette.slateGray,
      border: dark ? palette.slateGray : palette.shadowGray,
      accent: palette.mintLeaf,
      accentSoft: palette.shadowGray,
      danger: '#B3261E',
    },

    // App fonts
    fonts: Fonts,
  };
}