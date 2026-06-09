# Tip Out Calculator

A simple tool to calculate end-of-night tip-outs:

- **Utility workers** — 1.5% of food sales (splittable by headcount)
- **Bar** — 5% of bar sales (splittable by headcount)
- **Sushi** — 3.5% of sushi sales
- **Save Night** — log a shift; history is saved in your browser

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Go to vercel.com, "Add New… → Project", import the repo.
3. Vercel auto-detects Vite. Just click **Deploy**.

That's it — you'll get a live URL.

> Note: saved nights are stored in the browser's localStorage, so history
> stays on the device/browser you use. Clearing browser data will erase it.
