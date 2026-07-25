// App - Configuration Tailwind, bibliothèque d'icônes et rendus partagés (header, sidebar, topbar).

// ===== Configuration Tailwind =====
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:'#EBFBEE',100:'#D3F9D8',200:'#96F2D7',300:'#63E6BE',400:'#38D9A9',
          500:'#20C997',600:'#198754',700:'#146C43',800:'#0F5132',900:'#0B3D2E',950:'#072B1F'
        },
        danger: {
          50:'#FDEDEC',100:'#FADBD8',200:'#F5B7B1',300:'#F1948A',400:'#F06B5E',
          500:'#E74C3C',600:'#C0392B',700:'#9B2C38',800:'#7A1E28',900:'#58151C'
        },
        gold: {
          50:'#FEF7E0',100:'#FAEAB8',200:'#F5D97A',300:'#F0C94D',400:'#E8B830',
          500:'#D4A017',600:'#B8860B',700:'#996B13',800:'#7A5310',900:'#5C3D0E'
        },
        info: {
          50:'#F2F5FA',100:'#E8EDF7',200:'#D1DCF0',300:'#B3C7E0',400:'#8FAED4',
          500:'#6B8FCA',600:'#4A6FA5',700:'#3D5289',800:'#2C3E6B',900:'#1B2A4A',950:'#111C33'
        },
        admin: {
          50:'#F3F1FA',100:'#E2DFF0',200:'#C9C2E3',300:'#AEA3D4',400:'#9585C4',
          500:'#7B68AE',600:'#5C4D8A',700:'#4A3B6B',800:'#3D2A6B',900:'#2D1F4E'
        },
        neutral: {
          0:'#FFFFFF',50:'#F8F9FA',100:'#E9ECEF',200:'#DEE2E6',300:'#CED4DA',
          400:'#ADB5BD',500:'#6C757D',600:'#495057',700:'#2D2D44',800:'#1A1A2E',900:'#0F0F1A'
        }
      },
      borderRadius: {
        'cs-xs':'4px', 'cs-sm':'6px', 'cs-md':'10px', 'cs-lg':'16px', 'cs-xl':'24px'
      },
      boxShadow: {
        'cs-soft':   '0 1px 3px 0 rgba(26,26,46,0.06), 0 1px 2px -1px rgba(26,26,46,0.06)',
        'cs-medium': '0 4px 6px -1px rgba(26,26,46,0.08), 0 2px 4px -2px rgba(26,26,46,0.06)',
        'cs-strong': '0 10px 15px -3px rgba(26,26,46,0.10), 0 4px 6px -4px rgba(26,26,46,0.06)',
        'cs-focus':  '0 0 0 3px rgba(15,81,50,0.30)'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace']
      }
    }
  }
};

