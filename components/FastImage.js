import { Platform, Image } from 'react-native';
import FastImage from 'react-native-fast-image';

// Web fallback component
const WebImage = ({ source, style, ...props }) => {
  const imageSource = typeof source === 'string' ? { uri: source } : source;
  return (
    <Image
      source={imageSource}
      style={style}
      {...props}
    />
  );
};

// Use FastImage on native platforms, fallback to regular Image on web
export default Platform.select({
  web: WebImage,
  default: FastImage,
}); 