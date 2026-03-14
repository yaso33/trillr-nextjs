import { useCallback, useEffect, useState } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  isHighDPI: boolean;
  prefersReducedMotion: boolean;
  prefersColorScheme: 'light' | 'dark';
  prefersContrast: boolean;
  hasNotch: boolean;
}

// A helper function to check for mobile user agent
const isMobileUserAgent = () => {
  if (typeof navigator === 'undefined') return false;

  // navigator.userAgentData is the new way, but not fully supported.
  if (navigator.userAgentData) {
    return navigator.userAgentData.mobile;
  }
  // Fallback to the old userAgent string.
  return /Mobi/i.test(navigator.userAgent);
};

/**
 * Hook for detecting device characteristics and responsive behavior
 * Provides real-time updates to device properties
 */
export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => getDeviceInfo());

  const updateDeviceInfo = useCallback(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    // Listen for media query changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');

    darkModeQuery.addEventListener('change', updateDeviceInfo);
    reducedMotionQuery.addEventListener('change', updateDeviceInfo);
    contrastQuery.addEventListener('change', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      darkModeQuery.removeEventListener('change', updateDeviceInfo);
      reducedMotionQuery.removeEventListener('change', updateDeviceInfo);
      contrastQuery.removeEventListener('change', updateDeviceInfo);
    };
  }, [updateDeviceInfo]);

  return deviceInfo;
}

/**
 * Get current device information
 */
function getDeviceInfo(): DeviceInfo {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;

  // Detect device type
  const isMobile = isMobileUserAgent() && screenWidth < 768;  const isTablet = screenWidth >= 768 && screenWidth < 1025;
  const isDesktop = screenWidth >= 1025;

  // Detect touch capability
  const isTouchDevice = () => {
    return (
      (typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
          (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0) ||
          ((navigator as any).msMaxTouchPoints !== undefined && (navigator as any).msMaxTouchPoints > 0))) ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches
    );
  };

  // Detect orientation
  const isLandscape = screenWidth > screenHeight;

  // Detect high DPI
  const isHighDPI = pixelRatio >= 2;

  // Detect accessibility preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersColorScheme = window.matchM