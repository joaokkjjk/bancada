import { expect } from "@playwright/test";

/**
 * Guarda os erros de JavaScript da página para conferir no fim de cada teste.
 * O aviso de script bloqueado no about:srcdoc é o sandbox do editor de HTML funcionando.
 */
export function vigiarErros(page) {
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));
  page.on("console", (m) => {
    if (
      m.type() === "error" &&
      !/favicon|Failed to load resource|Blocked script execution in 'about:srcdoc'/.test(m.text())
    )
      erros.push(m.text());
  });
  return {
    semErros: () => expect(erros, erros.join("\n")).toEqual([]),
  };
}

/**
 * Vai para uma rota do site e espera a página nova ser montada. Sem isso, durante a animação de saída
 * o teste ainda enxergaria a página anterior.
 */
export async function abrir(page, rota) {
  const hash = `#/${rota}`;
  if (page.url().includes("#/")) await page.evaluate((h) => (location.hash = h), hash);
  else await page.goto(`./${hash}`);
  await expect(page.locator("#app")).toHaveAttribute("data-rota", hash === "#/" ? /^#\/?$/ : hash);
}
