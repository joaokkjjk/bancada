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

test("o glossário, o termo do dia e a busca mudam de língua", async ({ page, isMobile }) => {
  const v = vigiarErros(page);
  await abrir(page, "glossario");
  await escolher(page, isMobile, "FR", "Français");
  await expect(page.locator(".dic-cab h1")).toHaveText("Glossaire");
  await expect(page.locator(".dic-temas button", { hasText: "Réseaux" })).toBeVisible();
  await page.locator(".search").fill("dissipateur");
  await expect(page.locator(".term dt").first()).toHaveText("Dissipateur");
  await expect(page.locator(".term .tag").first()).toHaveText("Matériel");
  await page.locator("#abrir-busca").click();
  await page.locator("#busca-in").fill("pâte thermique");
  await expect(page.locator("#busca-res a", { hasText: "Pâte thermique" })).toBeVisible();
  v.semErros();
});

test("a biblioteca mostra livros na língua escolhida e lê o texto dentro do site", async ({ page, isMobile }) => {
  const v = vigiarErros(page);
  await abrir(page, "biblioteca");
  await escolher(page, isMobile, "ES", "Español");
  // o destaque e o começo de cada prateleira são da língua escolhida
  await expect(page.locator(".bib-destaque .bt-pri")).toHaveAttribute("href", /py4e-es|progit-es|programacion-en-c/);
  await page.locator("#bib-lingua").selectOption("DE");
  await expect(page.locator(".books .bt", { hasText: "C-Programmierung" })).toBeVisible();
  await expect(page.locator(".books .bt", { hasText: "Python für alle" })).toBeVisible();
  // o texto do livro em alemão é baixado só ao abrir
  await page.locator(".books .bt", { hasText: "C-Programmierung" }).click();
  await expect(page.locator(".prose .body")).not.toHaveAttribute("aria-busy", "true");
  await expect(page.locator(".prose .body")).toContainText(/\S{20}/);
  await expect(page.locator(".prose .credit a").first()).toHaveAttribute(
    "href",
    /de\.wikibooks\.org\/wiki\/C-Programmierung:_/,
  );
  v.semErros();
});
