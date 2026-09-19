#!/usr/bin/env node
// history-append — keep HISTORY.md current, one merged PR at a time (26.0918).
//
// ⚠️ MASTER COPY: ~/.claude/skills/repo-history/history-append.mjs (backed up to
// claude-config nightly). Each repo carries an INSTALLED copy at
// scripts/history-append.mjs, because a GitHub workflow in one private repo
// cannot read another. Edit the master, then re-run the skill's install.sh in
// each repo — never edit an installed copy; the next install overwrites it.
//
// Travis, 26.0918: "do you have an automatic process to update the history
// doc? Because, if not, we should add that to any time you make a PR."
//
// THE CONTRACT. Every PR description carries its own HISTORY entry between two
// markers, written in the style of the repo-history skill's style.md:
//
//     <!-- history -->
//     **plain name of the change**
//     - New: …
//       Try it: …
//     <!-- /history -->
//
// (For a PR with several parts, the lines under the name are the parts, each
// `- **[Part](commit link)** · merged ?` — the `?` is filled in on merge.)
//
// Three modes, all driven by the GitHub event JSON at $GITHUB_EVENT_PATH:
//   --check      on an open PR: exit 1 (a red ✗) when the block is missing or
//                empty, saying exactly what to add. It cannot block the merge
//                (a private repo needs GitHub Pro for that), only flag it.
//   --append     on a merged PR: build the entry — `**praxis #N: name** ·
//                [PR #N](url) · merged YY.MMDD.HHMM` (Boise) — and put it at the
//                top of HISTORY.md, under this month's heading (made if new).
//                Idempotent: a PR already in the file is left alone. A PR with
//                no block still gets a line, marked as missing its summary, so
//                the gap is visible in the history instead of silent.
//   --self-test  the asserts, no network, no event file (smoke:history).
//
// RELEASE REPOS (www): when HISTORY_RELEASE_FROM names a branch (the repo
// variable, e.g. "dev"), a PR from that branch into the default branch is a
// RELEASE. It needs no block of its own: on merge its entry is GATHERED from
// the feature PRs it carries (each one's block becomes a part), read through
// the GitHub API with GITHUB_TOKEN. A release block, if written, supplies the
// name (a name-only block) or the whole curated body. Bot PRs (Dependabot)
// never fail the check and get a stock "automatic update" line.
//
// The PR body is DATA: it is read from the event file, never interpolated into
// a shell command.
import { readFileSync, writeFileSync, realpathSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The "<label> #N:" prefix. Default: the repo's own name (GITHUB_REPOSITORY is
// "owner/name" inside Actions); HISTORY_REPO_LABEL overrides it.
const REPO_LABEL = process.env.HISTORY_REPO_LABEL ?? (process.env.GITHUB_REPOSITORY ?? "").split("/")[1] ?? "repo";
const DOC = fileURLToPath(new URL("../HISTORY.md", import.meta.url));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** ISO instant → Boise `YY.MMDD.HHMM`, plus the month heading it belongs under. */
export function boiseStamp(iso) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Boise", year: "2-digit", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const g = (t) => parts.find((p) => p.type === t).value;
  return { stamp: `${g("year")}.${g("month")}${g("day")}.${g("hour")}${g("minute")}`, heading: `## ${MONTHS[Number(g("month")) - 1]} 20${g("year")}` };
}

