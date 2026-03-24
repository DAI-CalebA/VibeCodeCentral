# vibecode-app

React Native app built with Expo and TypeScript.

## Stack
- **Framework**: Expo (SDK 55) + React Native 0.83
- **Language**: TypeScript
- **Entry point**: `index.ts` → `App.tsx`

## Development

```bash
npm start          # Start Expo dev server (scan QR with Expo Go app)
npm run android    # Open on Android emulator/device
npm run ios        # Open on iOS simulator (macOS only)
npm run web        # Open in browser
```

## Project Structure
```
App.tsx            # Root component
assets/            # Images, fonts, icons
index.ts           # Entry point
app.json           # Expo config
tsconfig.json      # TypeScript config
```

## Notes
- Use Expo Go app on your phone to preview during development
- TypeScript strict mode is enabled
- Prefer functional components with hooks
