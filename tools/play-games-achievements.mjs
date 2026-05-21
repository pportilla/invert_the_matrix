#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultKeyPath = path.join(root, ".secrets", "play-games-service-account.json");
const defaultApplicationId = "383796002883";
const defaultOutputDir = path.join(root, "build", "play-games-achievements");
const defaultImportZip = path.join(defaultOutputDir, "achievements-import.zip");
const defaultAndroidXml = path.join(root, "android-game", "app", "src", "main", "res", "values", "achievement_ids.xml");
const scope = "https://www.googleapis.com/auth/androidpublisher";

const chapterTitles = [
  "Binary Beginnings",
  "Fourfold Flips",
  "Lights With Lock Icons",
  "Lockstep Squares",
  "First Empty Holes",
  "Binary Breakaways",
  "Fivefold Binary",
  "Three-Color Start",
  "Triple Grid",
  "Three Lock-Icon Tiles",
  "Three Empty Holes",
  "Triple Combine",
  "Pattern Primer",
  "Patterns With Lock Icons",
  "Color Gauntlet",
  "Four-State Start",
  "Four-State Lock-Icon Tiles",
  "Four-State Empty Holes",
  "Four-State Patterns",
  "Four-State Matrix",
  "Five-State Start",
  "Five-State Lock-Icon Tiles",
  "Five-State Empty Holes",
  "Five-State Patterns",
  "Dense Dimensions",
];

const translations = {
  es: {
    "Binary Beginnings": "Comienzos binarios",
    "Fourfold Flips": "Giros cuádruples",
    "Lights With Lock Icons": "Luces con candados",
    "Lockstep Squares": "Cuadrados a ritmo de candado",
    "First Empty Holes": "Primeros huecos vacíos",
    "Binary Breakaways": "Escapes binarios",
    "Fivefold Binary": "Binario de cinco por cinco",
    "Three-Color Start": "Inicio tricolor",
    "Triple Grid": "Cuadrícula triple",
    "Three Lock-Icon Tiles": "Casillas con candado triples",
    "Three Empty Holes": "Tres huecos vacíos",
    "Triple Combine": "Combinación triple",
    "Pattern Primer": "Primeros patrones",
    "Patterns With Lock Icons": "Patrones con candados",
    "Color Gauntlet": "Desafío de color",
    "Four-State Start": "Inicio de cuatro estados",
    "Four-State Lock-Icon Tiles": "Casillas con candado de cuatro estados",
    "Four-State Empty Holes": "Huecos vacíos de cuatro estados",
    "Four-State Patterns": "Patrones de cuatro estados",
    "Four-State Matrix": "Matriz de cuatro estados",
    "Five-State Start": "Inicio de cinco estados",
    "Five-State Lock-Icon Tiles": "Casillas con candado de cinco estados",
    "Five-State Empty Holes": "Huecos vacíos de cinco estados",
    "Five-State Patterns": "Patrones de cinco estados",
    "Dense Dimensions": "Dimensiones densas",
  },
  fr: {
    "Binary Beginnings": "Débuts binaires",
    "Fourfold Flips": "Basculements quadruples",
    "Lights With Lock Icons": "Lumières avec cadenas",
    "Lockstep Squares": "Carrés en cadence",
    "First Empty Holes": "Premiers trous vides",
    "Binary Breakaways": "Échappées binaires",
    "Fivefold Binary": "Binaire cinq par cinq",
    "Three-Color Start": "Départ tricolore",
    "Triple Grid": "Grille triple",
    "Three Lock-Icon Tiles": "Tuiles avec cadenas triples",
    "Three Empty Holes": "Trois trous vides",
    "Triple Combine": "Combinaison triple",
    "Pattern Primer": "Premiers motifs",
    "Patterns With Lock Icons": "Motifs avec cadenas",
    "Color Gauntlet": "Défi de couleur",
    "Four-State Start": "Départ à quatre états",
    "Four-State Lock-Icon Tiles": "Tuiles avec cadenas à quatre états",
    "Four-State Empty Holes": "Trous vides à quatre états",
    "Four-State Patterns": "Motifs à quatre états",
    "Four-State Matrix": "Matrice à quatre états",
    "Five-State Start": "Départ à cinq états",
    "Five-State Lock-Icon Tiles": "Tuiles avec cadenas à cinq états",
    "Five-State Empty Holes": "Trous vides à cinq états",
    "Five-State Patterns": "Motifs à cinq états",
    "Dense Dimensions": "Dimensions denses",
  },
};