// ===== Bibliothèque d'icônes Lucide =====
var ICONS = {
  'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'dashboard': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'folder': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  'folder-heart': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.8.66 11 11 0 0 1-10 12.38Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/>',
  'folder-open': '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
  'calendar': '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/>',
  'calendar-check': '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/><path d="m9 16 2 2 4-4"/>',
  'calendar-days': '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  'calendar-x': '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/><path d="m9 16 6-6M15 16l-6-6"/>',
  'calendar-range': '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/><path d="M7 16h10"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'user': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  'user-plus': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
  'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
  'stethoscope': '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  'pill': '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
  'syringe': '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15.5 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>',
  'heart-pulse': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
  'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4M12 16h.01"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  'plus': '<path d="M5 12h14M12 5v14"/>',
  'pencil': '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  'trash': '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>',
  'printer': '<path d="M6 18h12M6 6v12M18 6v12"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>',
  'check': '<polyline points="20 6 9 17 4 12"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'x': '<path d="M18 6 6 18M6 6l12 12"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'building': '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>',
  'building-2': '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  'unlock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
  'key': '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  'play': '<polygon points="6 3 20 12 6 21 6 3"/>',
  'activity': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  'clipboard': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  'clipboard-list': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  'award': '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  'badge-check': '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  'droplets': '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 4.7 7 2c-.29 2.7-1.15 4.13-2.29 5.06S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05Z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  'hospital': '<path d="M12 6v4M8 8h8M3 21h18M5 21V7l7-4 7 4v14"/><path d="M12 21v-4M9 21v-4M15 21v-4"/>',
  'menu': '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  'arrow-up': '<path d="M12 19V5M5 12l7-7 7 7"/>',
  'arrow-down': '<path d="M12 5v14M19 12l-7 7-7-7"/>',
  'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  'edit': '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
  'list': '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  'bar-chart': '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  'bar-chart-3': '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  'test-tube': '<path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7M14.5 16h-5"/>',
  'scan': '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
  'monitor': '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  'smartphone': '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  'tablet': '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/>',
  'megaphone': '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  'lock-keyhole': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/>',
  'file-heart': '<path d="M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18l-4-2-4 2-4-2-4 2z"/><path d="M10.29 11.51c-.39-.39-1.02-.39-1.41 0l-.71.71-.71-.71c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l.71.71-.71.71c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l.71-.71.71.71c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-.71-.71.71-.71c.39-.39.39-1.02 0-1.41z"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
  'rotate-ccw': '<path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/>',
  'flask': '<path d="M15 2v8.4l5.4 9.6a2 2 0 0 1-1.7 3H5.3a2 2 0 0 1-1.7-3L9 10.4V2"/><path d="M8 2h8M7 16h10"/>',
  'siren': '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2zm5-16a1 1 0 1 0 2 0V2a1 1 0 0 0-2 0zm8 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM3 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm18 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>',
  'save': '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7M7 3v4a1 1 0 0 0 1 1h7"/>',
  'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
  'message-circle': '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  'external-link': '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'paperclip': '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  'file': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  'file-plus': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M12 18v-6M9 15h6"/>',
  'image': '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/>',
  'graduate': '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  'handshake': '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="M21 14 16 9M3 21l5-5M3 9l5-5"/>',
  'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'quote': '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h1"/>',
  'circle-user': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>',
  'grid-2x2': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18M12 3v18"/>',
  'layout-list': '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  'network': '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
  'git-fork': '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9M12 12v3"/>',
  'briefcase': '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
  'mail-open': '<path d="M21.5 7.5 12 13 2.5 7.5"/><path d="M2.5 7.5v9a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-9a2 2 0 0 0-1.07-1.78l-7.5-4a2 2 0 0 0-1.86 0l-7.5 4A2 2 0 0 0 2.5 7.5z"/>',
  'hand-heart': '<path d="M11 14h2a2 2 0 0 0 2-2 2 2 0 0 0-2-2H5a4 4 0 0 0-4 4 4 4 0 0 0 4 4h6m5-4a4 4 0 1 1 8 0 4 4 0 0 1-8 0z"/><path d="m7 11 5-5a2.83 2.83 0 0 1 4 0l3 3a2.83 2.83 0 0 1 0 4l-7 7"/>',
  'languages': '<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
  'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4"/>',
  'gem': '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6M2 9h20"/>',
  'printer-check': '<path d="M6 18h12M6 6v12M18 6v12"/><path d="M6 14H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="m9 14 2 2 4-4"/>',
  'shuffle': '<path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22M2 6h1.4c1.3 0 2.5.6 3.3 1.7l6.1 8.6c.7 1.1 2 1.7 3.3 1.7H22M18 2l4 4-4 4M18 14l4 4-4 4"/>',
  'send': '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  'fingerprint': '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88M17.29 21.02c.12-.6.43-2.3.5-3.02M2 12a10 10 0 0 1 18-6M2 16h.01M7.5 13.5c.5 1.5 1.5 3.5 3 5M9.5 21.02c.12-.6.43-2.3.5-3.02"/>',
  'sparkles': '<path d="M9.937 15.503A5 5 0 0 0 8.5 12.06a5 5 0 0 0-3.443-1.437A5 5 0 0 0 8.5 9.19a5 5 0 0 0 1.437-3.443 5 5 0 0 0 1.437 3.443 5 5 0 0 0 3.443 1.437 5 5 0 0 0-3.443 1.437 5 5 0 0 0-1.437 3.443zM20 16v6M23 19h-6"/>',
  'qrcode': '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2M3 21h6M16 16h2a1 1 0 0 1 1 1v2M9 16v5M11 16v3a1 1 0 0 0 1 1h3M16 8v4M21 9v3a1 1 0 0 1-1 1h-3M3 9v4M9 9a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1z"/>',
  'wifi': '<path d="M12 20h.01M2 8.82a15 15 0 0 1 20 0M5 12.859a10 10 0 0 1 14 0M8.5 16.429a5 5 0 0 1 7 0"/>',
  'thermometer': '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>'
};

