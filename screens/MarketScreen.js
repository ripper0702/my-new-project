import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = (SCREEN_WIDTH - 48) / 2;

const marketItems = [
  {
    id: 1,
    title: 'Vintage Dress',
    price: '$299',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&ixid=MnwxfDB8MXxyYW5kb218MHx8ZHJlc3N8fHx8fHwxNzA4MzM0NTQ3&ixlib=rb-4.0.3&q=80&w=500',
    seller: 'Luxury Boutique',
  },
  {
    id: 2,
    title: 'Designer Bag',
    price: '$1,299',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&ixid=MnwxfDB8MXxyYW5kb218MHx8YmFnfHx8fHx8MTcwODMzNDU0Nw&ixlib=rb-4.0.3&q=80&w=500',
    seller: 'Fashion House',
  },
  {
    id: 3,
    title: 'Baby Carrier',
    price: '$189',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&ixid=MnwxfDB8MXxyYW5kb218MHx8YmFieXxjYXJyaWVyfHx8fHx8MTcwODMzNDU0Nw&ixlib=rb-4.0.3&q=80&w=500',
    seller: 'Modern Mom',
  },
  {
    id: 4,
    title: 'Organic Toys',
    price: '$49',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=500&ixid=MnwxfDB8MXxyYW5kb218MHx8YmFieSx0b3l8fHx8fHwxNzA4MzM0NTQ3&ixlib=rb-4.0.3&q=80&w=500',
    seller: 'Eco Baby',
  }
];

const MarketScreen = () => {
  const { colors } = useTheme();

  const renderMarketItem = (item) => (
    <TouchableOpacity key={item.id} style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.itemImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <Text style={[styles.price, { color: colors.text }]}>{item.price}</Text>
        </LinearGradient>
      </View>
      <BlurView intensity={80} tint="dark" style={[styles.itemInfo, { backgroundColor: colors.surface }]}>
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.sellerName, { color: colors.text }]} numberOfLines={1}>
          {item.seller}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BlurView intensity={60} tint="light" style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{'Marketplace'}</Text>
      </BlurView>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {marketItems.map(renderMarketItem)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 90,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: ITEM_WIDTH * 1.2,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 12,
  },
});

export default MarketScreen;