function usage() {
  console.log(`Usage:
  node tools/play-games-achievements.mjs plan [--json]
  node tools/play-games-achievements.mjs list [--json]
  node tools/play-games-achievements.mjs sync [--apply] [--limit N]
  node tools/play-games-achievements.mjs delete-drafts [--apply] [--limit N]
  node tools/play-games-achievements.mjs write-import-zip [--out FILE]
  node tools/play-games-achievements.mjs export-android-xml [--write] [--out FILE]

Environment:
  PLAY_GAMES_APPLICATION_ID        Defaults to ${defaultApplicationId}
  PLAY_GAMES_SERVICE_ACCOUNT       Defaults to .secrets/play-games-service-account.json`);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) {
      args._.push(item);
      continue;
    }
    const key = item.slice(2);
    if (key === "apply" || key === "json" || key === "write") {
      args[key] = true;
      continue;
    }
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for --${key}`);
    args[key] = value;
    i += 1;
  }
  return args;
}

function t(language, title) {
  return translations[language]?.[title] || title;
}

function twoDigit(value) {
  return String(value).padStart(2, "0");
}

function makeAchievements() {
  const achievements = [];
  chapterTitles.forEach((title, index) => {
    const group = index + 1;
    achievements.push({
      key: `chapter_${twoDigit(group)}_clear`,
      group,
      type: "clear",
      points: 5,
      sortRank: achievements.length + 1,
      initialState: "REVEALED",
      name: {
        "en-US": `Clear ${title}`,
        "es-ES": `Completa ${t("es", title)}`,
        "fr-FR": `Termine ${t("fr", title)}`,
      },
      description: {
        "en-US": `Complete all 9 levels in Group ${group}.`,
        "es-ES": `Completa los 9 niveles del grupo ${group}.`,
        "fr-FR": `Termine les 9 niveaux du groupe ${group}.`,
      },
    });
    achievements.push({
      key: `chapter_${twoDigit(group)}_master`,
      group,
      type: "master",
      points: 15,
      sortRank: achievements.length + 1,
      initialState: "REVEALED",
      name: {
        "en-US": `Master ${title}`,
        "es-ES": `Domina ${t("es", title)}`,
        "fr-FR": `Maîtrise ${t("fr", title)}`,
      },
      description: {
        "en-US": `Earn 27 stars in Group ${group}.`,
        "es-ES": `Gana 27 estrellas en el grupo ${group}.`,
        "fr-FR": `Gagne 27 étoiles dans le groupe ${group}.`,
      },
    });
  });
  validateAchievements(achievements);
  return achievements;
}

function validateAchievements(achievements) {
  const names = new Set();
  let points = 0;
  for (const achievement of achievements) {
    const name = achievement.name["en-US"];
    const description = achievement.description["en-US"];
    if (!name || name.length > 100) throw new Error(`Invalid name for ${achievement.key}`);
    if ((description || "").length > 500) throw new Error(`Description is too long for ${achievement.key}`);
    if (name.includes(",") || (description || "").includes(",")) {
      throw new Error(`Play Console CSV import does not allow commas in default strings: ${achievement.key}`);
    }
    if (names.has(name)) throw new Error(`Duplicate achievement name: ${name}`);
    names.add(name);
    if (achievement.points % 5 !== 0 || achievement.points < 5 || achievement.points > 200) {
      throw new Error(`Invalid point value for ${achievement.key}`);
    }
    points += achievement.points;
  }
  if (points > 1000) throw new Error(`Google Play achievement points exceed 1000: ${points}`);
}

function localizedBundle(values) {
  return {
    kind: "gamesConfiguration#localizedStringBundle",
    translations: Object.entries(values).map(([locale, value]) => ({
      kind: "gamesConfiguration#localizedString",
      locale,
      value,
    })),
  };
}

function achievementPayload(achievement) {
  return {
    kind: "gamesConfiguration#achievementConfiguration",
    achievementType: "STANDARD",
    initialState: achievement.initialState,
    draft: {
      kind: "gamesConfiguration#achievementConfigurationDetail",
      name: localizedBundle(achievement.name),
      description: localizedBundle(achievement.description),
      pointValue: achievement.points,
    },
  };
}

function base64Url(value) {
  return Buffer.from(typeof value === "string" ? value : JSON.stringify(value))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function accessToken() {
  const keyPath = process.env.PLAY_GAMES_SERVICE_ACCOUNT || defaultKeyPath;
  const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: key.client_email,
    scope,
    aud: key.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64Url(header)}.${base64Url(claim)}`;
  const signature = crypto
    .sign("RSA-SHA256", Buffer.from(unsigned), key.private_key)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  const assertion = `${unsigned}.${signature}`;
  const response = await fetch(key.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`OAuth failed with ${response.status}: ${body.error_description || body.error || "unknown error"}`);
  }
  return body.access_token;
}

