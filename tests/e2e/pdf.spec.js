import { expect, test } from "@playwright/test";
import { abrir, vigiarErros } from "./apoio.js";

/* Seleciona um trecho da primeira página pelo texto invisível do PDF.js. */
async function selecionar(page, indice) {
  await page.evaluate((i) => {
    const f = document.querySelector('.folha[data-n="1"]');
    const sp = [...f.querySelectorAll(".textLayer span")].filter((s) => s.textContent.trim().length > 10);
    const rg = document.createRange();
    rg.setStart(sp[i].firstChild, 0);
    rg.setEnd(sp[i].firstChild, Math.min(20, sp[i].textContent.length));
    getSelection().removeAllRanges();
    getSelection().addRange(rg);
    sp[i].dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerType: "mouse" }));
  }, indice);
}

test.beforeEach(async ({ page }) => {
  // limpa as anotações só na primeira carga, para o teste de recarregar enxergar o que foi salvo
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("limpo")) {
      localStorage.clear();
      sessionStorage.setItem("limpo", "1");
    }
  });
});

test("o PDF abre com texto selecionável", async ({ page }) => {
  const v = vigiarErros(page);
  await abrir(page, "pdf/python-termos/1");
  await expect(page.locator('.folha[data-n="1"] canvas')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.folha[data-n="1"] .textLayer span').first()).toBeAttached();
  v.semErros();
});

test("marcar, comentar e anotar ficam salvos depois de recarregar", async ({ page, isMobile }) => {
  test.skip(isMobile, "no celular a seleção por toque é confirmada com um botão; coberto no teste da pílula");
  await abrir(page, "pdf/python-termos/1");
  await expect(page.locator('.folha[data-n="1"] .textLayer span').first()).toBeAttached({ timeout: 20_000 });

  await page.locator(".pdf-ferr .fr-cor").first().click();
  await selecionar(page, 2);
  await expect(page.locator('.folha[data-n="1"] .amk').first()).toBeVisible();

  await page.getByRole("button", { name: "Comentar um trecho" }).click();
  await selecionar(page, 4);
  await page.locator(".anot-pop textarea").fill("Rever antes da prova");
  await page.locator(".anot-pop .bt-mini.on").click();
  await expect(page.locator(".amk-ic")).toHaveCount(1);

  await page.getByRole("button", { name: "Abrir o bloco de notas" }).click();
  await page.locator(".cad-ta").fill("Minhas notas do livro");
  await expect(page.locator(".cad-salvo")).toHaveText("Salvo");

  await page.reload();
  await expect(page.locator('.folha[data-n="1"] .amk').first()).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".pdf-ferr .fr-item")).toHaveCount(2);
  await page.getByRole("button", { name: "Abrir o bloco de notas" }).click();
  await expect(page.locator(".cad-ta")).toHaveValue("Minhas notas do livro");
});

test("no celular as ferramentas ficam numa pílula embaixo", async ({ page, isMobile }) => {
  test.skip(!isMobile, "só no celular");
  await abrir(page, "pdf/python-termos/1");
  const pilula = page.locator(".pdf-ferr");
  await expect(pilula).toBeVisible();
  const caixa = await pilula.boundingBox();
  const vp = page.viewportSize();
  expect(caixa.y + caixa.height).toBeGreaterThan(vp.height - 80);
  await page.getByRole("button", { name: "Ver marcações" }).click();
  await expect(page.locator(".caderno")).toBeVisible();
});
