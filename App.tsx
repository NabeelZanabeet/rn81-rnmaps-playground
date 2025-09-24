/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  Image,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import gasStation from './assets/images/gas.png';

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
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          <Marker
            stopPropagation
            tracksViewChanges={false}
            coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
            // image={{uri: 'map_pin_gasstation'}}
          >
            {/*If u comment out below child Image, then default red marker is displayed */}
            <Image
              style={{
                width: 16,
                height: 16,
              }}
              source={gasStation}
              resizeMode="contain"
            />
          </Marker>
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
