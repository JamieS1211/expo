import EvilIcons from '@expo/vector-icons/EvilIcons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  createAppContainer,
  createMaterialTopTabNavigator,
  createStackNavigator,
  SafeAreaView,
} from 'react-navigation';

import SearchBar from '../components/SearchBar';
import Genres from '../data/Genres.json';
import Moods from '../data/Moods.json';
import Popular from '../data/Popular-itunes.json';

// import Popular from './data/Popular.json';
const { height } = Dimensions.get('window');

export default class MusicScreen extends React.Component {
  render() {
    return (
      <BlurView
        tint={'dark'}
        intensity={100}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <SearchBar
            round
            containerStyle={{ backgroundColor: 'transparent', borderBottomWidth: 0 }}
            inputStyle={{ color: 'white', outlineWidth: 0, outlineStyle: 'none' }}
            placeholder="Search music"
          />
          <MusicNav />
        </SafeAreaView>
      </BlurView>
    );
  }
}

const listItemImageSize = 56;
const ListScreenItem = ({ renderImage, title, subtitle, renderAction, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      {renderImage({
        style: {
          shadowOpacity: 0.4,
          shadowRadius: 6,
          width: listItemImageSize,
          height: listItemImageSize,
          borderRadius: 5,
          backgroundColor: 'gray',
        },
      })}
      <View style={{ justifyContent: 'space-between', marginLeft: 12 }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>{title}</Text>
        {subtitle && (
          <Text style={{ marginTop: 4, color: 'white', opacity: 0.7, fontSize: 14 }}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    {renderAction()}
  </TouchableOpacity>
);

const SongListScreenItem = ({ title, artist, image, onPress }) => (
  <ListScreenItem
    onPress={onPress}
    renderImage={({ style }) => <Image style={style} resizeMode="cover" source={image} />}
    title={title}
    subtitle={artist}
    renderAction={() => <PlayButtonIcon />}
  />
);
const USE_REMOTE_IMAGES = false;

const GenreListScreenItem = ({ genre, image, onPress }) => (
  <ListScreenItem
    onPress={onPress}
    renderImage={({ style }) => (
      <View style={StyleSheet.flatten([style, { padding: 12 }])}>
        <Image style={{ flex: 1, tintColor: 'white' }} resizeMode={'contain'} source={image} />
      </View>
    )}
    title={genre}
    renderAction={() => <ChevronRight />}
  />
);

const ListScreen = ({ onPress, ...props }) => (
  <FlatList
    keyExtractor={(o, i) => i + '--'}
    style={{ flex: 1 }}
    contentContainerStyle={{ paddingBottom: 60 }}
    {...props}
    renderItem={({ item }) => {
      if (item.genre) {
        return (
          <GenreListScreenItem
            onPress={() => {
              props.navigation.push('MusicScreen', { item });
            }}
            {...item}
          />
        );
      }
      return <SongListScreenItem onPress={onPress} {...item} />;
    }}
  />
);

const createGenreScreen = data => props => <ListScreen {...props} data={data} />;

const transformCategorySet = categories => {
  return Object.keys(categories).map(itemKey => {
    return {
      genre: itemKey,
      image: {
        uri: 'https://png.pngtree.com/svg/20170526/mic_icon_525549.png',
      },
      items: transformSongList(categories[itemKey].results),
    };
  });
};

const moods = transformCategorySet(Moods);
const genres = transformCategorySet(Genres);

function transformSongList(list) {
  return list
    .filter(({ trackName }) => trackName)
    .map(song => {
      return {
        title: song.trackName,
        artist: song.artistName,
        isExplict: song.trackExplicitness === 'explicit',
        duration: song.trackTimeMillis,
        audio: song.previewUrl,
        image: {
          uri: USE_REMOTE_IMAGES
            ? song.artworkUrl60
            : 'https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2018%2F09%2Flil-yachty-mtv-how-high-2-movie-0.jpg?q=75&w=800&cbr=1&fit=max',
        },
      };
    });
}
const Songs = transformSongList(Popular);

const GenreScreen = createGenreScreen(genres);
const MoodScreen = createGenreScreen(moods);

const PopularScreen = props => <ListScreen {...props} data={Songs.splice(0, 50)} />;

const MusicTabNavigator = createMaterialTopTabNavigator(
  {
    Popular: PopularScreen,
    Moods: MoodScreen,
    Genres: GenreScreen,
  },
  {
    style: {
      maxHeight: height - (48 + 8), // Tab Bar Height + padding
    },
    tabBarOptions: {
      swipeEnabled: true,
      activeTintColor: 'white',
      inactiveBackgroundColor: 'transparent',
      safeAreaInset: 'never',
      upperCaseLabel: false,
      scrollEnabled: false,
      indicatorStyle: {
        backgroundColor: 'white',
        height: 3,
      },
      style: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowOpacity: 0,
        overflow: 'hidden',
      },
      labelStyle: {
        fontWeight: 'bold',
      },
    },
  }
);

MusicTabNavigator.navigationOptions = { header: null };
class SecondaryMusicScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const item = navigation.getParam('item') || {};
    return {
      title: item.genre || item.name || 'MUSIC',
    };
  };
  render() {
    const { props } = this;
    const item = props.navigation.getParam('item') || {};

    return <ListScreen {...props} data={item.items.splice(0, 5)} />;
  }
}

const PlayButtonIcon = props => (
  <EvilIcons name="play" color={'rgba(255,255,255,0.7)'} size={36} {...props} />
);
const ChevronRight = props => (
  <EvilIcons name="chevron-right" color={'rgba(255,255,255,0.7)'} size={36} {...props} />
);

const musicBackgroundColor = 'rgba(0,0,0,0.0)';
const MusicNav = createAppContainer(
  createStackNavigator(
    {
      GenreScreen: MusicTabNavigator,
      MusicScreen: SecondaryMusicScreen,
    },
    {
      transparentCard: true,
      mode: 'card',
      headerMode: 'float',
      headerLayoutPreset: 'center',

      cardStyle: {
        backgroundColor: musicBackgroundColor,
      },
      headerTransitionPreset: 'uikit',
      defaultNavigationOptions: {
        headerStyle: {
          backgroundColor: musicBackgroundColor,
          borderBottomColor: 'white',
          borderBottomWidth: 1,
        },
        headerTintColor: 'white',
        headerBackImage: () => <EvilIcons name="chevron-left" color={'white'} size={56} />,
      },
    }
  )
);