/**
 * Retourne un élément SVG pour une icône donnée
 * @param {string} name - nom de l'icône
 * @param {number} size - taille en pixels (défaut 20)
 * @param {string} extraClass - classes additionnelles
 * @returns {string} HTML SVG
 */
function icon(name, size, extraClass) {
  size = size || 20;
  extraClass = extraClass || '';
  const path = ICONS[name];
  if (!path) {
    console.warn('Icône introuvable:', name);
    return '';
  }
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' + extraClass + '" aria-hidden="true">' + path + '</svg>';
}

/**
 * Injecte une icône dans un élément cible
 * @param {string} selector - sélecteur CSS
 * @param {string} name - nom icône
 * @param {number} size
 */
function setIcon(selector, name, size) {
  const els = document.querySelectorAll(selector);
  els.forEach(function (el) { el.innerHTML = icon(name, size); });
}

// ===== Logo SVG =====
function logoSVG(size) {
  size = size || 36;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect width="48" height="48" rx="12" fill="#0F5132"/>' +
    '<path d="M24 12V36M12 24H36" stroke="white" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="24" cy="24" r="4" fill="#D4A017"/>' +
    '</svg>';
}

// ===== Header public =====
function renderPublicHeader(activePage) {
  const navItems = [
    { href: '../index.html', label: 'Accueil', icon: 'home', key: 'index' },
    { href: 'presentation.html', label: 'Présentation', icon: 'info', key: 'presentation' },
    { href: 'partenaires.html', label: 'Partenaires', icon: 'handshake', key: 'partenaires' },
    { href: 'faq.html', label: 'FAQ', icon: 'help-circle', key: 'faq' },
    { href: 'contact.html', label: 'Contact', icon: 'mail', key: 'contact' }
  ];

  const navHtml = navItems.map(function (item) {
    const isActive = item.key === activePage ? 'text-primary-700 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-700';
    return '<a href="' + item.href + '" class="flex items-center gap-2 px-3 py-2 rounded-cs-sm text-sm font-medium transition ' + isActive + '">' +
      icon(item.icon, 16) + '<span class="hidden sm:inline">' + item.label + '</span></a>';
  }).join('');

  return '<header class="cs-public-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100">' +
    '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
      '<div class="flex items-center justify-between h-16">' +
        '<a href="../index.html" class="flex items-center gap-2.5">' + logoSVG(36) +
          '<div><div class="font-serif font-bold text-primary-800 text-lg leading-none">CareSync</div>' +
          '<div class="text-[10px] text-neutral-500 font-mono leading-none mt-0.5">EHR · Burkina Faso</div></div>' +
        '</a>' +
        '<nav class="hidden md:flex items-center gap-1">' + navHtml + '</nav>' +
        '<div class="flex items-center gap-2">' +
          '<button id="cs-sim-trigger-header" class="cs-btn cs-btn-warning cs-btn-sm" type="button" aria-label="Lancer la simulation">' +
            icon('play', 16) + '<span class="hidden sm:inline">Démo</span></button>' +
          '<a href="auth.html" class="cs-btn cs-btn-primary cs-btn-sm">' + icon('log-out', 16) + '<span class="hidden sm:inline">Connexion</span></a>' +
          '<button id="cs-mobile-menu" class="md:hidden cs-btn cs-btn-icon" aria-label="Menu">' + icon('menu', 20) + '</button>' +
        '</div>' +
      '</div>' +
      '<div id="cs-mobile-nav" class="md:hidden hidden pb-4 border-t border-neutral-100 pt-3"><nav class="flex flex-col gap-1">' +
        navItems.map(function (item) {
          return '<a href="' + item.href + '" class="flex items-center gap-2 px-3 py-2 rounded-cs-sm text-sm font-medium text-neutral-700 hover:bg-neutral-100">' + icon(item.icon, 16) + item.label + '</a>';
        }).join('') +
      '</nav></div>' +
    '</div>' +
  '</header>';
}

