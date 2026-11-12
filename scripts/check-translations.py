"""Check the strings the game actually renders, including guide text and translated counters."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CPP = ROOT / "android-game/app/src/main/cpp"
WEB = ROOT / "web-app"
STRING = r'"(?:[^"\\]|\\.)*"'
errors = []


def catalog(entries):
    result = {}
    for key, value in entries:
        if key in result or not value.strip():
            errors.append(f"Duplicate key or empty translation: {key}")
        result[key] = value
    return result


class GuideHTML(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_guide = False
        self.keys = set()

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == "main":
            self.in_guide = attrs.get("id") in {"screen-howto", "screen-math"}
        if attrs.get("aria-label"):
            self.keys.add(attrs["aria-label"])

    def handle_endtag(self, tag):
        if tag == "main":
            self.in_guide = False

    def handle_data(self, data):
        text = data.strip()
        # The sample letter on the size buttons, numbers, and standalone math need no translation.
        if self.in_guide and re.search("[A-Za-z]", text) and text != "A":
            if not re.fullmatch(r"(?:\\\[.*?\\\]\s*|\\\(.*?\\\)\s*)+", text, re.S) or r"\text{" in text:
                self.keys.add(text)


def placeholders(text):
    # Braces within MathJax expressions describe notation rather than message arguments.
    prose = re.sub(r"\\\(.*?\\\)|\\\[.*?\\\]", "", text, flags=re.S)
    return set(re.findall(r"\{(\w+)\}", prose))


def check(platform, tables, required, languages):
    if set(tables) != languages - {"en"}:
        errors.append(f"{platform}: the catalogs and language selector disagree")
    for language, table in tables.items():
        for key in sorted(required - table.keys()):
            errors.append(f"{platform}/{language} missing: {key}")
        for key, value in table.items():
            if placeholders(key) != placeholders(value):
                errors.append(f"{platform}/{language} changed the placeholders in: {key}")


web = (WEB / "src/app.ts").read_text()
options = re.search(r"var LANGUAGE_OPTIONS\s*=\s*\[(.*?)\];", web, re.S)[1]
languages = set(re.findall(r'key:\s*"(\w+)"', options))
tables_source = re.search(r"var TEXT_TRANSLATIONS\s*=\s*\{(.*?)\n  \};", web, re.S)[1]
tables = {}
for match in re.finditer(r"^    (\w+):\s*(?=\{)", tables_source, re.M):
    tables[match[1]], _ = json.JSONDecoder(object_pairs_hook=catalog).raw_decode(tables_source[match.end():])
guide = GuideHTML()
guide.feed((WEB / "index.html").read_text())
changelog = re.search(r"var CHANGELOG_ENTRIES\s*=\s*\[(.*?)\];", web, re.S)[1]
web_keys = guide.keys | set(map(json.loads, re.findall(r"text:\s*(" + STRING + ")", changelog)))
web_keys.update(map(json.loads, re.findall(r"\bt\(\s*(" + STRING + ")", web)))
for data in ("CHAPTER_TITLES", "DIFFICULTIES"):
    labels = re.search(r"var " + data + r"\s*=\s*\[(.*?)\];", web, re.S)[1]
    web_keys.update(map(json.loads, re.findall(STRING, labels)))
patterns = re.search(r"var PATTERNS\s*=\s*\{(.*?)\n  \};", web, re.S)[1]
web_keys.update(map(json.loads, re.findall(r"label:\s*(" + STRING + ")", patterns)))
# Also catch an entry that exists in only one of the catalogs.
check("web", tables, web_keys.union(*(set(table) for table in tables.values())), languages)

native = (CPP / "main.cpp").read_text()
options = re.search(r"LanguageOption languages\[\]\s*=\s*\{(.*?)\};", native, re.S)[1]
native_languages = set(re.findall(r'\{\s*"(\w+)"', options))
if native_languages != languages:
    errors.append("The web and Android language selectors disagree")
native_tables = {}
for code, body in re.findall(r"static const std::unordered_map<std::string, std::string> (\w+) = \{(.*?)\n\s*\};", native, re.S):
    body = re.sub(r'^#include "([^"]+)"', lambda m: (CPP / m[1]).read_text(), body, flags=re.M)
    pairs = re.findall(r"\{\s*(" + STRING + r"),\s*(" + STRING + r")\s*\}", body)
    native_tables[code] = catalog((json.loads(k), json.loads(v)) for k, v in pairs)
native_keys = set(map(json.loads, re.findall(r"\btr\(s,\s*(" + STRING + ")", native)))
for screen in ("drawHowTo", "drawMath", "drawHowToIntro", "drawMathIntro"):
    body = re.search(r"^void " + screen + r"\b.*?^\}", native, re.M | re.S)[0]
    native_keys.update(json.loads(value).removeprefix("- ") for value in re.findall(STRING, body))
# A locale may customize single-letter pattern badges. Other messages are shared.
native_keys.update(k for table in native_tables.values() for k in table if len(k) > 1)
check("Android", native_tables, native_keys, native_languages)

if errors:
    raise SystemExit("\n".join(errors))
print("Translation coverage and message placeholders passed for web and Android.")
