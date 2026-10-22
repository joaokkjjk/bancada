import { defineConfig } from "vite";

// base relativa: o mesmo build funciona no GitHub Pages (/bancada/) e em qualquer pasta.
// Os dados ficam em public/data como scripts comuns, carregados pelo index.html.
export default defineConfig({
  base: "./",
  build: { target: "es2020", sourcemap: true },
});
