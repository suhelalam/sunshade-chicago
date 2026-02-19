import mapboxgl from 'mapbox-gl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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

export default function HomeWebScreen() {
  const [selectedEventId, setSelectedEventId] = useState<string>(EVENTS[0]?.id ?? '');
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const selectedEvent = useMemo(
    () => EVENTS.find((event) => event.id === selectedEventId) ?? null,
    [selectedEventId]
  );

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) {
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: CHICAGO_CENTER,
      zoom: 11.6,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      EVENTS.forEach((event) => {
        const pulse = document.createElement('div');
        pulse.className = 'event-pulse';
        const core = document.createElement('div');
        core.className = 'event-core';

        const wrapper = document.createElement('button');
        wrapper.className = 'event-pin';
        wrapper.type = 'button';
        wrapper.onclick = () => setSelectedEventId(event.id);
        wrapper.appendChild(pulse);
        wrapper.appendChild(core);

        new mapboxgl.Marker({ element: wrapper, anchor: 'center' })
          .setLngLat(event.coordinate)
          .addTo(map);
      });

      map.on('click', () => setSelectedEventId(''));
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
      <style>
        {`.mapboxgl-map { width: 100%; height: 100%; }
          .event-pin { position: relative; width: 44px; height: 44px; border: 0; background: transparent; cursor: pointer; }
          .event-core { position: absolute; left: 50%; top: 50%; width: 16px; height: 16px; border-radius: 999px; transform: translate(-50%, -50%); border: 2px solid #fff; background: #005de8; }
          .event-pulse { position: absolute; left: 50%; top: 50%; width: 22px; height: 22px; border-radius: 999px; transform: translate(-50%, -50%); background: #24a0ff; animation: eventPulse 1.5s infinite; opacity: .45; }
          @keyframes eventPulse { 0% { transform: translate(-50%, -50%) scale(1); opacity: .45; } 100% { transform: translate(-50%, -50%) scale(2.35); opacity: 0; } }
        `}
      </style>

      <div ref={mapContainerRef} style={styles.mapContainer as unknown as React.CSSProperties} />

      {selectedEvent ? (
        <Pressable style={styles.floatingCard}>
          <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
          <Text style={styles.eventMeta}>
            {selectedEvent.category} • {selectedEvent.startsAt}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#04121F',
  },
  mapContainer: {
    position: 'absolute',
    inset: 0,
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