// ===== Header pour la landing page (index.html à la racine de public/) =====
function renderPublicHeaderRoot(activePage) {
  const navItems = [
    { href: 'index.html', label: 'Accueil', icon: 'home', key: 'index' },
    { href: 'pages/presentation.html', label: 'Présentation', icon: 'info', key: 'presentation' },
    { href: 'pages/partenaires.html', label: 'Partenaires', icon: 'handshake', key: 'partenaires' },
    { href: 'pages/faq.html', label: 'FAQ', icon: 'help-circle', key: 'faq' },
    { href: 'pages/contact.html', label: 'Contact', icon: 'mail', key: 'contact' }
  ];

  const navHtml = navItems.map(function (item) {
    const isActive = item.key === activePage ? 'text-primary-700 bg-primary-50' : 'text-neutral-600 hover:bg-neutral-100 hover:text-primary-700';
    return '<a href="' + item.href + '" class="flex items-center gap-2 px-3 py-2 rounded-cs-sm text-sm font-medium transition ' + isActive + '">' +
      icon(item.icon, 16) + '<span class="hidden sm:inline">' + item.label + '</span></a>';
  }).join('');

  return '<header class="cs-public-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100">' +
    '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
      '<div class="flex items-center justify-between h-16">' +
        '<a href="index.html" class="flex items-center gap-2.5">' + logoSVG(36) +
          '<div><div class="font-serif font-bold text-primary-800 text-lg leading-none">CareSync</div>' +
          '<div class="text-[10px] text-neutral-500 font-mono leading-none mt-0.5">EHR · Burkina Faso</div></div>' +
        '</a>' +
        '<nav class="hidden md:flex items-center gap-1">' + navHtml + '</nav>' +
        '<div class="flex items-center gap-2">' +
          '<button id="cs-sim-trigger-header" class="cs-btn cs-btn-warning cs-btn-sm" type="button" aria-label="Lancer la simulation">' +
            icon('play', 16) + '<span class="hidden sm:inline">Démo</span></button>' +
          '<a href="pages/auth.html" class="cs-btn cs-btn-primary cs-btn-sm">' + icon('log-out', 16) + '<span class="hidden sm:inline">Connexion</span></a>' +
          '<button id="cs-mobile-menu" class="md:hidden cs-btn cs-btn-icon" aria-label="Menu">' + icon('menu', 20) + '</button>' +
        '</div>' +
      '</div>' +
      '<div id="cs-mobile-nav" class="md:hidden hidden pb-4 border-t border-neutral-100 pt-3"><nav class="flex flex-col gap-1">' +
        navItems.map(function (item) {
          return '<a href="' + item.href + '" class="flex items-center gap-2 px-3 py-2 rounded-cs-sm text-sm font-medium text-neutral-700 hover:bg-neutral-100">' + icon(item.icon, 16) + item.label + '</a>';
        }).join('') +
      '</nav></div>' +
    '</div>' +
  '</header>';
}

