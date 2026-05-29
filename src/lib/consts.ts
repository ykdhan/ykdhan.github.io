// Brand colors for every tech that appears across the projects.
export const LANGUAGE_COLORS: Record<string, string> = {
  HTML: "#e44b23",
  SASS: "#cf649a",
  jQuery: "#0769ad",
  React: "#22c3ee",
  "React Native": "#61dafb",
  Redux: "#9b6cff",
  "Redux Saga": "#9b6cff",
  "Redux Toolkit": "#9b6cff",
  "Ruby on Rails": "#e0382a",
  Vue: "#42d392",
  Nuxt: "#19e08a",
  Pinia: "#ffd858",
  JavaScript: "#f7df1e",
  TypeScript: "#3da9fc",
  Vite: "#a06bff",
  PHP: "#8892bf",
  Flutter: "#5bc7f8",
  Firebase: "#ffca28",
  GetX: "#a14bff",
  Linux: "#f5f5f5",
  "Three.js": "#e8e8e8",
  "Gulp.js": "#eb4646",
  GraphQL: "#ff4fb6",
  PostgreSQL: "#5a9fd4",
  Express: "#5fd0e0"
};

export const colorFor = (tech: string): string => LANGUAGE_COLORS[tech] ?? "#d8ff35";
