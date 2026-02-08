'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColors: (colors: ThemeColors) => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colors, setColors] = useState<ThemeColors>({
    primaryColor: '#E35336', // Burnt sienna - primary action color
    secondaryColor: '#A0522D', // Saddle brown - secondary/structural color
  });
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Supporting colors for the burnt sienna palette
  const supportingColors = {
    beige: '#F5F5DC',     // Beige - light backgrounds and subtle accents
    sandyBrown: '#F4A460', // Sandy brown - hover states and section differentiation
  };

  // Detect dark mode and fetch theme colors from API
  useEffect(() => {
    const detectDarkMode = () => {
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);

        // Apply dark class to html element
        const html = document.documentElement;
        if (prefersDark) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    };

    const fetchThemeColors = async () => {
      try {
        const response = await fetch('/api/settings/general');
        if (response.ok) {
          const settings = await response.json();
          setColors({
            primaryColor: settings.primaryColor || '#000000',
            secondaryColor: settings.secondaryColor || '#666666',
          });
        }
      } catch (error) {
        console.error('Error fetching theme colors:', error);
      } finally {
        setLoading(false);
      }
    };

    detectDarkMode();
    fetchThemeColors();

    // Listen for dark mode changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        const html = document.documentElement;
        if (e.matches) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Apply CSS custom properties when colors change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;

      // Set the legacy custom color variables for backward compatibility
      root.style.setProperty('--color-primary', colors.primaryColor);
      root.style.setProperty('--color-secondary', colors.secondaryColor);

      // Set supporting colors as CSS variables
      root.style.setProperty('--color-beige', supportingColors.beige);
      root.style.setProperty('--color-sandy-brown', supportingColors.sandyBrown);

      // Generate comprehensive color palettes for all 4 colors
      const primaryPalette = generateColorPalette(colors.primaryColor);
      const secondaryPalette = generateColorPalette(colors.secondaryColor);
      const beigePalette = generateColorPalette(supportingColors.beige);
      const sandyBrownPalette = generateColorPalette(supportingColors.sandyBrown);

      // Set primary color variants (Burnt Sienna)
      Object.entries(primaryPalette).forEach(([shade, hsl]) => {
        root.style.setProperty(`--primary-${shade}`, hsl);
      });

      // Set secondary color variants (Saddle Brown)
      Object.entries(secondaryPalette).forEach(([shade, hsl]) => {
        root.style.setProperty(`--secondary-${shade}`, hsl);
      });

      // Set beige color variants
      Object.entries(beigePalette).forEach(([shade, hsl]) => {
        root.style.setProperty(`--beige-${shade}`, hsl);
      });

      // Set sandy brown color variants
      Object.entries(sandyBrownPalette).forEach(([shade, hsl]) => {
        root.style.setProperty(`--sandy-${shade}`, hsl);
      });

      // Set the main primary and secondary colors
      root.style.setProperty('--primary', primaryPalette['600'] || primaryPalette['500']);
      root.style.setProperty('--secondary', secondaryPalette['600'] || secondaryPalette['500']);

      // Set foreground colors with proper contrast
      const primaryForeground = getContrastColor(colors.primaryColor);
      const secondaryForeground = getContrastColor(colors.secondaryColor);
      root.style.setProperty('--primary-foreground', primaryForeground);
      root.style.setProperty('--secondary-foreground', secondaryForeground);

      // Update ring color to use primary for focus states
      root.style.setProperty('--ring', primaryPalette['600'] || primaryPalette['500']);

      // Update adaptive colors to use the new burnt sienna palette
      if (!isDarkMode) {
        // Light mode - use beige and light variants
        root.style.setProperty('--muted', beigePalette['200']); // Light beige for muted backgrounds
        root.style.setProperty('--accent', sandyBrownPalette['100']); // Light sandy brown for accents
        root.style.setProperty('--accent-foreground', primaryPalette['800']); // Dark burnt sienna for text
        root.style.setProperty('--card', beigePalette['50']); // Very light beige for cards
        root.style.setProperty('--border', sandyBrownPalette['200']); // Light sandy brown for borders
      } else {
        // Dark mode - use darker variants
        root.style.setProperty('--muted', secondaryPalette['800']); // Dark saddle brown
        root.style.setProperty('--accent', primaryPalette['700']); // Dark burnt sienna
        root.style.setProperty('--accent-foreground', beigePalette['100']); // Light beige for text
        root.style.setProperty('--card', secondaryPalette['900']); // Very dark saddle brown
        root.style.setProperty('--border', sandyBrownPalette['600']); // Medium sandy brown for borders
      }

      // Set background color to use beige in light mode
      if (!isDarkMode) {
        root.style.setProperty('--background', beigePalette['50']); // Very light beige background
      }
    }
  }, [colors, isDarkMode, supportingColors]);

  const updateColors = (newColors: ThemeColors) => {
    setColors(newColors);
  };

  const contextValue: ThemeContextType = {
    colors,
    updateColors,
    loading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Parse r, g, b values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Convert to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Helper function to generate a complete color palette from a base color
function generateColorPalette(baseColor: string): Record<string, string> {
  const hsl = hexToHslValues(baseColor);

  // Generate shades from 50 (lightest) to 950 (darkest)
  const palette: Record<string, string> = {};

  // Define lightness values for each shade
  const lightnessMap = {
    '50': 98,
    '100': 95,
    '200': 87,
    '300': 78,
    '400': 65,
    '500': hsl.l, // Use original lightness as 500
    '600': Math.max(hsl.l - 10, 25),
    '700': Math.max(hsl.l - 20, 20),
    '800': Math.max(hsl.l - 30, 15),
    '900': Math.max(hsl.l - 40, 10),
    '950': Math.max(hsl.l - 50, 5),
  };

  // Generate each shade
  Object.entries(lightnessMap).forEach(([shade, lightness]) => {
    // Adjust saturation for very light and very dark shades
    let saturation = hsl.s;
    if (shade === '50' || shade === '100') {
      saturation = Math.max(saturation - 20, 10);
    } else if (shade === '900' || shade === '950') {
      saturation = Math.min(saturation + 10, 100);
    }

    palette[shade] = `${hsl.h} ${saturation}% ${lightness}%`;
  });

  return palette;
}

// Helper function to convert hex to HSL values (separate h, s, l)
function hexToHslValues(hex: string): { h: number; s: number; l: number } {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Parse r, g, b values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Convert to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Helper function to get contrast color (white or black) based on background color
function getContrastColor(hex: string): string {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Parse r, g, b values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '0 0% 9%' : '0 0% 98%';
}
