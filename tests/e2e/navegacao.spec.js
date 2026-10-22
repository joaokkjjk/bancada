import { expect, test } from "@playwright/test";
import { abrir, vigiarErros } from "./apoio.js";

const ROTAS = [
  ["", /Toda a informática/],
  ["biblioteca", /Leia tudo aqui/],
  ["pecas", /Uma peça de cada vez/],
  ["guias", /Passo a passo/],
  ["glossario", /Termos sem mistério/],
  ["trilhas", /Aprenda em sequência/],
  ["questoes", /Pratique por tema/],
];

for (const [rota, titulo] of ROTAS) {
  test(`abre /${rota || "início"} sem erros`, async ({ page }) => {
    // a lista de peças baixa o Three.js e desenha miniaturas 3D; sem placa de vídeo, no CI, isso é lento
    if (rota === "pecas") test.slow();
    const v = vigiarErros(page);
    await abrir(page, rota);
    await expect(page.locator("#app h1").first()).toHaveText(titulo);
    await expect(page.locator("main, #app")).not.toBeEmpty();
    v.semErros();
  });
}

test("o menu leva às seções e marca a seção atual", async ({ page, isMobile }) => {
  await abrir(page, "");
  if (isMobile) {
    await page.locator("#abrir-menu").click();
    await page.locator("#menu-mob a", { hasText: "Glossário" }).click();
  } else {
    await page.locator("nav.main a", { hasText: "Glossário" }).click();
  }
  await expect(page).toHaveURL(/#\/glossario/);
  await expect(page.locator("#app h1")).toHaveText(/Termos/);
  if (!isMobile) await expect(page.locator('nav.main a[data-r="glossario"]')).toHaveAttribute("aria-current", "page");
});

test("a busca encontra conteúdo e o Enter abre o primeiro resultado", async ({ page }) => {
  const v = vigiarErros(page);
  await abrir(page, "");
  await page.locator("#abrir-busca").click();
  await page.locator("#busca-in").fill("memória ram");
  await expect(page.locator("#busca-res a").first()).toBeVisible();
  await page.locator("#busca-in").press("Enter");
  await expect(page.locator("#busca-ov")).toBeHidden();
  await expect(page).not.toHaveURL(/#\/$/);
  v.semErros();
});

test("o glossário filtra pelo texto digitado", async ({ page }) => {
  await abrir(page, "glossario");
  const antes = await page.locator(".term").count();
  await page.locator(".search").fill("cache");
  await expect.poll(() => page.locator(".term").count()).toBeLessThan(antes);
  await expect(page.locator(".term").first()).toContainText(/cache/i);
});

test("uma peça abre com o visualizador 3D", async ({ page }) => {
  test.slow();
  const v = vigiarErros(page);
  await abrir(page, "pecas/cpu");
  await expect(page.locator(".v3d canvas")).toBeVisible({ timeout: 15_000 });
  v.semErros();
});

test("o jogo mostra a explicação e o botão de iniciar", async ({ page }) => {
  const v = vigiarErros(page);
  await abrir(page, "jogo");
  await expect(
    page
      .getByRole("button", { name: /iniciar/i })
      .filter({ visible: true })
      .first(),
  ).toBeVisible();
  v.semErros();
});

test("um livro abre no leitor do site", async ({ page }) => {
  const v = vigiarErros(page);
  await abrir(page, "ler/bancada-hardware-do-zero/1");
  await expect(page.locator("#app h1").first()).not.toBeEmpty();
  v.semErros();
});
