import { defineConfig, devices } from "@playwright/test";

// Testa o build de produção (o mesmo que vai para o GitHub Pages), no computador e no celular.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // o site escolhe a língua pelo navegador; os testes partem do português, e idiomas.spec.js troca de língua
  use: { baseURL: "http://localhost:4173/", trace: "retain-on-failure", locale: "pt-BR" },
  webServer: {
    command: "npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "computador", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 800 } } },
    { name: "celular", use: { ...devices["Pixel 7"] } },
  ],
});
