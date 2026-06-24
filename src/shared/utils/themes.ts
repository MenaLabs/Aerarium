// Theme catalog. Each theme is a complete set of CSS custom properties applied
// to <html> at runtime. Generated from the Aerarium visual-identity directions
// (Vault / Aureus / Ledger, each in dark & light) plus standalone Light and Gold.

export interface ThemeDef {
  id: string;
  name: string;
  tokens: Record<string, string>;
}

export const THEMES: ThemeDef[] = [
  {
    id: 'vault',
    name: 'Vault',
    tokens: {
      '--bg-base': '#0c1118', '--bg-surface': '#121a24', '--bg-card': '#18222e',
      '--bg-hover': '#202d3b', '--border': '#2a3744', '--text-1': '#e9eef5',
      '--text-2': '#9fb1c4', '--text-3': '#647689', '--blue': '#4f8df7',
      '--green': '#3fbd80', '--red': '#f15a51', '--amber': '#e2a23c', '--purple': '#a97ef2',
      '--on-accent': '#ffffff', '--accent-gradient': 'linear-gradient(135deg, #3f7de8, #6ba3ff)',
    },
  },
  {
    id: 'vault-light',
    name: 'Vault Light',
    tokens: {
      '--bg-base': '#eef1f6', '--bg-surface': '#ffffff', '--bg-card': '#ffffff',
      '--bg-hover': '#e7ecf3', '--border': '#d7deea', '--text-1': '#131e2b',
      '--text-2': '#495a6e', '--text-3': '#7e90a4', '--blue': '#2f6fe0',
      '--green': '#1f9d63', '--red': '#d83f37', '--amber': '#b9791a', '--purple': '#7d4fd6',
      '--on-accent': '#ffffff', '--accent-gradient': 'linear-gradient(135deg, #2a63cf, #4f86f0)',
    },
  },
  {
    id: 'aureus',
    name: 'Aureus',
    tokens: {
      '--bg-base': '#161109', '--bg-surface': '#1d1710', '--bg-card': '#251d12',
      '--bg-hover': '#2e2417', '--border': '#3b2f1d', '--text-1': '#f3ead7',
      '--text-2': '#c4b393', '--text-3': '#8c7a5c', '--blue': '#6f97c9',
      '--green': '#7fa45f', '--red': '#d76a4d', '--amber': '#d4a24a', '--purple': '#b07fa6',
      '--on-accent': '#241c0d', '--accent-gradient': 'linear-gradient(135deg, #c79a3e, #e7c061)',
    },
  },
  {
    id: 'aureus-light',
    name: 'Aureus Light',
    tokens: {
      '--bg-base': '#ece2cd', '--bg-surface': '#f6efe0', '--bg-card': '#fbf6ea',
      '--bg-hover': '#eae0c9', '--border': '#d9c9a8', '--text-1': '#2c2212',
      '--text-2': '#5e5036', '--text-3': '#8b7c5c', '--blue': '#3b6ea3',
      '--green': '#5b7d3c', '--red': '#b4502f', '--amber': '#9a6e16', '--purple': '#855073',
      '--on-accent': '#ffffff', '--accent-gradient': 'linear-gradient(135deg, #8a6312, #b58a2e)',
    },
  },
  {
    id: 'ledger',
    name: 'Ledger',
    tokens: {
      '--bg-base': '#0a0a0b', '--bg-surface': '#121214', '--bg-card': '#161618',
      '--bg-hover': '#1e1e21', '--border': '#2a2a2e', '--text-1': '#fafafa',
      '--text-2': '#a2a2a8', '--text-3': '#6c6c73', '--blue': '#4d7cff',
      '--green': '#2fc56b', '--red': '#ff5247', '--amber': '#f5b13d', '--purple': '#9a6bff',
      '--on-accent': '#ffffff', '--accent-gradient': 'linear-gradient(135deg, #3f6dff, #6f97ff)',
    },
  },
  {
    id: 'ledger-light',
    name: 'Ledger Light',
    tokens: {
      '--bg-base': '#fafafa', '--bg-surface': '#ffffff', '--bg-card': '#ffffff',
      '--bg-hover': '#f0f0f1', '--border': '#e3e3e6', '--text-1': '#0a0a0b',
      '--text-2': '#51515a', '--text-3': '#8c8c93', '--blue': '#2f5cff',
      '--green': '#11a155', '--red': '#e23a30', '--amber': '#b9791a', '--purple': '#6d3fe0',
      '--on-accent': '#ffffff', '--accent-gradient': 'linear-gradient(135deg, #2549e0, #4d7cff)',
    },
  },
  {
    id: 'light',
    name: 'Light',
    tokens: {
      '--bg-base': '#f4f1ea', '--bg-surface': '#fbf9f4', '--bg-card': '#ffffff',
      '--bg-hover': '#efece3', '--border': '#e0dccf', '--text-1': '#1c1a16',
      '--text-2': '#54504a', '--text-3': '#8d887e', '--blue': '#2f5fc9',
      '--green': '#1f8f57', '--red': '#cf3b34', '--amber': '#b07d12', '--purple': '#6f4bc7',
      '--on-accent': '#ffffff', '--accent-gradient': 'linear-gradient(135deg, #2b5fc9, #5a93f5)',
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    tokens: {
      '--bg-base': '#16120B', '--bg-surface': '#1F1810', '--bg-card': '#261E12',
      '--bg-hover': '#312715', '--border': '#3A2F1C', '--text-1': '#F5ECD8',
      '--text-2': '#B8A77E', '--text-3': '#7A6E50', '--blue': '#7FA8D8',
      '--green': '#86B45E', '--red': '#DB7A53', '--amber': '#D4AF37', '--purple': '#C291B0',
      '--on-accent': '#1A1407',
      '--accent-gradient': 'linear-gradient(135deg, #C9A227, #F0D67A, #D4AF37)',
    },
  },
];

export const DEFAULT_THEME_ID = 'vault';

export const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]));

export function applyTheme(id: string): void {
  const theme = THEME_BY_ID.get(id) ?? THEME_BY_ID.get(DEFAULT_THEME_ID)!;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.tokens)) {
    root.style.setProperty(key, value);
  }
}
