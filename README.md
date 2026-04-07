# Assignment 1

This project is a movie explorer built with local mock data first, without using any external movie API.  
The goal is to focus on frontend interaction, state updates, and component-based UI before dealing with API keys, request failures, CORS issues, or inconsistent response formats.

The repository includes two separate implementations of the same app:

- A `Svelte` version in the project root
- A `React` version in [`react-version/`](Assignment-1/react-version)

## Project Overview

The app uses a local `movies.json` file with mock movie data.  
Each movie item contains:

- `title`
- `year`
- `genre`
- `rating`
- `poster`
- `description`

Both versions implement the same core features:

- Search box
- Movie cards
- Genre filter dropdown
- Sort dropdown
- Favorite button
- Details modal
- Live movie count
- Live favorite count
- Lightweight list/modal transitions

## Why Local JSON First

This project intentionally starts with local data instead of a movie API.

Reasons:

- It avoids API key setup problems
- It avoids failed requests and CORS issues
- It keeps the focus on frontend logic first
- It makes it easier to demonstrate framework features clearly

This approach allowed the main interactions to be completed first before introducing any backend or API dependency.

## Svelte Version

The Svelte implementation is located in the root of the repository.

Important files:

- [`src/App.svelte`](Assignment-1/src/App.svelte)
- [`src/lib/movies.json`](Assignment-1/src/lib/movies.json)
- [`src/app.css`](Assignment-1/src/app.css)

### Svelte Highlights

This version was designed to make Svelte's reactive features visible:

- The search input uses binding
- Filtered results update automatically
- Favorite count updates automatically
- Movie count updates automatically
- The UI logic is written with concise component syntax
- Lightweight transitions are used for cards and modal states

Examples in this version include:

- `bind:value` for input and dropdown binding
- Reactive statements for filtered movie results and counters
- Simple component structure with markup, logic, and styling separated cleanly

### Run the Svelte Version

```bash
cd /Users/shuxuanhuang/Desktop/Assignment-1
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

## React Version

The React implementation is located in [`react-version/`](Assignment-1/react-version).

Important files:

- [`react-version/src/App.jsx`](Assignment-1/react-version/src/App.jsx)
- [`react-version/src/lib/movies.json`](Assignment-1/react-version/src/lib/movies.json)
- [`react-version/src/app.css`](Assignment-1/react-version/src/app.css)

### React Highlights

This version recreates the same UI and behavior using React.

It demonstrates:

- `useState` for search, filter, sorting, favorites, and modal state
- `useMemo` for filtered and sorted movie results
- `useEffect` for modal keyboard handling
- Event-driven updates through React state changes

### Run the React Version

```bash
cd Assignment-1/react-version
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

## Svelte vs React

Both versions produce almost the same UI and features, but they differ in how the logic is written.

### Svelte

- More concise syntax
- Built-in reactivity
- Less boilerplate for bindings and updates
- Good for showing simple, direct component interaction

### React

- More explicit state management
- Larger ecosystem and more common in industry
- Requires hooks such as `useState`, `useMemo`, and `useEffect`
- Usually involves more boilerplate for the same interaction

In this assignment, Svelte made the reactive behavior easier to express, while React showed the same functionality using a more explicit state-driven approach.

## Features Demonstrated

This assignment focuses on frontend interaction rather than backend integration.

The app demonstrates:

- Local mock data rendering
- Search filtering
- Genre-based filtering
- Sorting by rating, year, and title
- Favorite toggling
- Modal-based detail view
- Automatic UI updates based on state
- Responsive layout for desktop and mobile

## Build Status

Both implementations were successfully built with Vite:

- Root Svelte app: `npm run build`
- React app in `react-version/`: `npm run build`

## Notes

- No external movie API is used in this version
- Poster images are loaded from public image URLs
- The same data structure is used in both frameworks so the comparison is fair

## Author

Assignment 1 project using Svelte and React to compare frontend implementation styles with the same movie explorer UI.