async function apiRequest(method, endpoint, body) {
  const token = await accessToken();
  const response = await fetch(`https://www.googleapis.com/games/v1configuration${endpoint}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const parsed = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const details = parsed.error?.message || JSON.stringify(parsed.error || parsed);
    throw new Error(`${method} ${endpoint} failed with ${response.status}: ${details}`);
  }
  return parsed;
}

async function listAchievements() {
  const applicationId = process.env.PLAY_GAMES_APPLICATION_ID || defaultApplicationId;
  const items = [];
  let pageToken = "";
  do {
    const query = new URLSearchParams({ maxResults: "200" });
    if (pageToken) query.set("pageToken", pageToken);
    const response = await apiRequest("GET", `/applications/${encodeURIComponent(applicationId)}/achievements?${query}`, null);
    items.push(...(response.items || []));
    pageToken = response.nextPageToken || "";
  } while (pageToken);
  return items;
}

function achievementName(item) {
  const source = item.draft || item.published || {};
  const translations = source.name?.translations || [];
  return translations.find((entry) => entry.locale === "en-US")?.value || translations[0]?.value || "";
}

async function insertAchievement(achievement) {
  const applicationId = process.env.PLAY_GAMES_APPLICATION_ID || defaultApplicationId;
  return apiRequest(
    "POST",
    `/applications/${encodeURIComponent(applicationId)}/achievements`,
    achievementPayload(achievement),
  );
}

async function deleteAchievement(achievementId) {
  return apiRequest("DELETE", `/achievements/${encodeURIComponent(achievementId)}`, null);
}

function printPlan(json) {
  const achievements = makeAchievements();
  if (json) {
    console.log(JSON.stringify(achievements, null, 2));
    return;
  }
  const totalPoints = achievements.reduce((sum, item) => sum + item.points, 0);
  console.log(`${achievements.length} achievements, ${totalPoints} points`);
  achievements.forEach((achievement) => {
    console.log(`${achievement.key} | ${achievement.points} XP | ${achievement.name["en-US"]}`);
  });
}

async function printList(json) {
  const items = await listAchievements();
  if (json) {
    console.log(JSON.stringify(items, null, 2));
    return;
  }
  console.log(`${items.length} achievements in Play Games Services`);
  items.forEach((item) => {
    console.log(`${item.id || "(no id)"} | ${achievementName(item) || "(unnamed)"}`);
  });
}

async function syncAchievements(args) {
  const apply = Boolean(args.apply);
  const limit = args.limit ? Number(args.limit) : Infinity;
  if (!Number.isFinite(limit) && args.limit) throw new Error("--limit must be a number");
  const desired = makeAchievements();
  const existing = await listAchievements();
  const existingNames = new Set(existing.map(achievementName).filter(Boolean));
  const missing = desired.filter((achievement) => !existingNames.has(achievement.name["en-US"]));
  const selected = missing.slice(0, limit);
  console.log(`${existing.length} existing, ${missing.length} missing`);
  if (!apply) {
    selected.forEach((achievement) => console.log(`would create ${achievement.key} | ${achievement.name["en-US"]}`));
    console.log("Dry run only. Add --apply to create draft achievements through the Publishing API.");
    return;
  }
  for (const achievement of selected) {
    const created = await insertAchievement(achievement);
    console.log(`created ${achievement.key} | ${created.id || "(id pending)"} | ${achievement.name["en-US"]}`);
  }
}

async function deleteDraftAchievements(args) {
  const apply = Boolean(args.apply);
  const limit = args.limit ? Number(args.limit) : Infinity;
  if (!Number.isFinite(limit) && args.limit) throw new Error("--limit must be a number");
  const desiredNames = new Set(makeAchievements().map((achievement) => achievement.name["en-US"]));
  const existing = await listAchievements();
  const selected = existing
    .filter((item) => desiredNames.has(achievementName(item)))
    .filter((item) => item.draft && !item.published)
    .slice(0, limit);
  console.log(`${selected.length} draft-only generated achievements selected`);
  if (!apply) {
    selected.forEach((item) => console.log(`would delete ${item.id} | ${achievementName(item)}`));
    console.log("Dry run only. Add --apply to delete these draft achievements.");
    return;
  }
  for (const item of selected) {
    await deleteAchievement(item.id);
    console.log(`deleted ${item.id} | ${achievementName(item)}`);
  }
}

function csvCell(value) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function csvLine(values) {
  return values.map(csvCell).join(",");
}

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function hslToHex(hue, saturation, lightness) {
  const h = (((hue % 360) + 360) % 360) / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const hueToRgb = (p, q, t) => {
    let adjusted = t;
    if (adjusted < 0) adjusted += 1;
    if (adjusted > 1) adjusted -= 1;
    if (adjusted < 1 / 6) return p + (q - p) * 6 * adjusted;
    if (adjusted < 1 / 2) return q;
    if (adjusted < 2 / 3) return p + (q - p) * (2 / 3 - adjusted) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const rgb = [
    hueToRgb(p, q, h + 1 / 3),
    hueToRgb(p, q, h),
    hueToRgb(p, q, h - 1 / 3),
  ].map((value) => Math.round(value * 255).toString(16).padStart(2, "0"));
  return `#${rgb.join("")}`;
}

function polarPoint(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return [cx + Math.cos(radians) * radius, cy + Math.sin(radians) * radius];
}

function polygonPoints(cx, cy, radius, sides, rotation = 0) {
  return Array.from({ length: sides }, (_, index) => {
    const [x, y] = polarPoint(cx, cy, radius, rotation + index * 360 / sides);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function starPoints(cx, cy, outerRadius, innerRadius, points, rotation = 0) {
  return Array.from({ length: points * 2 }, (_, index) => {
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    const [x, y] = polarPoint(cx, cy, radius, rotation + index * 180 / points);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function iconFileName(achievement) {
  return `${achievement.key}.png`;
}

function achievementIconSvg(achievement) {
  const master = achievement.type === "master";
  const hue = (achievement.group * 137 + (master ? 31 : 0)) % 360;
  const dark = hslToHex(hue, 66, 16);
  const mid = hslToHex(hue + 28, 70, 32);
  const primary = hslToHex(hue + 8, 84, 58);
  const secondary = hslToHex(hue + 172, 72, master ? 60 : 54);
  const pale = hslToHex(hue + 62, 86, 76);
  const accent = master ? "#ffd86b" : hslToHex(hue + 228, 74, 66);
  const emblemSides = 3 + (achievement.group % 5);
  const ringDash = 12 + (achievement.group % 5) * 5;
  const ringGap = 12 + ((achievement.group + 2) % 4) * 4;
  const rotation = achievement.group * 13 + (master ? 18 : 0);
  const dotCount = 5 + achievement.group % 7;
  const cells = [];
  const start = 164;
  const step = 62;
  const size = 44;

  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 3; col += 1) {
      const index = row * 3 + col;
      const value = (achievement.group * (index + 3) + (master ? index * 2 : index)) % 5;
      const active = value < (master ? 3 : 2);
      const x = start + col * step;
      const y = start + row * step;
      const fill = active ? (index % 2 === 0 ? primary : secondary) : "#ffffff";
      const opacity = active ? "0.95" : "0.20";
      const hole = (achievement.group + index + (master ? 2 : 0)) % 6 === 0;
      cells.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="10" fill="${fill}" opacity="${opacity}" stroke="#ffffff" stroke-opacity="0.26" stroke-width="4"/>`);
      if (hole) {
        cells.push(`<circle cx="${x + size / 2}" cy="${y + size / 2}" r="9" fill="${dark}" opacity="0.9"/>`);
      }
    }
  }

  const dots = Array.from({ length: dotCount }, (_, index) => {
    const [x, y] = polarPoint(256, 256, 207, rotation + index * 360 / dotCount);
    const fill = index % 2 === 0 ? accent : pale;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${master ? 9 : 7}" fill="${fill}" opacity="0.9"/>`;
  }).join("");

  const badge = master
    ? `<polygon points="${starPoints(256, 256, 83, 38, 6, rotation)}" fill="${accent}" stroke="#fff8cf" stroke-width="8"/>
       <polygon points="${polygonPoints(256, 256, 42, emblemSides, -rotation)}" fill="${dark}" opacity="0.92"/>
       <circle cx="256" cy="256" r="16" fill="${pale}"/>`
    : `<polygon points="${polygonPoints(256, 256, 78, emblemSides, rotation)}" fill="${accent}" stroke="#ffffff" stroke-opacity="0.75" stroke-width="8"/>
       <path d="M220 258 L247 287 L299 223" fill="none" stroke="${dark}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark}"/>
      <stop offset="0.58" stop-color="${mid}"/>
      <stop offset="1" stop-color="${secondary}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="214" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="22"/>
  <circle cx="256" cy="256" r="202" fill="none" stroke="${pale}" stroke-width="${master ? 14 : 12}" stroke-linecap="round" stroke-dasharray="${ringDash} ${ringGap}" transform="rotate(${rotation} 256 256)" opacity="0.88"/>
  ${dots}
  <g filter="url(#shadow)">
    <circle cx="256" cy="256" r="140" fill="${dark}" opacity="0.48"/>
    <g transform="rotate(${master ? -8 : 8} 256 256)">
      ${cells.join("\n      ")}
    </g>
    ${badge}
  </g>
</svg>
`;
}

function iconRenderer() {
  const candidates = [
    {
      name: "rsvg-convert",
      probe: ["--version"],
      args: (svgPath, pngPath) => ["-w", "512", "-h", "512", "-o", pngPath, svgPath],
    },
    {
      name: "magick",
      probe: ["--version"],
      args: (svgPath, pngPath) => [svgPath, pngPath],
    },
    {
      name: "convert",
      probe: ["--version"],
      args: (svgPath, pngPath) => [svgPath, pngPath],
    },
  ];
  for (const candidate of candidates) {
    const probe = spawnSync(candidate.name, candidate.probe, { encoding: "utf8" });
    if (probe.status === 0) return candidate;
  }
  throw new Error("No SVG-to-PNG renderer found. Install rsvg-convert or ImageMagick.");
}

function writeAchievementIcons(achievements, workDir) {
  const renderer = iconRenderer();
  const iconDir = path.join(workDir, "icons");
  fs.mkdirSync(iconDir, { recursive: true });
  return achievements.map((achievement) => {
    const fileName = iconFileName(achievement);
    const svgPath = path.join(iconDir, `${achievement.key}.svg`);
    const pngPath = path.join(iconDir, fileName);
    writeFile(svgPath, achievementIconSvg(achievement));
    const render = spawnSync(renderer.name, renderer.args(svgPath, pngPath), { encoding: "utf8" });
    fs.rmSync(svgPath, { force: true });
    if (render.status !== 0) {
      throw new Error(render.stderr || render.stdout || `Failed to render ${fileName}`);
    }
    return { achievement, fileName, pngPath };
  });
}

function writeImportZip(args) {
  const out = path.resolve(root, args.out || defaultImportZip);
  const workDir = path.join(defaultOutputDir, "zip");
  fs.rmSync(workDir, { recursive: true, force: true });
  fs.mkdirSync(workDir, { recursive: true });

  const achievements = makeAchievements();
  const icons = writeAchievementIcons(achievements, workDir);
  const iconByKey = new Map(icons.map((icon) => [icon.achievement.key, icon]));
  const metadata = achievements.map((achievement) => csvLine([
    achievement.name["en-US"],
    achievement.description["en-US"],
    "False",
    "",
    "Revealed",
    achievement.points,
    achievement.sortRank,
  ])).join("\n") + "\n";

  const localizations = achievements.flatMap((achievement) => [
    csvLine([
      achievement.name["en-US"],
      achievement.name["es-ES"],
      achievement.description["es-ES"],
      "es-ES",
    ]),
    csvLine([
      achievement.name["en-US"],
      achievement.name["fr-FR"],
      achievement.description["fr-FR"],
      "fr-FR",
    ]),
  ]).join("\n") + "\n";

  const iconMappings = achievements.map((achievement) => csvLine([
    achievement.name["en-US"],
    iconByKey.get(achievement.key).fileName,
  ])).join("\n") + "\n";

  writeFile(path.join(workDir, "AchievementsMetadata.csv"), metadata);
  writeFile(path.join(workDir, "AchievementsLocalizations.csv"), localizations);
  writeFile(path.join(workDir, "AchievementsIconsMappings.csv"), iconMappings);

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.rmSync(out, { force: true });
  const zip = spawnSync("zip", [
    "-j",
    "-q",
    out,
    path.join(workDir, "AchievementsMetadata.csv"),
    path.join(workDir, "AchievementsLocalizations.csv"),
    path.join(workDir, "AchievementsIconsMappings.csv"),
    ...icons.map((icon) => icon.pngPath),
  ], { cwd: root, encoding: "utf8" });
  if (zip.status !== 0) {
    throw new Error(zip.stderr || zip.stdout || "zip command failed");
  }
  console.log(`Wrote ${path.relative(root, out)} with ${icons.length} icons`);
}

function resourceName(key) {
  return `achievement_${key}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function exportAndroidXml(args) {
  const desired = makeAchievements();
  const existing = await listAchievements();
  const byName = new Map(existing.map((item) => [achievementName(item), item]));
  const missing = desired.filter((achievement) => !byName.get(achievement.name["en-US"])?.id);
  if (missing.length) {
    throw new Error(`Missing achievement IDs for: ${missing.map((item) => item.key).join(", ")}`);
  }
  const lines = [
    "<resources>",
    "    <!-- Generated by tools/play-games-achievements.mjs export-android-xml. -->",
    ...desired.map((achievement) => {
      const item = byName.get(achievement.name["en-US"]);
      return `    <string name="${resourceName(achievement.key)}" translatable="false">${escapeXml(item.id)}</string>`;
    }),
    "</resources>",
    "",
  ];
  const xml = lines.join("\n");
  const out = path.resolve(root, args.out || defaultAndroidXml);
  if (args.write) {
    writeFile(out, xml);
    console.log(`Wrote ${path.relative(root, out)}`);
    return;
  }
  console.log(xml);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  if (!command || command === "help" || command === "--help") {
    usage();
    return;
  }
  if (command === "plan") {
    printPlan(Boolean(args.json));
  } else if (command === "list") {
    await printList(Boolean(args.json));
  } else if (command === "sync") {
    await syncAchievements(args);
  } else if (command === "delete-drafts") {
    await deleteDraftAchievements(args);
  } else if (command === "write-import-zip") {
    writeImportZip(args);
  } else if (command === "export-android-xml") {
    await exportAndroidXml(args);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
