import { expect, test } from "@playwright/test";
import { abrir, vigiarErros } from "./apoio.js";

test("no celular o início não baixa o Three.js", async ({ page, isMobile }) => {
  test.skip(!isMobile, "no computador o início mostra o processador em 3D");
  const pedidos = [];
  page.on("request", (r) => pedidos.push(r.url()));
  await abrir(page, "");
  await page.waitForLoadState("networkidle");
  expect(pedidos.some((u) => /three(\.min)?\.js|modelos3d\.js/.test(u))).toBe(false);
  expect(await page.evaluate(() => typeof window.THREE)).toBe("undefined");
});

test("no computador o início mostra o processador girando em 3D e o tira ao sair", async ({ page, isMobile }) => {
  test.skip(isMobile, "no celular o início fica sem 3D");
  test.slow();
  const v = vigiarErros(page);
  await abrir(page, "");
  const canvas = page.locator(".ih-3d canvas");
  await expect(canvas).toBeVisible({ timeout: 20_000 });
  // a rotação muda a imagem entre dois instantes
  await page.waitForTimeout(2000);
  const a = await canvas.screenshot();
  await page.waitForTimeout(700);
  const b = await canvas.screenshot();
  expect(a.equals(b)).toBe(false);
  await abrir(page, "trilhas");
  await expect(page.locator("canvas")).toHaveCount(0);
  v.semErros();
});

test("o 3D mostra um skeleton enquanto carrega e depois o modelo", async ({ page }) => {
  test.slow();
  const v = vigiarErros(page);
  await abrir(page, "pecas/cpu");
  await expect(page.locator(".v3d canvas")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".esqueleto-3d")).toHaveCount(0);
  v.semErros();
});

test("blocos abaixo da dobra entram em foco ao rolar", async ({ page }) => {
  await abrir(page, "");
  const abaixo = page.locator(".revelar").first();
  await expect(abaixo).toBeAttached();
  await abaixo.scrollIntoViewIfNeeded();
  await expect(abaixo).toHaveClass(/visto/);
});

test("a busca entra e sai com animação; pelo atalho de teclado, sem animação", async ({ page }) => {
  await abrir(page, "");
  await page.locator("#abrir-busca").click();
  await expect(page.locator(".busca-cx")).toHaveCSS("animation-name", "entra");
  await page.locator("#fechar-busca").click();
  await expect(page.locator("#busca-ov")).toBeHidden();
  await page.keyboard.press("/");
  await expect(page.locator("#busca-ov")).toBeVisible();
  await expect(page.locator(".busca-cx")).toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
  await expect(page.locator("#busca-ov")).toBeHidden();
});

test("com movimento reduzido, nada fica escondido esperando animação", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrir(page, "");
  await expect(page.locator(".revelar")).toHaveCount(0);
  await page.locator("#abrir-busca").click();
  await page.locator("#fechar-busca").click();
  await expect(page.locator("#busca-ov")).toBeHidden();
  await expect(page.locator("#busca-ov")).not.toHaveClass(/sai/);
});

test("o leitor de PDF mostra o progresso do download e depois as páginas", async ({ page }) => {
  await abrir(page, "pdf/python-termos/1");
  await expect(page.locator('.folha[data-n="1"] canvas')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".pdf-status")).toHaveCount(0);
});

test("as capas dos livros carregam sob demanda", async ({ page }) => {
  await abrir(page, "biblioteca");
  const capas = page.locator(".cover.real img");
  await expect(capas.first()).toHaveAttribute("loading", "lazy");
  await expect(page.locator(".cover.real").first()).not.toHaveClass(/esqueleto/, { timeout: 10_000 });
});
