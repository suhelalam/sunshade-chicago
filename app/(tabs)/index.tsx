import { StyleSheet, Text, View } from 'react-native';

export default function HomeFallbackScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chicago Events Map</Text>
      <Text style={styles.body}>Loading platform-specific map experience...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#04121F',
    paddingHorizontal: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    marginTop: 8,
    color: '#D5E8FF',
    fontSize: 15,
  },
});
