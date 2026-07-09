"use client";

import { useEffect, useState } from "react";

/**
 * Hook for detecting device capabilities
 * Mobile detection, iOS detection, WebXR support
 */

export interface DeviceInfo {
  /** Is mobile device (iOS or Android) */
  isMobile: boolean;
  /** Is iOS device (iPhone, iPad, iPod) */
  isIOS: boolean;
  /** Is Android device */
  isAndroid: boolean;
  /** Supports WebXR AR measurement */
  canMeasure: boolean;
  /** User agent string (lowercase) */
  userAgent: string;
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    canMeasure: false,
    userAgent: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator?.userAgent?.toLowerCase() ?? "";
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);
    const isMobileDevice = isIOSDevice || isAndroidDevice;

    // Check WebXR support for measurement (Android only)
    const xr = (window.navigator as Navigator & { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } }).xr;
    
    if (!isIOSDevice && xr?.isSessionSupported) {
      xr.isSessionSupported("immersive-ar")
        .then((supported) => {
          setInfo({
            isMobile: isMobileDevice,
            isIOS: isIOSDevice,
            isAndroid: isAndroidDevice,
            canMeasure: supported,
            userAgent: ua,
          });
        })
        .catch(() => {
          setInfo({
            isMobile: isMobileDevice,
            isIOS: isIOSDevice,
            isAndroid: isAndroidDevice,
            canMeasure: false,
            userAgent: ua,
          });
        });
    } else {
      setInfo({
        isMobile: isMobileDevice,
        isIOS: isIOSDevice,
        isAndroid: isAndroidDevice,
        canMeasure: false,
        userAgent: ua,
      });
    }
  }, []);

  return info;
}
