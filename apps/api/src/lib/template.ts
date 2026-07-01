import { readFileSync } from "node:fs";
import { join } from "node:path";
import Handlebars from "handlebars";

const compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();

export function renderTemplate(
  name: string,
  variables: Record<string, string>,
): string {
  let compiled = compiledTemplates.get(name);
  if (!compiled) {
    const raw = readFileSync(
      join(join(__dirname, "..", "templates"), `${name}.html`),
      "utf-8",
    );
    compiled = Handlebars.compile(raw);
    compiledTemplates.set(name, compiled);
  }
  return compiled(variables);
}
