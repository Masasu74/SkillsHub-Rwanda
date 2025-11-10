import { useEffect } from 'react';
import { useSystemSettings } from '../context/SystemSettingsContext';

const DynamicFavicon = () => {
  const { settings } = useSystemSettings();

  useEffect(() => {
    const updateFavicon = () => {
      // Remove existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(link => link.remove());
      
      let faviconUrl = '';
      let faviconType = 'image/x-icon';
      
      const defaultIcon =
        'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2212%22 fill=%22%237c3aed%22/%3E%3Ctext x=%2232%22 y=%2239%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2228%22 fill=%22white%22%3ESH%3C/text%3E%3C/svg%3E';

      if (settings?.favicon) {
        if (settings.favicon.startsWith('http')) {
          faviconUrl = settings.favicon;
        } else {
          faviconUrl = settings.favicon.startsWith('/') ? settings.favicon : `/${settings.favicon}`;
        }
        
        // Set appropriate type based on file extension
        const fileExt = settings.favicon.split('.').pop()?.toLowerCase();
        if (fileExt === 'ico') {
          faviconType = 'image/x-icon';
        } else if (fileExt === 'png') {
          faviconType = 'image/png';
        } else {
          faviconType = 'image/x-icon';
        }
      } else {
        faviconUrl = defaultIcon;
        faviconType = 'image/svg+xml';
      }
      
      // Add cache-busting parameter
      const cacheBuster = Date.now();
      const finalUrl = faviconUrl + (faviconUrl.includes('?') ? '&' : '?') + 'v=' + cacheBuster;
      
      // Create multiple favicon links for better browser compatibility
      const faviconLinks = [
        { rel: 'shortcut icon', type: faviconType, href: finalUrl },
        { rel: 'icon', type: faviconType, href: finalUrl },
        { rel: 'apple-touch-icon', type: faviconType, href: finalUrl }
      ];
      
      faviconLinks.forEach(({ rel, type, href }) => {
        const link = document.createElement('link');
        link.rel = rel;
        link.type = type;
        link.href = href;
        document.head.appendChild(link);
      });
      
      // Note: Title updates are handled by DynamicTitle component
    };

    updateFavicon();

    // Listen for favicon update events
    const handleFaviconUpdate = () => {
      if (import.meta.env.MODE === 'development') {
        console.log('Favicon update event received');
      }
      updateFavicon();
    };

    window.addEventListener('faviconUpdated', handleFaviconUpdate);

    return () => {
      window.removeEventListener('faviconUpdated', handleFaviconUpdate);
    };
  }, [settings?.favicon]);

  return null; // This component doesn't render anything
};

export default DynamicFavicon;