/** The text between <!-- history --> and <!-- /history -->, or null. */
export function extractBlock(body) {
  const m = /<!--\s*history\s*-->[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*<!--\s*\/history\s*-->/.exec(body ?? "");
  const text = m ? m[1].replace(/\r/g, "").trim() : "";
  return text ? text : null;
}

const RELEASE_FROM = process.env.HISTORY_RELEASE_FROM || "";
/** A PR opened by a bot account (Dependabot and friends). */
export const isBot = (pr) => /\[bot\]$/.test(pr?.user?.login ?? "");
/** A release: from the release branch into another branch. */
export const isRelease = (pr, from = RELEASE_FROM) => Boolean(from) && pr?.head?.ref === from && pr?.base?.ref !== from;
const botLine = (title) => `Behind the scenes: an automatic dependency update — "${title.trim()}".`;

/** A block → its name (the leading **bold** line, else `fallback`) and its lines. */
export function parseBlock(block, fallback) {
  const bl = (block ?? "").split("\n");
  const head = /^\*\*([^*].*?)\*\*\s*$/.exec(bl[0] ?? "");
  const lines = head ? bl.slice(1) : bl;
  while (lines.length && !lines[0].trim()) lines.shift();
  return { name: head ? head[1].trim() : fallback, lines };
}

/** The finished entry for a merged PR. */
export function buildEntry({ number, title, url, mergedAt, body, label = REPO_LABEL || "repo", bot = false }) {
  const { stamp } = boiseStamp(mergedAt);
  const block = extractBlock(body);
  let name = title.trim();
  let lines;
  if (block) {
    ({ name, lines } = parseBlock(block, name));
    if (!lines.length) lines = [`- Behind the scenes: ${name}.`];
  } else if (bot) {
    lines = [`- ${botLine(name)}`];
  } else {
    lines = [`- Behind the scenes: ${name}. <!-- no plain-language history block was written for this PR -->`];
  }
  lines = lines.map((l) => l.replace(/· merged \?/g, `· merged ${stamp}`));
  return `**${label} #${number}: ${name}** · [PR #${number}](${url}) · merged ${stamp}\n${lines.join("\n")}`;
}

/** One feature PR carried by a release → its part lines (stamped with the release time). */
export function featureParts(f, stamp) {
  const title = f.title.trim();
  const block = extractBlock(f.body);
  if (!block) {
    const text = isBot(f) ? botLine(title) : `Behind the scenes: ${title}. <!-- no plain-language history block was written for PR #${f.number} -->`;
    return [`- **[${title}](${f.html_url})** · merged ${stamp}`, `  ${text}`];
  }
  const { name, lines } = parseBlock(block, title);
  if (lines.some((l) => /^- \*\*\[/.test(l))) return lines.map((l) => l.replace(/· merged \?/g, `· merged ${stamp}`));
  return [`- **[${name}](${f.html_url})** · merged ${stamp}`, ...lines.map((l) => (l.startsWith("- ") ? `  ${l.slice(2)}` : l))];
}

/** A release entry: its parts are the feature PRs it carried, newest first. */
export function buildReleaseEntry({ number, title, url, mergedAt, body, features, label = REPO_LABEL || "repo" }) {
  const { stamp } = boiseStamp(mergedAt);
  const own = extractBlock(body) ? parseBlock(extractBlock(body), null) : null;
  const names = features.map((f) => parseBlock(extractBlock(f.body) ?? "", f.title.trim()).name ?? f.title.trim());
  const name = own?.name ?? (names.length === 0 ? title.trim() : names.length <= 3 ? names.join(" · ") : `${names.slice(0, 2).join(" · ")} + ${names.length - 2} more`);
  let lines;
  if (own && own.lines.length) lines = own.lines.map((l) => l.replace(/· merged \?/g, `· merged ${stamp}`));
  else if (features.length) lines = features.flatMap((f) => featureParts(f, stamp));
  else lines = [`- Behind the scenes: ${title.trim()}. <!-- a release with no feature pull requests found -->`];
  return `**${label} #${number}: ${name}** · [PR #${number}](${url}) · merged ${stamp}\n${lines.join("\n")}`;
}

/** GitHub REST, read-only, with the workflow's token. */
async function gh(path) {
  const r = await fetch(`https://api.github.com${path}`, { headers: { authorization: `Bearer ${process.env.GITHUB_TOKEN}`, accept: "application/vnd.github+json" } });
  if (!r.ok) throw new Error(`GitHub API ${path}: HTTP ${r.status}`);
  return r.json();
}

/** The feature PRs (merged into the release branch) that own any of these commits, newest first. */
async function featuresOf(shas, exclude = null) {
  const repo = process.env.GITHUB_REPOSITORY;
  const found = new Map();
  for (const sha of shas) {
    for (const p of await gh(`/repos/${repo}/commits/${sha}/pulls`)) {
      if (p.number !== exclude && p.merged_at && p.base?.ref === RELEASE_FROM && !found.has(p.number)) found.set(p.number, p);
    }
  }
  return [...found.values()].sort((a, b) => b.merged_at.localeCompare(a.merged_at));
}

/** The feature PRs a release carried: PRs merged into the release branch that own a commit of this one. */
async function releaseFeatures(pr) {
  const repo = process.env.GITHUB_REPOSITORY;
  const shas = [];
  for (let page = 1; page <= 3; page++) {
    const c = await gh(`/repos/${repo}/pulls/${pr.number}/commits?per_page=100&page=${page}`);
    shas.push(...c.map((x) => x.sha));
    if (c.length < 100) break;
  }
  return featuresOf(shas, pr.number);
}

/** The version the NEXT release will carry, given the default branch's HISTORY.md and the feature
 *  PRs now waiting on the release branch — the same calculation the release's own merge will make.
 *  Nothing waiting → the current version (the newest stamp). */
export function predictVersion(mainDoc, waiting) {
  const current = splitEntries(mainDoc).map(versionIn).find(Boolean) ?? replay(mainDoc).at(-1)?.version ?? "0.0.0";
  if (!waiting.length) return current;
  const entry = buildReleaseEntry({ number: 0, title: "release", url: "", mergedAt: new Date(0).toISOString(), body: "", features: waiting });
  return versionForNew(mainDoc, entry);
}

/** --predict: for a SANDBOX build of a release repo. Reads the default branch's HISTORY.md and the
 *  feature PRs on the release branch that the default branch doesn't have yet. (26.0918: production
 *  runs the exact sandbox image, so the version must be decided when the sandbox builds — Travis:
 *  "nothing can get to prod that hasn't been in the sandbox environment".) */
async function predictCli() {
  const repo = process.env.GITHUB_REPOSITORY;
  const base = process.env.DEFAULT_BRANCH || "main";
  const docAt = async (ref) => {
    try { return Buffer.from((await gh(`/repos/${repo}/contents/HISTORY.md?ref=${encodeURIComponent(ref)}`)).content, "base64").toString("utf8"); }
    catch { return ""; }
  };
  // Whichever copy carries the NEWER stamp: the release branch has version changes the default
  // branch hasn't released yet (e.g. a first stamping); the default branch has the bot's newest
  // entry when the release branch wasn't fast-forwarded after the last release.
  const docs = [await docAt(base), RELEASE_FROM ? await docAt(RELEASE_FROM) : ""];
  const newestIn = (d) => splitEntries(d).map(versionIn).find(Boolean) ?? null;
  const mainDoc = docs.reduce((a, b) => (compareVersions(newestIn(b), newestIn(a)) > 0 ? b : a));
  let waiting = [];
  if (RELEASE_FROM) {
    const cmp = await gh(`/repos/${repo}/compare/${base}...${RELEASE_FROM}`);
    waiting = await featuresOf(cmp.commits.map((c) => c.sha));
  }
  return { version: predictVersion(mainDoc, waiting), waiting: waiting.map((p) => p.number) };
}

// ── SEMVER FROM THE HISTORY (26.0918) ──────────────────────────────────────
// Travis: "a process by which you come up with a semver number based on the
// changes made in the repo … you could use the history file to help decide what
// semver we really should be on." The entry's own labels decide the bump:
//   Removed: / Breaking:  → MAJOR  (something you could use is gone or works differently)
//   New:                  → MINOR  (something added)
//   anything else         → PATCH  (Fixed:, Behind the scenes:)
// The first entry of a history is v1.0.0 — each of these repos was in real use
// from its first entry — and every later entry bumps from the one before.
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const ENTRY_HEAD = /^\*\*[^*].*?\*\* · /;

/** The bump one entry calls for. */
export function bumpFor(entry) {
  if (/^[ \t]*(?:- )?(?:Removed|Breaking)\b[^:\n]*:/m.test(entry)) return "major";
  if (/^[ \t]*(?:- )?New\b[^:\n]*:/m.test(entry)) return "minor";
  return "patch";
}

/** Compare two versions (null sorts lowest): >0 when a is newer. */
export function compareVersions(a, b) {
  if (!a || !b) return a ? 1 : b ? -1 : 0;
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

/** `1.4.2` + a bump → the next version. */
export function nextVersion(v, kind) {
  const m = SEMVER.exec(v);
  if (!m) throw new Error(`not a semver version: ${v}`);
  const [maj, min, pat] = m.slice(1).map(Number);
  return kind === "major" ? `${maj + 1}.0.0` : kind === "minor" ? `${maj}.${min + 1}.0` : `${maj}.${min}.${pat + 1}`;
}

/** The newest-first document → its entries (header + lines), newest first. */
export function splitEntries(doc) {
  const out = [];
  let cur = null;
  for (const line of doc.split("\n")) {
    if (ENTRY_HEAD.test(line)) { cur = [line]; out.push(cur); }
    else if (line.startsWith("## ")) cur = null;
    else if (cur) cur.push(line);
  }
  return out.map((l) => l.join("\n").trimEnd());
}

/** The version a header already carries (` · v1.2.3` at its end), or null. */
export const versionIn = (header) => (/ · v(\d+\.\d+\.\d+)\s*$/.exec(header.split("\n")[0]) ?? [])[1] ?? null;

/** Replay a whole history oldest → newest: every entry's bump and the version it produces.
 *  `zeroThrough` (a piece of one entry's header) applies semver's INITIAL-DEVELOPMENT rule
 *  (0.y.z: "anything MAY change at any time"): the history starts at 0.1.0, a break bumps
 *  only the minor number and anything else the patch, through that entry; the NEXT entry is
 *  declared 1.0.0, and the normal rule runs from there. Used once, when a repo's history is
 *  first stamped (www: its first six hand-built weeks of 2019, through 19.0703). */
export function replay(doc, { zeroThrough = null } = {}) {
  const entries = splitEntries(doc).reverse();
  let v = null;
  let zero = Boolean(zeroThrough);
  return entries.map((e) => {
    const header = e.split("\n")[0];
    const kind = v === null ? "first" : bumpFor(e);
    if (v === null) v = zero ? "0.1.0" : "1.0.0";
    else if (zero) v = nextVersion(v, kind === "major" ? "minor" : "patch");
    else if (v.startsWith("0.")) v = "1.0.0";
    else v = nextVersion(v, kind);
    if (zero && header.includes(zeroThrough)) zero = false;
    return { header, kind, version: v };
  });
}

/** The version the NEXT entry should get: the newest recorded one, bumped; or a replay when none is recorded yet. */
export function versionForNew(doc, entry) {
  const newest = splitEntries(doc).map(versionIn).find(Boolean);
  if (newest) return nextVersion(newest, bumpFor(entry));
  const r = replay(doc);
  return r.length ? nextVersion(r[r.length - 1].version, bumpFor(entry)) : "1.0.0";
}

/** An entry whose header ends ` · v1.2.3` (any earlier stamp replaced). */
export function stampHeader(entry, version) {
  const [head, ...rest] = entry.split("\n");
  return [`${head.replace(/ · v\d+\.\d+\.\d+\s*$/, "")} · v${version}`, ...rest].join("\n");
}

/** Every entry of a document stamped with the version the replay gives it; returns [doc, newest]. */
export function stampAll(doc, opts = {}) {
  const r = replay(doc, opts);
  let i = r.length - 1; // splitEntries order is newest first; replay is oldest first
  const lines = doc.split("\n").map((line) => {
    if (!ENTRY_HEAD.test(line)) return line;
    const v = r[i--].version;
    return stampHeader(line, v);
  });
  return [lines.join("\n"), r.at(-1)?.version ?? null];
}

/** package.json (+ package-lock.json's two root fields) → `version`, when the repo has them. */
function setPackageVersion(version) {
  const pkg = fileURLToPath(new URL("../package.json", import.meta.url));
  if (existsSync(pkg)) {
    const t = readFileSync(pkg, "utf8");
    const n = t.replace(/("version"\s*:\s*")[^"]*(")/, `$1${version}$2`);
    if (n !== t) writeFileSync(pkg, n);
  }
  const lock = fileURLToPath(new URL("../package-lock.json", import.meta.url));
  if (existsSync(lock)) {
    const j = JSON.parse(readFileSync(lock, "utf8"));
    j.version = version;
    if (j.packages?.[""]) j.packages[""].version = version;
    writeFileSync(lock, `${JSON.stringify(j, null, 2)}\n`);
  }
}

/** Put `entry` at the top of the newest-first document, under its month heading. */
export function insertEntry(doc, entry, mergedAt) {
  const { heading } = boiseStamp(mergedAt);
  const at = doc.search(/^## /m);
  if (at === -1) return `${doc.trimEnd()}\n\n${heading}\n\n${entry}\n`;
  const first = doc.slice(at).split("\n")[0];
  if (first === heading) {
    const after = at + first.length;
    return `${doc.slice(0, after)}\n\n${entry}\n${doc.slice(after).replace(/^\n+/, "\n")}`;
  }
  return `${doc.slice(0, at)}${heading}\n\n${entry}\n\n${doc.slice(at)}`;
}

function event() {
  const p = process.env.GITHUB_EVENT_PATH;
  if (!p) { console.error("history-append: no GITHUB_EVENT_PATH — this mode runs inside GitHub Actions."); process.exit(2); }
  return JSON.parse(readFileSync(p, "utf8")).pull_request;
}

function selfTest() {
  let pass = 0; const fails = [];
  const ok = (c, l) => (c ? pass++ : fails.push(l));
  // 20:31Z on 26.0918 is 14:31 in Boise (MDT, UTC−6); 03:00Z on 26.1001 is still 26.0930 in Boise.
  ok(boiseStamp("2026-09-18T20:31:59Z").stamp === "26.0918.1431", "stamp: UTC → Boise YY.MMDD.HHMM");
  ok(boiseStamp("2026-10-01T03:00:00Z").stamp === "26.0930.2100" && boiseStamp("2026-10-01T03:00:00Z").heading === "## September 2026", "stamp: a UTC date past midnight stays on the Boise day and month");
  ok(boiseStamp("2026-12-01T20:00:00Z").stamp === "26.1201.1300", "stamp: winter is MST (UTC−7)");
  const body = "**In plain words:** x.\n\n<!-- history -->\n**Pretty name**\n- New: a thing.\n  Try it: open http://localhost:8743\n<!-- /history -->\n\n🤖";
  ok(extractBlock(body) === "**Pretty name**\n- New: a thing.\n  Try it: open http://localhost:8743", "extract: the block between the markers, trimmed");
  ok(extractBlock("no block here") === null && extractBlock("<!-- history -->\n\n<!-- /history -->") === null, "extract: missing or empty block → null");
  ok(extractBlock("<!-- history -->\r\n**A**\r\n- New: b\r\n<!-- /history -->") === "**A**\n- New: b", "extract: CRLF bodies (GitHub's web editor) parse the same");
  const e = buildEntry({ number: 36, title: "feat: x", url: "https://github.com/travis-horton/praxis/pull/36", mergedAt: "2026-09-18T20:31:59Z", body, label: "praxis" });
  ok(e === "**praxis #36: Pretty name** · [PR #36](https://github.com/travis-horton/praxis/pull/36) · merged 26.0918.1431\n- New: a thing.\n  Try it: open http://localhost:8743", "entry: header from the block's name, stamped, lines kept verbatim");
  const parts = buildEntry({ number: 37, title: "t", url: "u", mergedAt: "2026-09-18T20:31:59Z", label: "praxis", body: "<!-- history -->\n**Two things**\n- **[One](c1)** · merged ?\n  Fixed: a.\n- **[Two](c2)** · merged ?\n  New: b.\n<!-- /history -->" });
  ok(parts.includes("- **[One](c1)** · merged 26.0918.1431") && parts.includes("- **[Two](c2)** · merged 26.0918.1431") && !parts.includes("merged ?"), "entry: every part's `merged ?` gets the merge stamp");
  const none = buildEntry({ number: 38, title: "chore: y", url: "u", mergedAt: "2026-09-18T20:31:59Z", body: "", label: "praxis" });
  ok(/^\*\*praxis #38: chore: y\*\*/.test(none) && none.includes("no plain-language history block"), "entry: no block → a visible, marked placeholder, never silence");
  ok(isBot({ user: { login: "dependabot[bot]" } }) && !isBot({ user: { login: "travis-horton" } }), "bot: a [bot] account is recognised, a person is not");
  ok(isRelease({ head: { ref: "dev" }, base: { ref: "main" } }, "dev") && !isRelease({ head: { ref: "feat/x" }, base: { ref: "dev" } }, "dev") && !isRelease({ head: { ref: "dev" }, base: { ref: "main" } }, ""), "release: dev → main is a release only when a release branch is configured");
  const dep = buildEntry({ number: 70, title: "Bump axios from 1 to 2", url: "u", mergedAt: "2026-09-18T20:31:59Z", body: "", label: "www", bot: true });
  ok(dep.endsWith('- Behind the scenes: an automatic dependency update — "Bump axios from 1 to 2".') && !dep.includes("no plain-language"), "bot: a Dependabot PR gets the stock line, not the missing-summary marker");
  const S = "26.0918.1431";
  const f1 = { number: 96, title: "feat: redirect", html_url: "https://x/pull/96", merged_at: "2026-09-17T17:00:00Z", user: { login: "t" }, body: "<!-- history -->\n**travish.com forwards to www**\n- New: the bare address forwards.\n  Try it: open https://travish.com\n<!-- /history -->" };
  ok(featureParts(f1, S).join("\n") === "- **[travish.com forwards to www](https://x/pull/96)** · merged 26.0918.1431\n  New: the bare address forwards.\n  Try it: open https://travish.com", "release part: a single-change feature becomes one part linked to its PR, labels indented");
  const f2 = { number: 91, title: "t", html_url: "https://x/pull/91", merged_at: "2026-09-17T16:00:00Z", user: { login: "t" }, body: "<!-- history -->\n**badge**\n- **[DEV badge](c1)** · merged ?\n  New: a tab.\n- **[Hidden from search](c2)** · merged ?\n  Behind the scenes: noindex.\n<!-- /history -->" };
  ok(featureParts(f2, S).join("\n") === "- **[DEV badge](c1)** · merged 26.0918.1431\n  New: a tab.\n- **[Hidden from search](c2)** · merged 26.0918.1431\n  Behind the scenes: noindex.", "release part: a feature with its own parts keeps them, stamped with the release");
  const f3 = { number: 70, title: "Bump braces", html_url: "https://x/pull/70", merged_at: "2026-09-16T00:00:00Z", user: { login: "dependabot[bot]" }, body: "" };
  const rel = buildReleaseEntry({ number: 99, title: "Merge dev", url: "https://x/pull/99", mergedAt: "2026-09-18T20:31:59Z", body: "", features: [f1, f2, f3], label: "www" });
  ok(rel.startsWith("**www #99: travish.com forwards to www · badge · Bump braces** · [PR #99](https://x/pull/99) · merged 26.0918.1431\n- **[travish.com forwards to www]") && rel.includes("- **[DEV badge](c1)**") && rel.includes("an automatic dependency update"), "release: no block of its own → named from its features, parts gathered in order");
  const rel2 = buildReleaseEntry({ number: 99, title: "Merge dev", url: "u", mergedAt: "2026-09-18T20:31:59Z", body: "<!-- history -->\n**About page rewritten**\n<!-- /history -->", features: [f1], label: "www" });
  ok(rel2.startsWith("**www #99: About page rewritten**") && rel2.includes("[travish.com forwards to www](https://x/pull/96)"), "release: a name-only block names it, the features still fill it");
  const many = buildReleaseEntry({ number: 88, title: "t", url: "u", mergedAt: "2026-09-18T20:31:59Z", body: "", features: [f1, f1, f1, f1].map((f, i) => ({ ...f, number: i })), label: "www" });
  ok(/^\*\*www #88: travish.com forwards to www · travish.com forwards to www \+ 2 more\*\*/.test(many), "release: more than three features → two names + N more");
  // semver
  ok(bumpFor("**a** · x\n- **[P](c)** · merged 1\n  Removed: the /old page is gone.") === "major" && bumpFor("**a** · x\n- Breaking: the command changed.") === "major", "semver: Removed:/Breaking: (as a part or a single change) → major");
  ok(bumpFor("**a** · x\n- New, switched off: a toggle.") === "minor" && bumpFor("**a** · x\n- **[P](c)** · merged 1\n  New: a page.\n  Fixed: b.") === "minor", "semver: any New (incl. \"New, switched off\") → minor");
  ok(bumpFor("**a** · x\n- Fixed: b.\n  Try it: c") === "patch" && bumpFor("**a** · x\n- Behind the scenes: removed an unused library.") === "patch", "semver: Fixed / Behind the scenes → patch, even when the words say \"removed\"");
  ok(nextVersion("2.14.3", "major") === "3.0.0" && nextVersion("2.14.3", "minor") === "2.15.0" && nextVersion("2.14.3", "patch") === "2.14.4", "semver: bumps reset the lower numbers");
  const hist = "# H\n\n## September 2026\n\n**c** · [PR #3](u) · merged 26.0918.1200\n- Removed: the old site.\n\n**b** · [PR #2](u) · merged 26.0917.1200\n- New: a page.\n\n## August 2026\n\n**a** · [PR #1](u) · merged 26.0801.1200\n- Fixed: a typo.\n";
  const rp = replay(hist);
  ok(rp.map((x) => `${x.kind}:${x.version}`).join(" ") === "first:1.0.0 minor:1.1.0 major:2.0.0", "replay: oldest first, the first entry is 1.0.0, then each entry's bump");
  const hist4 = "# H\n\n## September 2026\n\n**d** · [PR #4](u) · merged 26.0919.1200\n- Removed: y.\n\n**c** · [PR #3](u) · merged 26.0918.1200\n- New: x.\n\n**b** · [PR #2](u) · merged 26.0917.1200\n- Breaking: moved.\n\n**a** · [PR #1](u) · merged 26.0801.1200\n- New: first.\n";
  ok(replay(hist4, { zeroThrough: "[PR #2]" }).map((x) => x.version).join(" ") === "0.1.0 0.2.0 1.0.0 2.0.0", "replay 0.x: a break during initial development bumps the minor; the next entry is declared 1.0.0; then the normal rule");
  const stamped = "# H\n\n## September 2026\n\n**www #104: x** · [PR #104](u) · merged 26.0918.1513 · v3.27.0\n- New: y.\n";
  const feat = (n, body, login = "t") => ({ number: n, title: `pr ${n}`, html_url: `u/${n}`, merged_at: "2026-09-18T22:00:00Z", user: { login }, body });
  ok(compareVersions("3.28.0", "3.27.9") > 0 && compareVersions("2.10.0", "2.9.0") > 0 && compareVersions(null, "1.0.0") < 0 && compareVersions("1.0.0", "1.0.0") === 0, "compare: numeric, not alphabetical; a missing stamp sorts lowest");
  ok(predictVersion(stamped, []) === "3.27.0", "predict: nothing waiting on dev → the current version");
  ok(predictVersion(stamped, [feat(105, "<!-- history -->\n**a**\n- New: b.\n<!-- /history -->"), feat(106, "<!-- history -->\n**c**\n- Fixed: d.\n<!-- /history -->")]) === "3.28.0", "predict: a New among the waiting features → the next minor, exactly what the release will stamp");
  ok(predictVersion(stamped, [feat(107, "", "dependabot[bot]")]) === "3.27.1", "predict: only an automatic update waiting → the next patch");
  const [st, newest] = stampAll(hist);
  ok(newest === "2.0.0" && st.includes("merged 26.0918.1200 · v2.0.0") && st.includes("merged 26.0801.1200 · v1.0.0") && stampAll(st)[0] === st, "stamp: every header gets its version; stamping twice changes nothing");
  ok(versionForNew(st, "**d** · x\n- Fixed: y.") === "2.0.1" && versionForNew(hist, "**d** · x\n- New: y.") === "2.1.0", "next: from the newest stamp, or from a replay when nothing is stamped yet");
  ok(stampHeader("**d** · [PR #4](u) · merged 26.0919.0900\n- New: y.", "2.1.0").startsWith("**d** · [PR #4](u) · merged 26.0919.0900 · v2.1.0\n"), "stamp: the new entry's header ends with its version");
  const doc = "# T\n\nintro\n\n## September 2026\n\n**old** · x\n- Fixed: z.\n";
  const d1 = insertEntry(doc, "**new** · y\n- New: w.", "2026-09-18T20:31:59Z");
  ok(d1 === "# T\n\nintro\n\n## September 2026\n\n**new** · y\n- New: w.\n\n**old** · x\n- Fixed: z.\n", "insert: same month → directly under the heading, one blank line either side");
  const d2 = insertEntry(doc, "**oct** · y\n- New: w.", "2026-10-02T18:00:00Z");
  ok(d2 === "# T\n\nintro\n\n## October 2026\n\n**oct** · y\n- New: w.\n\n## September 2026\n\n**old** · x\n- Fixed: z.\n", "insert: a new month → a new heading above the last one");
  console.log(fails.length ? fails.map((f) => `FAIL  ${f}`).join("\n") : "");
  console.log(`HISTORY-APPEND SMOKE ${fails.length ? "FAILED" : "PASSED"}  (${pass} passed · ${fails.length} failed · 0 skipped)`);
  process.exit(fails.length ? 1 : 0);
}

// Run the CLI only when started directly, so the builder can also be imported.
const direct = Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
const mode = direct ? process.argv[2] : null;
const flag = (name) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] ?? null : null; };
if (!direct) { /* imported: the exports above are the whole interface */ }
else if (mode === "--self-test") selfTest();
else if (mode === "--stamp") {
  // One-time, per repo: stamp every entry with the version the replay gives it, and set package.json to the newest.
  //   node scripts/history-append.mjs --stamp [--zero-through "<piece of the last 0.x entry's header>"]
  const [stamped, newest] = stampAll(readFileSync(DOC, "utf8"), { zeroThrough: flag("--zero-through") });
  writeFileSync(DOC, stamped);
  if (newest) setPackageVersion(newest);
  console.log(`history: every entry stamped; the repo is at v${newest}.`);
} else if (mode === "--predict") {
  // node scripts/history-append.mjs --predict   (GITHUB_TOKEN, GITHUB_REPOSITORY, HISTORY_RELEASE_FROM, DEFAULT_BRANCH)
  const { version, waiting } = await predictCli();
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
  console.log(`history: the next release will be v${version} (waiting: ${waiting.length ? waiting.map((n) => `#${n}`).join(", ") : "nothing"})`);
} else if (mode === "--replay") {
  // node history-append.mjs --replay [HISTORY.md] [--zero-through "…"] — what version every entry would carry.
  const file = process.argv[3] && !process.argv[3].startsWith("--") ? process.argv[3] : DOC;
  const r = replay(readFileSync(file, "utf8"), { zeroThrough: flag("--zero-through") });
  for (const x of r) console.log(`v${x.version.padEnd(9)} ${x.kind.padEnd(5)}  ${x.header.slice(0, 110)}`);
  const n = (k) => r.filter((x) => x.kind === k).length;
  console.log(`\n${r.length} entries → v${r.at(-1)?.version} (${n("major")} major · ${n("minor")} minor · ${n("patch")} patch)`);
}
else if (mode === "--check") {
  const pr = event();
  if (isBot(pr)) { console.log(`history: PR #${pr.number} is an automatic update — it gets a stock line on merge ✓`); process.exit(0); }
  if (isRelease(pr)) { console.log(`history: PR #${pr.number} is a release — its entry is gathered from the feature PRs it carries ✓`); process.exit(0); }
  if (extractBlock(pr.body)) { console.log(`history: PR #${pr.number} carries its history block ✓`); process.exit(0); }
  console.error(
    `history: PR #${pr.number} has no history block. Add this to the description, in plain words (the repo-history skill's style.md, in Claude's configuration):\n\n` +
    "<!-- history -->\n**plain name of the change**\n- New: what you can now see or do.\n  Try it: the exact address or command.\n<!-- /history -->\n",
  );
  process.exit(1);
} else if (mode === "--append") {
  const pr = event();
  if (!pr.merged_at) { console.log(`history: PR #${pr.number} was closed without merging — nothing to record.`); process.exit(0); }
  // A repo installed before its backfill still records merges: start a bare file
  // rather than crash, and let the backfill fill in everything older.
  const doc = existsSync(DOC)
    ? readFileSync(DOC, "utf8")
    : `# ${REPO_LABEL || "repo"} — what changed, in plain words\n\nNewest first. Entries before the first one here are still to be written (the backfill).\n`;
  if (doc.includes(`[PR #${pr.number}](${pr.html_url})`)) { console.log(`history: PR #${pr.number} is already in HISTORY.md.`); process.exit(0); }
  const base = { number: pr.number, title: pr.title, url: pr.html_url, mergedAt: pr.merged_at, body: pr.body };
  const entry = isRelease(pr) ? buildReleaseEntry({ ...base, features: await releaseFeatures(pr) }) : buildEntry({ ...base, bot: isBot(pr) });
  const version = versionForNew(doc, entry);
  writeFileSync(DOC, insertEntry(doc, stampHeader(entry, version), pr.merged_at));
  setPackageVersion(version);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\n`);
  console.log(`history: version v${version}.`);
  console.log(`history: PR #${pr.number} added to HISTORY.md.`);
} else {
  console.error("usage: history-append.mjs --check | --append | --self-test");
  process.exit(2);
}