// ===== Footer public =====
function renderPublicFooter(isRoot) {
  const p = isRoot ? 'pages/' : '';
  const i = isRoot ? '' : '../';
  return '<footer class="bg-neutral-900 text-neutral-300 mt-20">' +
    '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">' +
      '<div class="grid grid-cols-1 md:grid-cols-4 gap-8">' +
        '<div>' +
          '<div class="flex items-center gap-2 mb-4">' + logoSVG(32) +
            '<div><div class="font-serif font-bold text-white">CareSync EHR</div>' +
            '<div class="text-[10px] text-neutral-500 font-mono">Prototype pédagogique</div></div>' +
          '</div>' +
          '<p class="text-sm text-neutral-400 leading-relaxed">Dossier médical électronique pour le Burkina Faso. Conforme à la SNDSN 2023-2027.</p>' +
          '<div class="flex gap-3 mt-4">' +
            '<span class="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-700 cursor-pointer">' + icon('globe', 14) + '</span>' +
            '<span class="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-700 cursor-pointer">' + icon('mail', 14) + '</span>' +
            '<span class="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-primary-700 cursor-pointer">' + icon('message-circle', 14) + '</span>' +
          '</div>' +
        '</div>' +
        '<div>' +
          '<h4 class="text-white font-semibold text-sm mb-4">Plateforme</h4>' +
          '<ul class="space-y-2 text-sm">' +
            '<li><a href="' + i + 'index.html" class="hover:text-white transition">Accueil</a></li>' +
            '<li><a href="' + p + 'presentation.html" class="hover:text-white transition">Présentation</a></li>' +
            '<li><a href="' + p + 'auth.html" class="hover:text-white transition">Connexion</a></li>' +
            '<li><a href="' + p + 'faq.html" class="hover:text-white transition">FAQ</a></li>' +
          '</ul>' +
        '</div>' +
        '<div>' +
          '<h4 class="text-white font-semibold text-sm mb-4">Accès rapide</h4>' +
          '<ul class="space-y-2 text-sm">' +
            '<li><a href="' + p + 'inscription-patient.html" class="hover:text-white transition">Inscription patient</a></li>' +
            '<li><a href="' + p + 'inscription-medecin.html" class="hover:text-white transition">Inscription médecin</a></li>' +
            '<li><a href="' + p + 'partenaires.html" class="hover:text-white transition">Partenaires</a></li>' +
            '<li><a href="' + p + 'contact.html" class="hover:text-white transition">Contact</a></li>' +
          '</ul>' +
        '</div>' +
        '<div>' +
          '<h4 class="text-white font-semibold text-sm mb-4">Contexte</h4>' +
          '<ul class="space-y-2 text-sm">' +
            '<li class="text-neutral-400">Ministère de la Santé BF</li>' +
            '<li class="text-neutral-400">SNDSN 2023-2027</li>' +
            '<li class="text-neutral-400">Conforme WCAG AA</li>' +
            '<li class="text-neutral-400">Données 100% fictives</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="border-t border-neutral-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-neutral-500">' +
        '<span>© 2026 CareSync EHR — Prototype pédagogique. Toutes les données sont fictives.</span>' +
        '<div class="flex gap-4"><a href="#" class="hover:text-white">Mentions légales</a><a href="#" class="hover:text-white">Confidentialité</a></div>' +
      '</div>' +
    '</div>' +
  '</footer>';
}

// ===== Sidebar (pour pages authentifiées) =====
function renderSidebar(role, activePage) {
  const user = Storage.get('user') || {};
  const userInitiales = initiales(user.prenom, user.nom);
  const roleLabel = { patient: 'Patient', medecin: 'Médecin', admin: 'Administrateur' }[role] || 'Utilisateur';
  const roleBadge = { patient: 'cs-badge-success', medecin: 'cs-badge-info', admin: 'cs-badge-admin' }[role] || 'cs-badge-neutral';
  const displayName = role === 'medecin' ? ('Dr. ' + (user.prenom || '') + ' ' + (user.nom || '')) : ((user.prenom || '') + ' ' + (user.nom || ''));

  let navHtml = '';
  if (role === 'patient') {
    navHtml =
      navItem('dashboard-patient.html', 'dashboard', 'Tableau de bord', 'dashboard', activePage) +
      navItem('dossier-patient.html', 'folder-heart', 'Mon dossier', 'dossier-patient', activePage) +
      navItem('ordonnances.html', 'file-text', 'Ordonnances', 'ordonnances', activePage) +
      navItem('calendar.html', 'calendar-days', 'Rendez-vous', 'calendar', activePage) +
      navItem('familles.html', 'users', 'Famille', 'familles', activePage) +
      navItem('documents.html', 'folder-open', 'Documents', 'documents', activePage) +
      navItem('structures-sante.html', 'building-2', 'Structures', 'structures-sante', activePage);
  } else if (role === 'medecin') {
    navHtml =
      navItem('dashboard-medecin.html', 'dashboard', 'Tableau de bord', 'dashboard-medecin', activePage) +
      navItem('dossier-patient.html', 'folder-heart', 'Dossiers patients', 'dossier-patient', activePage) +
      navItem('ordonnances.html', 'file-text', 'Ordonnances', 'ordonnances', activePage) +
      navItem('calendar.html', 'calendar-days', 'Agenda', 'calendar', activePage) +
      navItem('structures-sante.html', 'building-2', 'Structures', 'structures-sante', activePage) +
      navItem('documents.html', 'folder-open', 'Documents', 'documents', activePage);
  } else if (role === 'admin') {
    navHtml =
      navItem('dashboard-admin.html', 'dashboard', 'Tableau de bord', 'dashboard-admin', activePage) +
      navItem('securite.html', 'shield-alert', 'Sécurité', 'securite', activePage) +
      navItem('structures-sante.html', 'building-2', 'Structures', 'structures-sante', activePage) +
      navItem('partenaires.html', 'handshake', 'Partenaires', 'partenaires', activePage) +
      navItem('faq.html', 'help-circle', 'FAQ', 'faq', activePage);
  }

  return '<aside class="cs-sidebar" id="cs-sidebar">' +
    '<div class="cs-sidebar-header">' +
      '<a href="../index.html" class="flex items-center gap-2 mb-4">' + logoSVG(32) +
        '<span class="font-serif font-bold text-primary-800">CareSync</span></a>' +
      '<div class="flex items-center gap-3">' +
        '<div class="cs-avatar cs-avatar-md ' + avatarColor(user.id || '') + '">' + echapperHTML(userInitiales) + '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="text-sm font-semibold text-neutral-800 truncate">' + echapperHTML(displayName) + '</div>' +
          '<div class="flex items-center gap-1 mt-0.5">' +
            '<span class="cs-badge ' + roleBadge + '" style="padding: 1px 6px; font-size: 10px;">' + roleLabel + '</span>' +
          '</div>' +
          '<div class="text-[10px] text-neutral-500 font-mono mt-1 truncate">' + echapperHTML(user.id || '') + '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<nav class="cs-sidebar-nav">' + navHtml +
      '<div class="cs-sidebar-divider"></div>' +
      navItem('parametres.html', 'settings', 'Paramètres', 'parametres', activePage) +
      navItem('securite.html', 'shield', 'Sécurité', 'securite', activePage) +
    '</nav>' +
    '<div class="cs-sidebar-footer">' +
      '<button onclick="logout()" class="cs-nav-link text-danger-700 hover:bg-danger-50">' +
        icon('log-out', 18) + '<span>Déconnexion</span></button>' +
      '<div class="text-[10px] text-neutral-400 font-mono text-center mt-3">v2.0.0 — 2026</div>' +
    '</div>' +
  '</aside>';
}

