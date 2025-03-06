import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const MoreIcon = ({ color = '#FFF', size = 20 }) => {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="5" r="2" fill={color} />
        <Circle cx="12" cy="12" r="2" fill={color} />
        <Circle cx="12" cy="19" r="2" fill={color} />
      </Svg>
    </View>
  );
};

export default MoreIcon;
