/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import MapView, { PROVIDER_GOOGLE, Polygon } from 'react-native-maps';
import { StatusBar, StyleSheet, useColorScheme, View, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import gasStation from './assets/images/gas.png';
import car from './assets/images/car.png';
import car2 from './assets/images/car2.png';
import IconMarker from './src/IconMarker';
import { useEffect, useState } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  // Berlin center
  const BERLIN = { latitude: 52.520008, longitude: 13.404954 };
  type MarkerItem = {
    id: number;
    latitude: number;
    longitude: number;
    selected: boolean;
    baseIconIndex: number; // to vary non-selected icons deterministically
    baseRenderMode: 'native' | 'child'; // mimic prod: some use native image prop
    rev: number; // force remount when incremented
  };

  // Generate a dynamic list of random markers around Berlin (>= 1000)
  const generateMarkers = () => {
    const count = 1000;
    const maxLatOffset = 0.12; // ~13km
    const maxLngOffset = 0.2; // ~13km at Berlin latitude
    const data: MarkerItem[] = [];
    for (let i = 0; i < count; i++) {
      const lat = BERLIN.latitude + (Math.random() * 2 - 1) * maxLatOffset;
      const lng = BERLIN.longitude + (Math.random() * 2 - 1) * maxLngOffset;
      data.push({
        id: i,
        latitude: lat,
        longitude: lng,
        selected: false,
        baseIconIndex: i % 3, // 0..2 for variety
        baseRenderMode: i % 2 === 0 ? 'native' : 'child',
        rev: 0,
      });
    }
    return data;
  };
  const [markers, setMarkers] = useState<MarkerItem[]>(() => generateMarkers());

  const selectedMarker = markers.find(m => m.selected) ?? null;

  function circleCoordsFor(lat: number, lng: number) {
    const radiusMeters = 50; // small circle under the pin
    const points = 36;
    const mPerDegLat = 111320; // approx
    const mPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);
    const coords: { latitude: number; longitude: number }[] = [];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dLat = (Math.cos(angle) * radiusMeters) / mPerDegLat;
      const dLng = (Math.sin(angle) * radiusMeters) / mPerDegLng;
      coords.push({ latitude: lat + dLat, longitude: lng + dLng });
    }
    coords.push(coords[0]); // close the polygon
    return coords;
  }

  const selectedCircleCoords = selectedMarker
    ? circleCoordsFor(selectedMarker.latitude, selectedMarker.longitude)
    : null;

  // Inline renderers (no memoize-one)

  const [churn, setChurn] = useState(true);
  const [delayChild, setDelayChild] = useState(false);
  // Stress toggling to reproduce: randomly select/deselect markers
  useEffect(() => {
    if (!churn) return;
    const interval = setInterval(() => {
      setMarkers(prev => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        const current = next[idx];
        // Toggle selection on a random marker; ensure only one selected at a time
        for (let i = 0; i < next.length; i++) {
          if (i === idx) next[i] = { ...current, selected: !current.selected };
          else if (next[i].selected) next[i] = { ...next[i], selected: false };
        }
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [churn]);

  const burstUpdate = () => {
    setMarkers(prev => {
      if (prev.length === 0) return prev;
      // Flip mode and rev for ~30% of markers to force heavy redraws
      const threshold = Math.floor(prev.length * 0.3);
      const indices = new Set<number>();
      while (indices.size < threshold) {
        indices.add(Math.floor(Math.random() * prev.length));
      }
      return prev.map((m, i) =>
        indices.has(i)
          ? {
              ...m,
              baseRenderMode: m.baseRenderMode === 'native' ? 'child' : 'native',
              baseIconIndex: (m.baseIconIndex + 1) % 3,
              rev: m.rev + 1,
            }
          : m,
      );
    });
  };

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: BERLIN.latitude,
            longitude: BERLIN.longitude,
            latitudeDelta: 0.25,
            longitudeDelta: 0.25,
          }}
        >
          {selectedCircleCoords && (
            <Polygon
              coordinates={selectedCircleCoords}
              fillColor="rgba(0, 122, 255, 0.20)"
              strokeColor="rgba(0, 122, 255, 0.6)"
              strokeWidth={1}
              zIndex={0}
            />
          )}
          {/* Render non-selected markers inline */}
          {markers
            .filter(m => !m.selected)
            .map(m => {
              const baseIcon = m.baseIconIndex === 0 ? gasStation : car;
              const useNative = m.baseRenderMode === 'native';
              const suppressChild = !useNative && delayChild && Math.random() < 0.15;
              return (
                <IconMarker
                  key={`${m.id}-${m.rev}`}
                  id={String(m.id)}
                  coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                  zIndex={0}
                  useNativeImage={useNative}
                  nativeImageName={useNative ? 'map_pin_gasstation' : undefined}
                  nativeImage={undefined}
                  childImage={!useNative ? baseIcon : undefined}
                  suppressChild={suppressChild}
                  size={{ width: 36, height: 36 }}
                  onPress={() => {
                    setMarkers(prev =>
                      prev.map(p => (p.id === m.id ? { ...p, selected: true } : { ...p, selected: false })),
                    );
                  }}
                />
              );
            })}

          {/* Render selected marker inline */}
          {selectedMarker ? (
            <IconMarker
              key={`selected-${selectedMarker.id}-${selectedMarker.rev}`}
              id={`selected-${selectedMarker.id}`}
              coordinate={{ latitude: selectedMarker.latitude, longitude: selectedMarker.longitude }}
              zIndex={2}
              useNativeImage={false}
              childImage={car2}
              size={{ width: 60, height: 60 }}
              onPress={() => {
                setMarkers(prev => prev.map(p => (p.id === selectedMarker.id ? { ...p, selected: false } : p)));
              }}
            />
          ) : null}
        </MapView>
        {/* Top-right controls (must be sibling, not child, of MapView on Android) */}
        <View pointerEvents="box-none" style={styles.controls}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={() => setDelayChild(v => !v)}
              style={[styles.button, { marginRight: 8 }]}
            >
              <Text style={styles.buttonText}>{delayChild ? 'Delay Off' : 'Delay On'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={burstUpdate} style={styles.button}>
              <Text style={styles.buttonText}>Burst</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  controls: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 9999,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default App;
