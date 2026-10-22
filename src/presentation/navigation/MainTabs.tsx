import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabsParams, DayStackParams, StoriesStackParams, TimeStackParams, WordsStackParams } from './types';

import DayScreen from '../screens/day/DayScreen';
import ActivityCatalogScreen from '../screens/day/ActivityCatalogScreen';
import AddActivityScreen from '../screens/day/AddActivityScreen';
import AddCatalogActivityScreen from '../screens/day/AddCatalogActivityScreen';

import StoriesLibraryScreen from '../screens/stories/StoriesLibraryScreen';
import StoryReaderScreen from '../screens/stories/StoryReaderScreen';
import StoryEditorScreen from '../screens/stories/StoryEditorScreen';
import TemplatesScreen from '../screens/stories/TemplatesScreen';

import TimeHubScreen from '../screens/time/TimeHubScreen';
import VisualTimerScreen from '../screens/time/VisualTimerScreen';
import FirstThenScreen from '../screens/time/FirstThenScreen';
import HowLongScreen from '../screens/time/HowLongScreen';
import WaitCardScreen from '../screens/time/WaitCardScreen';

import WordsGlossaryScreen from '../screens/words/WordsGlossaryScreen';
import WordDetailScreen from '../screens/words/WordDetailScreen';
import AddWordScreen from '../screens/words/AddWordScreen';
import SentenceBuilderScreen from '../screens/words/SentenceBuilderScreen';

import BottomTabBar from '../components/navigation/BottomTabBar';

const Tab = createBottomTabNavigator<MainTabsParams>();
const DayStack = createStackNavigator<DayStackParams>();
const StoriesStack = createStackNavigator<StoriesStackParams>();
const TimeStack = createStackNavigator<TimeStackParams>();
const WordsStack = createStackNavigator<WordsStackParams>();

const NO_HEADER = { headerShown: false } as const;

function DayNavigator() {
  return (
    <DayStack.Navigator screenOptions={NO_HEADER}>
      <DayStack.Screen name="Day" component={DayScreen} />
      <DayStack.Screen name="ActivityCatalog" component={ActivityCatalogScreen} />
      <DayStack.Screen
        name="AddActivity"
        component={AddActivityScreen}
        options={{
          presentation: 'transparentModal',
          cardStyle: { backgroundColor: 'transparent' },
          cardOverlayEnabled: false,
        }}
      />
      <DayStack.Screen name="AddCatalogActivity" component={AddCatalogActivityScreen} />
    </DayStack.Navigator>
  );
}

function StoriesNavigator() {
  return (
    <StoriesStack.Navigator screenOptions={NO_HEADER}>
      <StoriesStack.Screen name="StoriesLibrary" component={StoriesLibraryScreen} />
      <StoriesStack.Screen name="StoryReader" component={StoryReaderScreen} />
      <StoriesStack.Screen name="StoryEditor" component={StoryEditorScreen} />
      <StoriesStack.Screen name="Templates" component={TemplatesScreen} />
    </StoriesStack.Navigator>
  );
}

function TimeNavigator() {
  return (
    <TimeStack.Navigator screenOptions={NO_HEADER}>
      <TimeStack.Screen name="TimeHub" component={TimeHubScreen} />
      <TimeStack.Screen name="VisualTimer" component={VisualTimerScreen} />
      <TimeStack.Screen name="FirstThen" component={FirstThenScreen} />
      <TimeStack.Screen name="HowLong" component={HowLongScreen} />
      <TimeStack.Screen name="WaitCard" component={WaitCardScreen} />
    </TimeStack.Navigator>
  );
}

function WordsNavigator() {
  return (
    <WordsStack.Navigator screenOptions={NO_HEADER}>
      <WordsStack.Screen name="WordsGlossary" component={WordsGlossaryScreen} />
      <WordsStack.Screen name="WordDetail" component={WordDetailScreen} />
      <WordsStack.Screen name="AddWord" component={AddWordScreen} />
      <WordsStack.Screen name="SentenceBuilder" component={SentenceBuilderScreen} />
    </WordsStack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="MiDía" component={DayNavigator} />
      <Tab.Screen name="Historias" component={StoriesNavigator} />
      <Tab.Screen name="Tiempo" component={TimeNavigator} />
      <Tab.Screen name="Palabras" component={WordsNavigator} />
    </Tab.Navigator>
  );
}
