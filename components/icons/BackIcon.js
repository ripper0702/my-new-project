import React from 'react';
import Svg, { Path } from 'react-native-svg';

const BackIcon = ({ color = '#FFFFFF', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"
      fill={color}
    />
  </Svg>
);

export default BackIcon;
