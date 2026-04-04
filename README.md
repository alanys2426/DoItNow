# DoItNow - Full Environment Setup

- Frontend app: `DoItNow/` (Expo, web/PWA target)
- Backend API: `server/` (Go)
- DB/Auth: Supabase

## 1) Frontend (Expo) setup

From repo root:

```bash
cd DoItNow
npm install
```

Install Supabase-related frontend packages:

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

Run frontend:

```bash
npm run web
```

Docs:
- [Expo start/develop](https://docs.expo.dev/get-started/start-developing/)
- [Supabase + React Native quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native)

## 2) Backend (Go) setup

Install Go:
- [Go download](https://go.dev/dl/)

Verify:

```bash
go version
```

From repo root:

```bash
cd server
go mod init doitnow/server
go get github.com/supabase-community/supabase-go
go get github.com/joho/godotenv
```

Docs:
- [Go module setup](https://go.dev/doc/tutorial/create-module)
- [supabase-go README](https://github.com/supabase-community/supabase-go/blob/main/README.md)

## 3) Supabase project values

Get values from:
- [Supabase Dashboard](https://supabase.com/dashboard)
- Path: **Project Settings -> API**

Copy:
- `Project URL`
- `service_role` key (backend only)

Docs:
- [Supabase API keys](https://supabase.com/docs/guides/api/api-keys)
- [Supabase API overview](https://supabase.com/docs/guides/api)

## 4) Local backend env file

Create `server/.env`:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Make sure `.env` is gitignored.

## 5) Verify backend env works

From `server/`:

Note: this command validates required environment variables (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) and exits. It does not start HTTP routes yet.

```bash
go run .
```

Expected:

```text
env ok (keys not printed)
```

If you see that line, environment setup is complete.