function navItem(href, icone, label, key, activePage) {
  const isActive = key === activePage ? ' active' : '';
  return '<a href="' + href + '" class="cs-nav-link' + isActive + '">' +
    icon(icone, 18) + '<span>' + label + '</span></a>';
}

// ===== Topbar =====
function renderTopbar(title, subtitle) {
  const user = Storage.get('user') || {};
  const unread = Storage.getUnreadCount(user.id);
  const badge = unread > 0 ? '<span class="cs-notif-badge">' + unread + '</span>' : '';

  return '<header class="cs-topbar" id="cs-topbar">' +
    '<div class="cs-topbar-left">' +
      '<button id="cs-mobile-toggle" class="cs-btn cs-btn-icon md:hidden" aria-label="Menu">' + icon('menu', 20) + '</button>' +
      '<div><h1 class="text-lg font-bold text-neutral-800 leading-none">' + echapperHTML(title || '') + '</h1>' +
        (subtitle ? '<p class="text-xs text-neutral-500 mt-1">' + echapperHTML(subtitle) + '</p>' : '') + '</div>' +
    '</div>' +
    '<div class="cs-topbar-right">' +
      '<div class="hidden md:flex items-center relative">' +
        '<input type="search" placeholder="Rechercher..." class="cs-input pl-9 w-64" id="cs-search-input" aria-label="Rechercher">' +
        '<span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">' + icon('search', 16) + '</span>' +
      '</div>' +
      '<button id="cs-notif-btn" class="cs-btn cs-btn-icon relative" aria-label="Notifications">' +
        icon('bell', 20) + badge +
      '</button>' +
      '<button id="cs-avatar-btn" class="cs-avatar cs-avatar-sm ' + avatarColor(user.id || '') + '">' +
        echapperHTML(initiales(user.prenom, user.nom)) + '</button>' +
    '</div>' +
  '</header>';
}

// ===== Simulation banner + bubble =====
function renderSimElements() {
  if (Storage.get('sim_active') !== 'true') return '';
  const mode = Storage.get('sim_mode') || 'patient';
  const modeLabels = { patient: 'Patient', medecin: 'Médecin', admin: 'Administrateur', aleatoire: 'Aléatoire' };
  const modeLabel = modeLabels[mode] || mode;
  return '<div class="cs-sim-banner" role="status" aria-live="polite">' +
    '<div class="flex items-center gap-3">' + icon('sparkles', 18) +
      '<div><strong>Mode simulation actif</strong> — Rôle : ' + modeLabel + '. Toutes les données sont fictives.</div>' +
    '</div>' +
    '<button onclick="Simulation.reinitialiser()" class="cs-btn cs-btn-sm bg-white/20 hover:bg-white/30 text-white">' +
      icon('refresh-cw', 14) + ' Réinitialiser</button>' +
    '</div>';
}

