import { expect, test } from "@playwright/test";
import { abrir, vigiarErros } from "./apoio.js";

const TRILHAS = ["pc", "cpu", "ram", "armazenamento", "html", "python", "ia"];

test("a página de trilhas lista as 7 trilhas e o banco de questões", async ({ page }) => {
  await abrir(page, "trilhas");
  await expect(page.locator(".trilha")).toHaveCount(TRILHAS.length + 1);
});

for (const t of TRILHAS) {
  test(`trilha ${t}: os 6 módulos abrem com visuais e questões`, async ({ page }) => {
    const v = vigiarErros(page);
    for (let m = 1; m <= 6; m++) {
      await abrir(page, `trilhas/${t}/${m}`);
      await expect(page.locator(".mod-corpo h1")).not.toBeEmpty();
      await expect(page.locator(".mod-q .q").first()).toBeVisible();
      for (const fig of await page.locator("figure.vis").all()) await expect(fig).not.toBeEmpty();
    }
    v.semErros();
  });
}

test("responder uma questão mostra a correção e a explicação", async ({ page }) => {
  await abrir(page, "trilhas/cpu/1");
  const q = page.locator(".mod-q .q").first();
  await q.locator(".q-o").first().click();
  await expect(q.locator(".q-exp")).toBeVisible();
  await expect(q.locator(".q-o.certa")).toHaveCount(1);
  await expect(page.locator(".placar")).toContainText("1 respondidas");
});

test("o rastreio de Python executa linha a linha", async ({ page }) => {
  await abrir(page, "trilhas/python/1");
  const fig = page.locator("figure.vis").first();
  await fig.getByRole("button", { name: /Executar linha/ }).click();
  await expect(fig.locator(".gvars")).toContainText("idade");
  await expect(fig.locator(".gl.atual")).toContainText("idade = 17");
});

test("a calculadora de especificidade responde ao seletor digitado", async ({ page }) => {
  await abrir(page, "trilhas/html/3");
  await page.locator(".gsel-in").fill("#menu .item a");
  await expect(page.locator(".gspec b")).toHaveText(["1", "1", "1"]);
});

test("o editor de HTML mostra o resultado ao vivo", async ({ page }) => {
  await abrir(page, "trilhas/html/2");
  const fig = page.locator("figure.vis").filter({ has: page.locator(".gcod") });
  await fig.locator(".gcod").fill("<h1>Teste do Bancada</h1>");
  await expect(fig.frameLocator("iframe").locator("h1")).toHaveText("Teste do Bancada");
});

test("o banco de questões tem simulado com nota", async ({ page }) => {
  await abrir(page, "questoes");
  await page.locator(".chip", { hasText: "Simulado" }).click();
  await expect(page.locator(".qlist .q")).toHaveCount(10);
});

test("o mapa de trilhas oferece continuar o último módulo e mostra o progresso", async ({ page }) => {
  await abrir(page, "trilhas");
  await expect(page.locator(".tr-cont .vt-k")).toHaveText("COMECE POR AQUI");
  await abrir(page, "trilhas/python/3");
  const q = page.locator(".mod-q .q");
  const n = await q.count();
  for (let i = 0; i < n; i++) await q.nth(i).locator(".q-o").first().click();
  await abrir(page, "trilhas");
  await expect(page.locator(".tr-cont .vt-k")).toHaveText("CONTINUE DE ONDE PAROU");
  await expect(page.locator(".tr-cont b")).toHaveText("Python · módulo 3");
  await expect(page.locator(".estacao", { hasText: "Python" })).toHaveClass(/andamento|feita/);
});
