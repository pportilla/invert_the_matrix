import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appPath = path.join(root, "web-app", "app.js");
const outputPath = path.join(root, "web-app", "campaign-levels.json");

const code = fs.readFileSync(appPath, "utf8");
const sandbox = {
  console,
  Error,
  Math,
  Date,
  JSON,
  Number,
  Object,
  Array,
  Set,
  Map,
  String,
  Promise,
  localStorage: {
    getItem() {
      return null;
    },
    setItem() {}
  },
  document: {
    addEventListener() {}
  }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;

vm.runInNewContext(code, sandbox, { filename: appPath });

const debug = sandbox.window.ResonanceGridDebug;
if (!debug || typeof debug.generateCampaignLevels !== "function" || typeof debug.campaignLevelsToData !== "function") {
  throw new Error("Campaign generation hooks are not available. Run npm run build first.");
}

const levels = debug.generateCampaignLevels();
const data = debug.campaignLevelsToData(levels);
if (!Array.isArray(data.levels) || data.levels.length !== 225) {
  throw new Error(`Expected 225 campaign levels, found ${data.levels ? data.levels.length : 0}.`);
}

const output = `${JSON.stringify(data)}\n`;
fs.writeFileSync(outputPath, output);
console.log(`Wrote ${path.relative(root, outputPath)} with ${data.levels.length} levels. Android packages this static JSON via Gradle.`);
