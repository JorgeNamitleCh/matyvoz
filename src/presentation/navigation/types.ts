import { WordCategory } from '../../core/domain/entities';
import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

export type AuthStackParams = {
  Login: undefined;
  Register: undefined;
};

export type DayStackParams = {
  Day: undefined;
  ActivityCatalog: undefined;
  /** Nueva desde el catálogo (catalogItemId) o editar una de Mi día (dayItemId). */
  AddActivity: { catalogItemId?: string; dayItemId?: string };
  AddCatalogActivity: undefined;
};

export type StoriesStackParams = {
  StoriesLibrary: undefined;
  StoryReader: { storyId: string };
  StoryEditor: { storyId?: string };
  Templates: undefined;
};

export type TimeStackParams = {
  TimeHub: undefined;
  /** minutes: arranca con esa duración (ej. desde Primero/Después) */
  VisualTimer: { minutes?: number } | undefined;
  FirstThen: undefined;
  HowLong: undefined;
  WaitCard: undefined;
};

export type WordsStackParams = {
  WordsGlossary: undefined;
  WordDetail: { wordId: string };
  /** Sin wordId = palabra nueva */
  AddWord: { wordId?: string; category?: WordCategory } | undefined;
  /** Armar frases con pictogramas (vista para el niño) */
  SentenceBuilder: undefined;
};

export type MainTabsParams = {
  MiDía: NavigatorScreenParams<DayStackParams>;
  Historias: NavigatorScreenParams<StoriesStackParams>;
  Tiempo: NavigatorScreenParams<TimeStackParams>;
  Palabras: NavigatorScreenParams<WordsStackParams>;
};

export type RootStackParams = {
  Auth: NavigatorScreenParams<AuthStackParams>;
  Main: NavigatorScreenParams<MainTabsParams>;
  /** Cuenta: se abren encima de las pestañas. */
  Profile: undefined;
  EditFamily: undefined;
  EditPerson: undefined;
  DeleteAccount: undefined;
};

export type AuthScreenProps<T extends keyof AuthStackParams> = StackScreenProps<AuthStackParams, T>;
export type DayScreenProps<T extends keyof DayStackParams> = StackScreenProps<DayStackParams, T>;
export type StoriesScreenProps<T extends keyof StoriesStackParams> = StackScreenProps<StoriesStackParams, T>;
export type TimeScreenProps<T extends keyof TimeStackParams> = StackScreenProps<TimeStackParams, T>;
export type WordsScreenProps<T extends keyof WordsStackParams> = StackScreenProps<WordsStackParams, T>;
export type RootScreenProps<T extends keyof RootStackParams> = StackScreenProps<RootStackParams, T>;
