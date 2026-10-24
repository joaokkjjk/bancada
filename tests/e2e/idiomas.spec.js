import { expect, test } from "@playwright/test";
import { abrir, vigiarErros } from "./apoio.js";

/* escolhe uma língua pelo seletor do cabeçalho (computador) ou pela fileira de siglas do menu (celular) */
async function escolher(page, isMobile, sigla, nome) {
  if (isMobile) {
    await page.locator("#abrir-menu").click();
    await page.locator(".lingua-mob button", { hasText: sigla }).click();
  } else {
    await page.locator(".lingua-bt").click();
    await page.locator(".lingua-lista button", { hasText: nome }).click();
  }
}

test("troca a língua do site e lembra a escolha", async ({ page, isMobile }) => {
  test.slow();
  const v = vigiarErros(page);
  await abrir(page, "");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await escolher(page, isMobile, "EN", "English");
  await expect(page.locator("#app h1").first()).toHaveText(/All of computing/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".rod-links a").first()).toHaveText("Books");
  await expect(page.locator("#busca-in")).toHaveAttribute("placeholder", "What do you want to learn today?");
  await page.reload();
  await expect(page.locator("#app h1").first()).toHaveText(/All of computing/);
  await escolher(page, isMobile, "DE", "Deutsch");
  await expect(page.locator("#app h1").first()).toHaveText(/Die ganze Informatik/);
  v.semErros();
});

test("cada página aparece na língua escolhida", async ({ page, isMobile }) => {
  await abrir(page, "trilhas");
  await escolher(page, isMobile, "ES", "Español");
  await expect(page.locator("#app h1")).toHaveText("Elige un camino.");
  await expect(page).toHaveTitle("Bancada · Rutas");
  await abrir(page, "questoes");
  await expect(page.locator("#app h1")).toHaveText("Practica por tema y nivel.");
  await abrir(page, "biblioteca");
  await expect(page.locator(".bib-rot")).toHaveText("Buscar en la estantería");
});

test.describe("na primeira visita", () => {
  test.use({ locale: "fr-FR" });
  test("usa a língua do navegador quando o site a tem", async ({ page }) => {
    await abrir(page, "guias");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator("#app h1")).toHaveText("Pas à pas.");
  });
});
