import React from 'react';
import { Image, Platform } from 'react-native';
import { Marker } from 'react-native-maps';

type Props = {
  id: string;
  coordinate: { latitude: number; longitude: number };
  zIndex?: number;
  useNativeImage?: boolean;
  nativeImage?: any;
  childImage?: any;
  size: { width: number; height: number };
  onPress?: any;
};

export default class IconMarker extends React.PureComponent<Props> {
  markerRef: any | null = null;

  render() {
    const { id, coordinate, zIndex = 0, useNativeImage, nativeImage, childImage, size, onPress } = this.props;

    if (useNativeImage && nativeImage) {
      return (
        <Marker
          key={id}
          identifier={id}
          ref={(ref) => {
            // @ts-ignore
            this.markerRef = ref;
          }}
          stopPropagation
          onPress={onPress}
          coordinate={coordinate}
          zIndex={zIndex}
          // Static native image resource
          image={nativeImage}
        />
      );
    }

    return (
      <Marker
        key={id}
        identifier={id}
        ref={(ref) => {
          // @ts-ignore
          this.markerRef = ref;
        }}
        stopPropagation
        tracksViewChanges={Platform.OS === 'ios'}
        onPress={onPress}
        coordinate={coordinate}
        zIndex={zIndex}
      >
        {childImage ? (
          <Image style={{ width: size.width, height: size.height }} source={childImage} resizeMode="contain" />
        ) : null}
      </Marker>
    );
  }
}
