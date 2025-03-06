import * as React from 'react';
import * as Svg from 'react-native-svg';

export const HomeIcon = ({ size = 24, color = '#000', focused }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M9.15722 20.7714V17.7047C9.15722 16.9246 9.79312 16.2908 10.581 16.2908H13.4671C14.2587 16.2908 14.9005 16.9246 14.9005 17.7047V17.7047V20.7809C14.9003 21.4432 15.4343 21.9845 16.103 22H18.0271C19.9451 22 21.5 20.4607 21.5 18.5618V18.5618V9.83784C21.4898 9.09083 21.1355 8.38935 20.538 7.93303L13.9577 2.6853C12.8049 1.77157 11.1662 1.77157 10.0134 2.6853L3.46203 7.94256C2.86226 8.39702 2.50739 9.09967 2.5 9.84736V18.5618C2.5 20.4607 4.05488 22 5.97291 22H7.89696C8.58235 22 9.13797 21.4499 9.13797 20.7714V20.7714"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
    />
  </Svg.Svg>
);

export const SearchIcon = ({ size = 24, color = '#000', focused }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Circle
      cx={11}
      cy={11}
      r={7}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.1 : 0}
    />
    <Svg.Path
      d="M20 20L16.65 16.65"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg.Svg>
);

export const MarketIcon = ({ size = 24, color = '#000', focused }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M3.5 4.5H4.89636C5.95096 4.5 6.86829 5.25991 7.06406 6.29359L8.33333 12.5M8.33333 12.5L9.06406 15.7936C9.25983 16.8273 10.1772 17.5872 11.2318 17.5872H17.7682C18.8228 17.5872 19.7402 16.8273 19.9359 15.7936L21 9.79359C21.1958 8.75991 20.4777 7.76716 19.4323 7.57139C19.3049 7.54499 19.1752 7.53167 19.0452 7.53167H8.33333Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      fill={focused ? color : 'none'}
      fillOpacity={focused ? 0.1 : 0}
    />
    <Svg.Circle
      cx={9.5}
      cy={20.5}
      r={1}
      fill={color}
    />
    <Svg.Circle
      cx={16.5}
      cy={20.5}
      r={1}
      fill={color}
    />
  </Svg.Svg>
);

export const ProfileIcon = ({ size = 24, color = '#000', focused }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45006 10.79 7.56006 8.84 7.56006 6.44C7.56006 3.99 9.54006 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
    />
    <Svg.Path
      d="M7.15997 14.56C4.73997 16.18 4.73997 18.82 7.15997 20.43C9.90997 22.27 14.42 22.27 17.17 20.43C19.59 18.81 19.59 16.17 17.17 14.56C14.43 12.73 9.91997 12.73 7.15997 14.56Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? color : 'none'}
    />
  </Svg.Svg>
);

export const CameraIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M6.23 4.24C6.23 3.28 7.08 2.5 8.12 2.5H15.88C16.92 2.5 17.77 3.28 17.77 4.24V4.24C17.77 4.56 18.06 4.82 18.4 4.82H19.5C20.88 4.82 22 5.86 22 7.15V16.86C22 18.15 20.88 19.19 19.5 19.19H4.5C3.12 19.19 2 18.15 2 16.86V7.15C2 5.86 3.12 4.82 4.5 4.82H5.6C5.94 4.82 6.23 4.56 6.23 4.24Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <Svg.Circle
      cx="12"
      cy="11.5"
      r="3.5"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
  </Svg.Svg>
);

export const GalleryIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Svg.Path
      d="M13 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg.Svg>
);

export const ShareIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M7.21701 10.907C6.97487 10.4713 6.59491 10.1284 6.13678 9.93198C5.67864 9.73558 5.16826 9.69689 4.68576 9.82201C4.20325 9.94712 3.77594 10.2298 3.46789 10.6274C3.15984 11.0249 2.98901 11.5141 2.98001 12.017C2.97101 12.5199 3.12425 13.0149 3.41701 13.422L6.92901 18.427C7.05574 18.6089 7.22138 18.7609 7.41501 18.873C8.14301 19.287 9.03601 19.287 9.76401 18.873C9.95764 18.7609 10.1233 18.6089 10.25 18.427L20.678 3.42201"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg.Svg>
);

export const CloseIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg.Svg>
);

export const PlusIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M12 5V19M5 12H19"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg.Svg>
);

export const FlashIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M6.09 13.28H9.66V20.48C9.66 21.54 10.96 22.04 11.63 21.24L18.57 12.94C19.19 12.21 18.66 11.14 17.73 11.14H14.16V3.94C14.16 2.88 12.86 2.38 12.19 3.18L5.25 11.48C4.63 12.21 5.16 13.28 6.09 13.28Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg.Svg>
);

export const FlipCameraIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M9.5 10H14.5M9.5 14H14.5M19 12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12C5 8.13401 8.13401 5 12 5C15.866 5 19 8.13401 19 12ZM12 8L14 10L12 12M12 16L10 14L12 12"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg.Svg>
);

export const CaptureIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Circle
      cx="12"
      cy="12"
      r="3.5"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
    <Svg.Circle
      cx="12"
      cy="12"
      r="8"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
    />
  </Svg.Svg>
);

export const CheckIcon = ({ size = 24, color = '#000' }) => (
  <Svg.Svg width={size} height={size} viewBox="0 0 24 24">
    <Svg.Path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg.Svg>
);
