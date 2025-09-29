/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import MapView, { PROVIDER_GOOGLE, Marker, Polygon } from 'react-native-maps';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Image,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import gasStation from './assets/images/gas.png';
import { useMemo, useState } from 'react';

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
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Generate a dynamic list of random markers around Berlin (>= 1000)
  const markers = useMemo(() => {
    const count = 5000;
    const maxLatOffset = 0.12; // ~13km
    const maxLngOffset = 0.20; // ~13km at Berlin latitude
    const data = [] as { id: number; latitude: number; longitude: number }[];
    for (let i = 0; i < count; i++) {
      // Uniform-ish spread within a rectangle around Berlin
      const lat = BERLIN.latitude + (Math.random() * 2 - 1) * maxLatOffset;
      const lng = BERLIN.longitude + (Math.random() * 2 - 1) * maxLngOffset;
      data.push({ id: i, latitude: lat, longitude: lng });
    }
    return data;
  }, []);

  // Selected marker and its polygon (a small circle approximation)
  const selectedMarker = useMemo(
    () => markers.find(m => m.id === selectedId) ?? null,
    [markers, selectedId],
  );

  const selectedCircleCoords = useMemo(() => {
    if (!selectedMarker) return null;
    const radiusMeters = 50; // small circle under the pin
    const points = 36;
    const lat = selectedMarker.latitude;
    const lng = selectedMarker.longitude;
    const mPerDegLat = 111320; // approx
    const mPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);
    const coords = [] as { latitude: number; longitude: number }[];
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const dLat = (Math.cos(angle) * radiusMeters) / mPerDegLat;
      const dLng = (Math.sin(angle) * radiusMeters) / mPerDegLng;
      coords.push({ latitude: lat + dLat, longitude: lng + dLng });
    }
    // Close the polygon
    coords.push(coords[0]);
    return coords;
  }, [selectedMarker]);

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
          {markers.map(m => {
            const isSelected = selectedId === m.id;
            const size = isSelected ? 60 : 36;
            return (
              <Marker
                key={m.id}
                stopPropagation
                coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                // Re-render image when selected to reflect size change
                tracksViewChanges={isSelected}
                onPress={() => setSelectedId(m.id)}
                zIndex={isSelected ? 1 : 0}
              >
                <Image
                  style={{ width: size, height: size }}
                  source={gasStation}
                  resizeMode="contain"
                />
              </Marker>
            );
          })}
        </MapView>
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
});

export default App;
