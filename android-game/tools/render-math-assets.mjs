#!/usr/bin/env node

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { SVG } from "mathjax-full/js/output/svg.js";

const formulas = [
  {
    id: "hero",
    tex: String.raw`A x \equiv -s \pmod n`,
  },
  {
    id: "remainder",
    tex: String.raw`s_i\in \mathbb Z/n\mathbb Z=\{0,1,\ldots,n-1\}`,
  },
  {
    id: "wrap",
    tex: String.raw`s_i\leftarrow s_i+1\pmod n`,
  },
  {
    id: "column",
    tex: String.raw`A_{ij}=\begin{cases}1&\text{tap }j\text{ changes tile }i,\\0&\text{otherwise.}\end{cases}`,
  },
  {
    id: "plan",
    tex: String.raw`x_j=\text{number of taps on tile }j`,
  },
  {
    id: "goal",
    tex: String.raw`\begin{aligned}s+Ax&\equiv0\pmod n\\Ax&\equiv -s\pmod n\end{aligned}`,
  },
  {
    id: "image",
    tex: String.raw`\text{solution exists}\Longleftrightarrow -s\in\operatorname{Im}(A)`,
  },
  {
    id: "kernel",
    tex: String.raw`\{x:\ Ax=-s\}=x_0+\ker(A)`,
  },
  {
    id: "minimum",
    tex: String.raw`\min\|x\|_1=\min\sum_j x_j`,
  },
  {
    id: "prime",
    tex: String.raw`n\in\{2,3,5\}\Longrightarrow\mathbb Z/n\mathbb Z\text{ is a field}`,
  },
  {
    id: "four",
    tex: String.raw`2a\not\equiv1\pmod4`,
  },
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetDir = path.join(root, "app/src/main/assets/math");
const cppDir = path.join(root, "app/src/main/cpp/generated");
const tempDir = path.join(root, "build/math-assets");
const textColor = "#fff8ef";
const borderPx = 18;
const zoom = 4;

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: "none" });
const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(`${command} ${args.join(" ")} failed\n${detail}`);
  }
  return result.stdout.trim();
}

function svgFor(texSource) {
  const node = html.convert(texSource, { display: true });
  const outer = adaptor.outerHTML(node);
  const match = outer.match(/<svg[\s\S]*<\/svg>/);
  if (!match) throw new Error(`MathJax did not produce SVG for: ${texSource}`);
  let output = match[0];
  if (!output.includes("xmlns=")) {
    output = output.replace(/<svg /, `<svg xmlns="http://www.w3.org/2000/svg" `);
  }
  return output.replace(/(<svg[^>]*>)/, `$1<style>path{fill:${textColor};}</style>`);
}

function cString(value) {
  return JSON.stringify(value);
}

await mkdir(assetDir, { recursive: true });
await mkdir(cppDir, { recursive: true });
await rm(tempDir, { recursive: true, force: true });
await mkdir(tempDir, { recursive: true });

const specs = [];
for (const formula of formulas) {
  const svgPath = path.join(tempDir, `${formula.id}.svg`);
  const pngPath = path.join(tempDir, `${formula.id}.png`);
  const paddedPath = path.join(tempDir, `${formula.id}-padded.png`);
  const rawPath = path.join(assetDir, `${formula.id}.rgba`);

  await writeFile(svgPath, svgFor(formula.tex));
  run("rsvg-convert", ["-z", String(zoom), "-f", "png", "-o", pngPath, svgPath]);
  run("magick", [
    pngPath,
    "-background",
    "none",
    "-trim",
    "+repage",
    "-bordercolor",
    "none",
    "-border",
    String(borderPx),
    paddedPath,
  ]);

  const dimensions = run("magick", ["identify", "-format", "%w %h", paddedPath]).split(/\s+/).map(Number);
  run("magick", [paddedPath, "-alpha", "on", "-depth", "8", `rgba:${rawPath}`]);
  const bytes = await readFile(rawPath);
  const expected = dimensions[0] * dimensions[1] * 4;
  if (bytes.length !== expected) {
    throw new Error(`${formula.id}.rgba has ${bytes.length} bytes, expected ${expected}`);
  }
  specs.push({ id: formula.id, file: `math/${formula.id}.rgba`, width: dimensions[0], height: dimensions[1] });
}

const header = `#pragma once

struct MathAssetSpec {
    const char *id;
    const char *file;
    int width;
    int height;
};

static constexpr MathAssetSpec kMathAssets[] = {
${specs.map((spec) => `    {${cString(spec.id)}, ${cString(spec.file)}, ${spec.width}, ${spec.height}},`).join("\n")}
};
`;

await writeFile(path.join(cppDir, "math_assets.h"), header);
console.log(`Rendered ${specs.length} math assets.`);
