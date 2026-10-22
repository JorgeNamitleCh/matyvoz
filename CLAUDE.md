# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
npm start              # Start the Metro bundler
npm run ios            # Build and run on iOS simulator
npm run android        # Build and run on Android emulator/device
npm run lint           # ESLint
npm test               # Jest (all tests)
npm test -- --testPathPattern=App   # Run a single test file by pattern
```

### iOS native dependencies

Run once after cloning or whenever native dependencies change:

```sh
bundle install          # Only needed on first clone
bundle exec pod install # Run from ios/ after native dep changes
```

---

## Architecture: Clean Architecture in 4 layers

```
src/
  core/          → Domain layer (no framework deps)
  data/          → Data layer (Firebase implementations)
  presentation/  → UI layer (screens, components, stores, navigation)
  infrastructure/→ Cross-cutting (theme, Firebase config)
```

**Rule:** screens and Zustand stores must NEVER import from `data/` directly. They call use cases (`core/domain/usecases/`) which call repository interfaces (`core/domain/repositories/`). Firebase repositories in `data/repositories/` implement those interfaces.

---

## Core layer (`src/core/`)

**Entities** (`core/domain/entities/`): pure TypeScript interfaces — `Family`, `Child`, `Activity`, `Story` (+ `StoryStep`), `Word`, `TimerSession`. No class instances, no framework deps.

**Repository interfaces** (`core/domain/repositories/`): `IAuthRepository`, `IChildRepository`, `IActivityRepository`, `IStoryRepository`, `IWordRepository`, `ITimerRepository`. Only these interfaces cross layer boundaries.

**Use cases** (`core/domain/usecases/`): one class per operation, receives the repository interface via constructor. Examples: `GetActivitiesForDateUseCase` (merges dated + recurring), `StartTimerUseCase`.

**Errors** (`core/errors/AppError.ts`): `AppError`, `AuthError`, `NotFoundError`, `ValidationError`.

---

## Data layer (`src/data/`)

`FirebaseDataSource` (base class in `data/datasources/firebase/`) wraps Firestore CRUD — all concrete Firebase repos extend it.

**Mappers** (`data/mappers/`): `fromFirestore(id, data)` / `toFirestore(entity)` static objects for each entity. Firestore Timestamps are converted to `Date` here.

**Firestore collections:** `families`, `children`, `activities`, `stories`, `words`, `timerSessions`

To add a new backend (REST API): implement the same `IXxxRepository` interfaces in a new `data/repositories/RestXxxRepository.ts`, swap the instantiation in the screens/use cases. Nothing else changes.

---

## Presentation layer (`src/presentation/`)

### Stores (Zustand)
- `useAuthStore` — `family`, `isAuthenticated`, `isLoading`
- `useChildStore` — `currentChild`
- `useDayStore` — `activities[]`, `selectedDate`, `markComplete`
- `useStoriesStore` — `stories[]`, `currentStory`
- `useWordsStore` — `words[]`, `searchTerm`, `getByCategory()`, `filteredWords()`
- `useTimerStore` — self-contained interval timer (runs independently of any screen). Call `start(seconds)`, `pause()`, `reset()`.

### Navigation
`AppNavigator` → auth state decides between `AuthStack` and `MainTabs`.

`MainTabs` has 4 bottom tabs (MiDía, Historias, Tiempo, Palabras) + a hidden Settings screen. Each tab has its own stack navigator.

Navigation types are in `presentation/navigation/types.ts` — use `DayScreenProps<'Day'>` etc. for typed screen props.

### Screen layout per feature

| Feature | Screens |
|---------|---------|
| Auth | `LoginScreen`, `RegisterScreen` |
| Onboarding | `ChildDataScreen` (support type + minimal animations), `ChildProfileScreen` (neurodivergence, communication, sensitivities) |
| Mi día | `DayScreen` (timeline), `ActivityCatalogScreen` (PECS grid), `AddActivityScreen` |
| Historias | `StoriesLibraryScreen`, `StoryReaderScreen` (child mode: black bg, large text), `StoryEditorScreen`, `TemplatesScreen` |
| Tiempo | `TimeHubScreen`, `VisualTimerScreen`, `FirstThenScreen`, `HowLongScreen`, `WaitCardScreen` |
| Palabras | `WordsGlossaryScreen` (PECS sections), `WordDetailScreen`, `AddWordScreen` |
| Ajustes | `SettingsScreen` (Niño / Familiar mode toggle) |

### Components
- `PictogramCard` — icon+label, `size` sm/md/lg, `color` prop
- `ActivityRow` — timeline row with category badge, AHORA button, completion state
- `PECSCategorySection` — colored header + pictogram grid
- `DayTimeline` — wraps `ActivityRow` list
- `VisualTimerCircle` — animated SVG ring (uses `react-native-svg`)
- `FirstThenBoard` — 2-panel first/then layout
- `StorySlide` — full-screen step, `childMode` prop for dark bg + large text
- `PillButton` — primary/secondary/outlined variants
- `BottomTabBar` — custom tab bar component
- `ChildAvatar` — avatar + name + age

---

## Infrastructure layer (`src/infrastructure/`)

### Theme
`ThemeProvider` wraps the app in `App.tsx`. Access via `useTheme()` from any component.

```ts
const { colors, typography, spacing, borderRadius } = useTheme();
```

Key design tokens: `colors.primary` (#2D1B5E dark purple), `colors.background` (#F5F0E8 warm cream), `colors.pecsPerson/pecsAction/pecsPlace/pecsEmotion` for PECS color coding. `typography.fontSizeChildBody/fontSizeChildTitle` for child-facing screens.

### Firebase config
`infrastructure/config/firebase.ts` — `@react-native-firebase` auto-discovers native config files. Place `google-services.json` in `android/app/` and `GoogleService-Info.plist` in `ios/MatyVoz/`.

---

## Adding a new feature end-to-end

1. **Entity** — add/extend interface in `core/domain/entities/`
2. **Repository interface** — add method to `core/domain/repositories/IXxxRepository.ts`
3. **Use case** — new file in `core/domain/usecases/xxx/`
4. **Firebase implementation** — implement new method in `data/repositories/FirebaseXxxRepository.ts`, add mapper if needed
5. **Zustand store** — add state + action in `presentation/stores/useXxxStore.ts`
6. **Screen** — import use case + store; use case is instantiated at module level (not inside the component)
7. **Navigation** — add screen to the appropriate stack in `MainTabs.tsx` or `AuthStack.tsx`, add params type to `navigation/types.ts`

---

## Key implementation notes

- `StoryReaderScreen` has a child mode: black background, `typography.fontSizeChildTitle` text, no UI chrome, tap to advance.
- `useTimerStore` manages its own `setInterval` ref — the timer keeps running across navigation.
- Activity recurrence merging is done in `GetActivitiesForDateUseCase` (not in the repo or the screen).
- `useAuth` hook (in `presentation/hooks/`) subscribes to `auth().onAuthStateChanged` and updates `useAuthStore` — called once in `App.tsx`.
- `SettingsScreen` mode toggle (`Niño` / `Familiar`) should gate access to editing screens via a PIN in a future iteration.
- `minimalAnimations` flag on `Child` entity should be read in components to skip `Animated` transitions.


  /Users/jorgenamitle/.claude/projects/-Users-jorgenamitle-reactnative-MatyVoz/memory/
  ├── MEMORY.md              ← índice
  ├── project_matyvoz.md     ← estado completo del proyecto
  ├── feedback_design.md     ← feedback de diseño (nuevo)
  ├── feedback_yarn.md       ← usar yarn no npm
  └── user_jorge.md          ← preferencias tuyas