// ===== Notifications dropdown =====
function renderNotificationsDropdown() {
  const user = Storage.get('user');
  if (!user) return '';
  const notifs = Storage.getNotifications(user.id).slice(0, 5);
  let html = '<div id="cs-notif-dropdown" class="cs-dropdown hidden">' +
    '<div class="cs-dropdown-header">' +
      '<h3 class="font-semibold text-sm">Notifications</h3>' +
      '<button onclick="markAllNotifsRead()" class="text-xs text-primary-700 hover:underline">Tout marquer lu</button>' +
    '</div>';
  if (notifs.length === 0) {
    html += '<div class="p-8 text-center text-sm text-neutral-400">' +
      icon('bell', 32) + '<p class="mt-2">Aucune notification</p></div>';
  } else {
    html += '<div class="cs-dropdown-list">';
    notifs.forEach(function (n) {
      const dotClass = { success: 'cs-dot-success', warning: 'cs-dot-warning', danger: 'cs-dot-danger', info: 'cs-dot-info' }[n.type] || 'cs-dot-info';
      html += '<div class="cs-notif-item' + (n.lue ? '' : ' unread') + '">' +
        '<div class="cs-notif-dot ' + dotClass + '"></div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="text-sm font-medium text-neutral-800 truncate">' + echapperHTML(n.titre) + '</div>' +
          '<div class="text-xs text-neutral-500 line-clamp-2">' + echapperHTML(n.message) + '</div>' +
          '<div class="text-[10px] text-neutral-400 mt-1">' + formatRelative(n.date) + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function markAllNotifsRead() {
  const user = Storage.get('user');
  if (user) {
    Storage.markAllNotificationsRead(user.id);
    showToast('Notifications', 'Toutes les notifications ont été marquées comme lues', 'success');
    // Re-render
    const dropdown = document.getElementById('cs-notif-dropdown');
    if (dropdown) dropdown.outerHTML = renderNotificationsDropdown();
    // Update badge
    const badge = document.querySelector('#cs-notif-btn .cs-notif-badge');
    if (badge) badge.remove();
  }
}

// ===== Initialisation app =====
function initApp() {
  // Mobile menu toggle
  const mobileToggle = document.getElementById('cs-mobile-menu');
  const mobileNav = document.getElementById('cs-mobile-nav');
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('hidden');
    });
  }

  // Topbar scroll effect
  const topbar = document.getElementById('cs-topbar');
  if (topbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) topbar.classList.add('scrolled');
      else topbar.classList.remove('scrolled');
    });
  }

  // Sidebar mobile toggle
  const sidebarToggle = document.getElementById('cs-mobile-toggle');
  const sidebar = document.getElementById('cs-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
    // Fermer si on clique en dehors
    document.addEventListener('click', function (e) {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Simulation trigger
  const simTrigger = document.getElementById('cs-sim-trigger-header');
  if (simTrigger) {
    simTrigger.addEventListener('click', function () {
      if (typeof Simulation !== 'undefined') {
        Simulation.ouvrirModaleChoix();
      }
    });
  }

  // Avatar click → parametres
  const avatar = document.getElementById('cs-avatar-btn');
  if (avatar) {
    avatar.addEventListener('click', function () {
      window.location.href = 'parametres.html';
    });
  }

  // Notifications dropdown
  const notifBtn = document.getElementById('cs-notif-btn');
  if (notifBtn) {
    // Injecter le dropdown si pas présent
    if (!document.getElementById('cs-notif-dropdown')) {
      const div = document.createElement('div');
      div.innerHTML = renderNotificationsDropdown();
      notifBtn.parentNode.appendChild(div.firstChild);
    }
    notifBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const dropdown = document.getElementById('cs-notif-dropdown');
      if (dropdown) dropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', function (e) {
      const dropdown = document.getElementById('cs-notif-dropdown');
      if (dropdown && !dropdown.classList.contains('hidden') &&
          !dropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
