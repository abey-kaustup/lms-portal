export type Theme = 'light' | 'dark' | 'system';

export interface ThemeOption {
  id: Theme;
  label: string;
  description: string;
  iconName: 'Sun' | 'Moon' | 'Monitor';
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    label: 'Light',
    description: 'Clean & crisp appearance',
    iconName: 'Sun',
  },
  {
    id: 'dark',
    label: 'Dark',
    description: 'Sleek & high-contrast mode',
    iconName: 'Moon',
  },
  {
    id: 'system',
    label: 'System',
    description: 'Match device settings',
    iconName: 'Monitor',
  },
];
