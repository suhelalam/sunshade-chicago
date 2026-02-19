import Mapbox from '@rnmapbox/maps';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

type EventPin = {
  id: string;
  title: string;
  category: string;
  startsAt: string;
  description: string;
  coordinate: [number, number];
};

const CHICAGO_CENTER: [number, number] = [-87.6298, 41.8781];

const EVENTS: EventPin[] = [
  {
    id: 'chi-river-kayak-night',
    title: 'Moonlight Kayak Tour',
    category: 'Outdoor',
    startsAt: 'Fri 7:00 PM',
    description: 'Paddle through downtown with skyline views and live guide commentary.',
    coordinate: [-87.6369, 41.8884],
  },
  {
    id: 'west-loop-jazz',
    title: 'West Loop Jazz Session',
    category: 'Live Music',
    startsAt: 'Sat 8:30 PM',
    description: 'An intimate late-night set with rotating local artists.',
    coordinate: [-87.6475, 41.8827],
  },
  {
    id: 'lincoln-park-market',
    title: 'Lincoln Park Makers Market',
    category: 'Pop-up',
    startsAt: 'Sun 11:00 AM',
    description: 'Shop handmade goods from Chicago creators and food vendors.',
    coordinate: [-87.6354, 41.9214],
  },
  {
    id: 'museum-campus-foodfest',
    title: 'Lakeside Food Fest',
    category: 'Food',
    startsAt: 'Thu 5:30 PM',
    description: 'Tastings from local chefs with waterfront views near Museum Campus.',
    coordinate: [-87.6167, 41.8666],
  },
];

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (mapboxToken) {
  Mapbox.setAccessToken(mapboxToken);
}

function PulsingEventPin({ active, onPress }: { active: boolean; onPress: () => void }) {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 2.35,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [pulseOpacity, pulseScale]);

  return (
    <Pressable onPress={onPress} style={styles.pinHitArea}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulse,
          active && styles.pulseActive,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />
      <View style={[styles.pinCore, active && styles.pinCoreActive]} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const [selectedEventId, setSelectedEventId] = useState<string>(EVENTS[0]?.id ?? '');

  const selectedEvent = useMemo(
    () => EVENTS.find((event) => event.id === selectedEventId) ?? null,
    [selectedEventId]
  );

  if (!mapboxToken) {
    return (
      <View style={styles.missingTokenContainer}>
        <Text style={styles.missingTokenTitle}>Mapbox token missing</Text>
        <Text style={styles.missingTokenBody}>
          Set `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` in your environment to load the map.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/streets-v12"
        logoEnabled={false}
        compassEnabled
        onPress={() => setSelectedEventId('')}>
        <Mapbox.Camera centerCoordinate={CHICAGO_CENTER} zoomLevel={11.6} animationMode="flyTo" />

        {EVENTS.map((event) => {
          const isSelected = selectedEventId === event.id;

          return (
            <Mapbox.MarkerView
              key={event.id}
              coordinate={event.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              allowOverlap
              allowOverlapWithPuck
              isSelected={isSelected}>
              <PulsingEventPin active={isSelected} onPress={() => setSelectedEventId(event.id)} />
            </Mapbox.MarkerView>
          );
        })}
      </Mapbox.MapView>

      {selectedEvent ? (
        <View style={styles.floatingCard}>
          <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
          <Text style={styles.eventMeta}>
            {selectedEvent.category} • {selectedEvent.startsAt}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  floatingCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(6, 19, 31, 0.86)',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  eventTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  eventMeta: {
    marginTop: 2,
    color: '#7EC8FF',
    fontSize: 13,
    fontWeight: '600',
  },
  pinHitArea: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#24A0FF',
  },
  pulseActive: {
    backgroundColor: '#00D4FF',
  },
  pinCore: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#005DE8',
  },
  pinCoreActive: {
    backgroundColor: '#00A4FF',
    transform: [{ scale: 1.1 }],
  },
  missingTokenContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#04121F',
  },
  missingTokenTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  missingTokenBody: {
    color: '#CAE3FF',
    fontSize: 15,
    lineHeight: 22,
  },
});
