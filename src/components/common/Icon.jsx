import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  Line,
  Polyline,
  Polygon,
  G,
  Ellipse,
} from 'react-native-svg';

/**
 * Icon — minimal stroke-based icons
 * Props:
 *   name   — icon name string
 *   size   — number (default 20)
 *   color  — stroke color (default #fff)
 *   strokeWidth — line thickness (default 1.8)
 */
export default function Icon({
  name,
  size = 20,
  color = '#fff',
  strokeWidth = 1.8,
}) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    // ── Navigation ───────────────────────────────────────────
    case 'home':
      return (
        <Svg {...props}>
          <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <Polyline points="9,22 9,12 15,12 15,22" />
        </Svg>
      );

    case 'copy-trade':
      return (
        <Svg {...props}>
          <Polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </Svg>
      );

    case 'orders':
      return (
        <Svg {...props}>
          <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <Polyline points="14,2 14,8 20,8" />
          <Line x1="16" y1="13" x2="8" y2="13" />
          <Line x1="16" y1="17" x2="8" y2="17" />
          <Polyline points="10,9 9,9 8,9" />
        </Svg>
      );

    case 'wallet':
      return (
        <Svg {...props}>
          <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <Line x1="1" y1="10" x2="23" y2="10" />
        </Svg>
      );

    case 'profile':
      return (
        <Svg {...props}>
          <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );

    // ── Account actions ───────────────────────────────────────
    case 'refresh':
      return (
        <Svg {...props}>
          <Polyline points="23,4 23,10 17,10" />
          <Polyline points="1,20 1,14 7,14" />
          <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </Svg>
      );

    case 'eye':
      return (
        <Svg {...props}>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );

    case 'eye-off':
      return (
        <Svg {...props}>
          <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
          <Line x1="1" y1="1" x2="23" y2="23" />
        </Svg>
      );

    case 'more-vertical':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="5" r="1" fill={color} />
          <Circle cx="12" cy="12" r="1" fill={color} />
          <Circle cx="12" cy="19" r="1" fill={color} />
        </Svg>
      );

    case 'key':
      return (
        <Svg {...props}>
          <Path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </Svg>
      );

    case 'copy':
      return (
        <Svg {...props}>
          <Rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <Path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </Svg>
      );

    case 'link':
      return (
        <Svg {...props}>
          <Path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <Path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </Svg>
      );

    // ── Menu options ──────────────────────────────────────────
    case 'plug':
      return (
        <Svg {...props}>
          <Path d="M12 22v-5" />
          <Path d="M9 8V2" />
          <Path d="M15 8V2" />
          <Path d="M18 8v5a4 4 0 01-4 4h-4a4 4 0 01-4-4V8z" />
        </Svg>
      );

    case 'calendar':
      return (
        <Svg {...props}>
          <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Line x1="16" y1="2" x2="16" y2="6" />
          <Line x1="8" y1="2" x2="8" y2="6" />
          <Line x1="3" y1="10" x2="21" y2="10" />
        </Svg>
      );

    case 'trash':
      return (
        <Svg {...props}>
          <Polyline points="3,6 5,6 21,6" />
          <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <Path d="M10 11v6" />
          <Path d="M14 11v6" />
          <Path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </Svg>
      );

    case 'check':
      return (
        <Svg {...props}>
          <Polyline points="20,6 9,17 4,12" />
        </Svg>
      );

    case 'x':
      return (
        <Svg {...props}>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );

    case 'plus':
      return (
        <Svg {...props}>
          <Line x1="12" y1="5" x2="12" y2="19" />
          <Line x1="5" y1="12" x2="19" y2="12" />
        </Svg>
      );

    case 'search':
      return (
        <Svg {...props}>
          <Circle cx="11" cy="11" r="8" />
          <Line x1="21" y1="21" x2="16.65" y2="16.65" />
        </Svg>
      );

    case 'chevron-down':
      return (
        <Svg {...props}>
          <Polyline points="6,9 12,15 18,9" />
        </Svg>
      );
    case 'chevron-up':
      return (
        <Svg {...props}>
          <Polyline points="15,18 9,12 15,6" />
        </Svg>
      );

    case 'chevron-right':
      return (
        <Svg {...props}>
          <Polyline points="9,18 15,12 9,6" />
        </Svg>
      );

    case 'chevron-left':
      return (
        <Svg {...props}>
          <Polyline points="15,18 9,12 15,6" />
        </Svg>
      );

    case 'arrow-left':
      return (
        <Svg {...props}>
          <Line x1="19" y1="12" x2="5" y2="12" />
          <Polyline points="12,19 5,12 12,5" />
        </Svg>
      );

    case 'logout':
      return (
        <Svg {...props}>
          <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <Polyline points="16,17 21,12 16,7" />
          <Line x1="21" y1="12" x2="9" y2="12" />
        </Svg>
      );

    case 'info':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="10" />
          <Line x1="12" y1="8" x2="12" y2="12" />
          <Line x1="12" y1="16" x2="12.01" y2="16" />
        </Svg>
      );

    case 'alert':
      return (
        <Svg {...props}>
          <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <Line x1="12" y1="9" x2="12" y2="13" />
          <Line x1="12" y1="17" x2="12.01" y2="17" />
        </Svg>
      );

    case 'settings':
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </Svg>
      );

    case 'send':
      return (
        <Svg {...props}>
          <Line x1="22" y1="2" x2="11" y2="13" />
          <Polygon points="22,2 15,22 11,13 2,9" />
        </Svg>
      );

    case 'download':
      return (
        <Svg {...props}>
          <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <Polyline points="7,10 12,15 17,10" />
          <Line x1="12" y1="15" x2="12" y2="3" />
        </Svg>
      );

    case 'filter':
      return (
        <Svg {...props}>
          <Polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
        </Svg>
      );

    case 'sort':
      return (
        <Svg {...props}>
          <Line x1="8" y1="6" x2="21" y2="6" />
          <Line x1="8" y1="12" x2="21" y2="12" />
          <Line x1="8" y1="18" x2="21" y2="18" />
          <Line x1="3" y1="6" x2="3.01" y2="6" />
          <Line x1="3" y1="12" x2="3.01" y2="12" />
          <Line x1="3" y1="18" x2="3.01" y2="18" />
        </Svg>
      );

    case 'bell':
      return (
        <Svg {...props}>
          <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path d="M13.73 21a2 2 0 01-3.46 0" />
        </Svg>
      );

    case 'grid':
      return (
        <Svg {...props}>
          <Rect x="3" y="3" width="7" height="7" />
          <Rect x="14" y="3" width="7" height="7" />
          <Rect x="14" y="14" width="7" height="7" />
          <Rect x="3" y="14" width="7" height="7" />
        </Svg>
      );

    case 'list':
      return (
        <Svg {...props}>
          <Line x1="8" y1="6" x2="21" y2="6" />
          <Line x1="8" y1="12" x2="21" y2="12" />
          <Line x1="8" y1="18" x2="21" y2="18" />
          <Line x1="3" y1="6" x2="3.01" y2="6" />
          <Line x1="3" y1="12" x2="3.01" y2="12" />
          <Line x1="3" y1="18" x2="3.01" y2="18" />
        </Svg>
      );

    case 'users':
      return (
        <Svg {...props}>
          <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M23 21v-2a4 4 0 00-3-3.87" />
          <Path d="M16 3.13a4 4 0 010 7.75" />
        </Svg>
      );

    case 'trending-up':
      return (
        <Svg {...props}>
          <Polyline points="23,6 13.5,15.5 8.5,10.5 1,18" />
          <Polyline points="17,6 23,6 23,12" />
        </Svg>
      );

    case 'dollar':
      return (
        <Svg {...props}>
          <Line x1="12" y1="1" x2="12" y2="23" />
          <Path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </Svg>
      );
    case 'positions':
      return (
        <Svg {...props}>
          <Rect x="3" y="7" width="18" height="13" rx="2" />
          <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </Svg>
      );
    case 'pending-orders':
      return (
        <Svg {...props}>
          <Rect x="4" y="3" width="16" height="18" rx="2" />
          <Polyline points="9,11 12,14 16,10" />
          <Path d="M9 3h6v3H9z" />
        </Svg>
      );
    case 'lan-disconnect':
      return (
        <Svg {...props}>
          {/* Plug body */}
          <Path d="M8 3v6M16 3v6" />
          <Path d="M6 9h12v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9z" />
          <Path d="M12 16v5" />
          <Line x1="3" y1="3" x2="21" y2="21" />
        </Svg>
      );
    case 'edit':
      return (
        <Svg {...props}>
          <Path d="M12 20h9" />
          <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </Svg>
      );
    case 'cancel-all':
      return (
        <Svg {...props}>
          <Line x1="18" y1="6" x2="6" y2="18" />
          <Line x1="6" y1="6" x2="18" y2="18" />
        </Svg>
      );
    case 'square-off':
      return (
        <Svg {...props}>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Polyline points="16,17 21,12 16,7" />
          <Line x1="21" y1="12" x2="9" y2="12" />
        </Svg>
      );
    default:
      // Fallback: simple circle
      return (
        <Svg {...props}>
          <Circle cx="12" cy="12" r="9" />
        </Svg>
      );
  }
}
