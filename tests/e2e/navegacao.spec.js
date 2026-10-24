import { expect, test } from "@playwright/test";
import { abrir, vigiarErros } from "./apoio.js";

const ROTAS = [
  ["", /Toda a informática/],
  ["biblioteca", /Biblioteca/],
  ["pecas", /Uma peça de cada vez/],
  ["guias", /Passo a passo/],
  ["glossario", /Glossário/],
  ["trilhas", /Aprenda em sequência/],
  ["questoes", /Pratique por tema/],
];

for (const [rota, titulo] of ROTAS) {
  test(`abre /${rota || "início"} sem erros`, async ({ page }) => {
    // a lista de peças baixa o Three.js e desenha miniaturas 3D; sem placa de vídeo, no CI, isso é lento
    if (rota === "pecas" || rota === "") test.slow();
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

test("o início lembra o último livro aberto e a trilha em andamento", async ({ page }) => {
  test.slow();
  await abrir(page, "");
  await expect(page.locator(".vt-ler .vt-k")).toHaveText("COMECE A LER");
  await abrir(page, "ler/livro-que-nao-existe/1");
  await abrir(page, "ler/por-dentro-do-pc/1");
  await abrir(page, "trilhas/ram/2");
  await abrir(page, "");
  await expect(page.locator(".vt-ler .vt-k")).toHaveText("CONTINUE LENDO");
  await expect(page.locator(".vt-ler b")).toContainText("Por dentro do PC");
  await expect(page.locator(".vitrine")).toContainText("Memória RAM");
  await expect(page.locator(".vitrine")).toContainText("Módulo 2 de 6");
});

test("a biblioteca mostra prateleiras e vira resultado ao buscar", async ({ page }) => {
  await abrir(page, "biblioteca");
  await expect(page.locator(".bib-destaque h2")).toBeVisible();
  const estantes = await page.locator(".estante").count();
  expect(estantes).toBeGreaterThan(3);
  await page.locator("#qb").fill("python");
  await expect(page.locator(".estante")).toHaveCount(0);
  await expect(page.locator(".books .book").first()).toBeVisible();
  await expect(page.locator(".count")).toContainText("encontrado");
  await page.locator("#qb").fill("");
  await page.locator("#bib-formato").selectOption("PDF");
  await expect(page.locator(".books .book").first()).toBeVisible();
});

test("o glossário leva à letra escolhida e marca a letra na barra", async ({ page, isMobile }) => {
  await abrir(page, "glossario");
  await expect(page.locator(".dic-dia b")).not.toBeEmpty();
  await page.locator(".dic-letras a", { hasText: /^M$/ }).click();
  await expect(page.locator("#letra-M")).toBeInViewport();
  await expect(page.locator(".dic-letras a[aria-current]")).toHaveText("M");
  await page.locator(".dic-temas .chip").first().click();
  await expect(page.locator(".dic-letra")).toHaveCount(0);
});
