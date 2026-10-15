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
//   --append-next  what the workflow calls (26.1009, ruling M-265): files the
//                OLDEST merged PR the history is missing — this run's own, or
//                one an earlier run lost — and prints RECORDED <n> <v> or
//                NOTHING; the workflow loops until NOTHING. See CATCH-UP below.
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
import { readFileSync, writeFileSync, realpathSync, existsSync, appendFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
  const month = (h) => { const m = /^## (\S+) (\d{4})\s*$/.exec(h); return m && MONTHS.includes(m[1]) ? Number(m[2]) * 12 + MONTHS.indexOf(m[1]) : null; };
  // Never open a heading older than the top one: like a late entry, it sits where it was recorded.
  const older = month(heading) !== null && month(first) !== null && month(heading) < month(first);
  if (first === heading || older) {
    const after = at + first.length;
    return `${doc.slice(0, after)}\n\n${entry}\n${doc.slice(after).replace(/^\n+/, "\n")}`;
  }
  return `${doc.slice(0, at)}${heading}\n\n${entry}\n\n${doc.slice(at)}`;
}

// ── CATCH-UP (adopted 26.1009, ruling M-265) ───────────────────────────────
// praxis #55 (26.0919) never got its entry: three PRs merged within 92 s, and
// the workflow's concurrency group keeps only ONE pending run, so #56's run
// cancelled #55's before it started. From now on every merge also files ANY
// merged PR the history is missing, so one lost run heals itself on the next
// merge. "Missing" is bounded below by the FLOOR: the merge stamp of the
// oldest entry this workflow wrote itself (header `**<label> #N: …`), so a
// backfilled repo's older PRs are never re-filed.

/** Is PR #n already recorded? (any `[PR #n](…/pull/n)` link counts — backfill entries too) */
export const recorded = (doc, n) => new RegExp(`\\[PR #${n}\\]\\([^)\\s]*/pull/${n}\\)`).test(doc);

/** The catch-up floor: the oldest merge stamp on a bot-written header, or null (nothing written yet). */
export function catchUpFloor(doc, label = REPO_LABEL || "repo") {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^\\*\\*${esc} #\\d+: .*? · merged (\\d\\d\\.\\d{4}\\.\\d{4})`, "gm");
  let floor = null;
  for (const m of doc.matchAll(re)) if (!floor || m[1] < floor) floor = m[1];
  return floor;
}

/** The merged PRs still to file, OLDEST first: `prs` (from the API, plus the event's own PR) that
 *  merged into `base` at or after the floor and are not yet recorded. No floor → only `mustInclude`. */
export function toFile(doc, prs, { base, floor, mustInclude = null }) {
  const seen = new Set();
  return prs
    .filter((p) => p && p.merged_at && p.base?.ref === base)
    .filter((p) => (seen.has(p.number) ? false : seen.add(p.number)))
    .filter((p) => p.number === mustInclude || (floor && boiseStamp(p.merged_at).stamp >= floor))
    .filter((p) => !recorded(doc, p.number))
    .sort((a, b) => a.merged_at.localeCompare(b.merged_at) || a.number - b.number);
}

/** Filed more than an hour after it merged → a LATE entry: it goes at the top in arrival order with the
 *  next version (never renumbering anything already published or tagged), says when it was recorded,
 *  and sits under the CURRENT month heading (insertEntry with the merge time would open a stale
 *  "## September" heading above October). */
export const LATE_MS = 60 * 60 * 1000;
export function lateStamp(mergedAt, nowIso) {
  return Date.parse(nowIso) - Date.parse(mergedAt) > LATE_MS ? boiseStamp(nowIso).stamp : null;
}

/** ` · recorded late YY.MMDD.HHMM` after the merge stamp (tags.py's header pattern allows one such field). */
export function markLate(entry, stamp) {
  const [head, ...rest] = entry.split("\n");
  return [head.replace(/( · merged \d\d\.\d{4}\.\d{4})/, `$1 · recorded late ${stamp}`), ...rest].join("\n");
}

/** File ONE PR into the document: returns { doc, version }. `from` (the release branch) and
 *  `features` (a release's feature-PR lookup) are seams for the self-test and for fileNext. */
export async function fileOne(doc, pr, nowIso, { from = RELEASE_FROM, features = releaseFeatures } = {}) {
  const base = { number: pr.number, title: pr.title, url: pr.html_url, mergedAt: pr.merged_at, body: pr.body };
  let entry = isRelease(pr, from) ? buildReleaseEntry({ ...base, features: await features(pr) }) : buildEntry({ ...base, bot: isBot(pr) });
  const late = lateStamp(pr.merged_at, nowIso);
  if (late) entry = markLate(entry, late);
  const version = versionForNew(doc, entry);
  return { doc: insertEntry(doc, stampHeader(entry, version), late ? nowIso : pr.merged_at), version };
}

/** File the OLDEST PR in `queue` that can be filed now: returns { doc, version, pr }, or null when
 *  the queue is empty or every PR in it was skipped. (26.1010, Auditor2 F2.) A CATCH-UP release PR
 *  (not the run's `own`) whose feature lookup fails is skipped with `onSkip` and filed by a later
 *  run; only that lookup is caught. The run's own PR, and every non-release PR, are filed with no
 *  catch, so a failure there still fails the run. */
export async function fileNext(doc, queue, {
  own = null, nowIso, from = RELEASE_FROM, features = releaseFeatures,
  onSkip = (pr, e) => warn(`catch-up — release PR #${pr.number}'s feature lookup failed (${e.message}); skipped this run, a later run files it`),
} = {}) {
  for (const pr of queue) {
    if (pr.number !== own && isRelease(pr, from)) {
      let feats;
      try { feats = await features(pr); }
      catch (e) { onSkip(pr, e); continue; }
      return { ...(await fileOne(doc, pr, nowIso, { from, features: async () => feats })), pr };
    }
    return { ...(await fileOne(doc, pr, nowIso, { from, features })), pr };
  }
  return null;
}

/** Read the next page? Only when this one is FULL (100) and its oldest `updated_at` is still at or
 *  after the floor. The list comes newest-updated first, and a PR merged after the floor was
 *  updated at or after that moment, so a page that reaches back past the floor holds the last of
 *  them. (A fixed page count would stop at the 300 newest: praxis passed 218 closed PRs on 26.1009.) */
export function morePages(page, floor) {
  if (!Array.isArray(page) || page.length < 100 || !floor) return false;
  const oldest = page.reduce((m, p) => (p.updated_at < m ? p.updated_at : m), page[0].updated_at);
  return boiseStamp(oldest).stamp >= floor;
}

export const MAX_PAGES = 50;
const warn = (msg) => console.error(`::warning::history: ${msg}`);

/** Every PR merged into `base`, paged back to the floor through `fetchPage(base, page)` (1-based).
 *  No floor (a fresh install) → no call at all: only the run's own PR is filed then. ANY failure
 *  (rate limit, 5xx, permission) → `onError(err)` and an EMPTY list, never a throw: catch-up is
 *  skipped for this run, and the run's own PR is still filed. */
export async function gatherMerged(fetchPage, base, floor, onError = (e) => warn(`catch-up skipped — ${e.message}`)) {
  if (!floor) return [];
  const out = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const c = await fetchPage(base, page);
      out.push(...c.filter((p) => p.merged_at));
      if (!morePages(c, floor)) return out;
    }
    warn(`catch-up stopped at ${MAX_PAGES} pages (${MAX_PAGES * 100} closed PRs) before reaching the floor ${floor}`);
    return out;
  } catch (e) {
    onError(e);
    return [];
  }
}

/** The merged-PR list --append-next works from, cached per job at `cache` so a push retry (reset to
 *  the remote, file again) costs no extra API calls. A cached list is used as is. No floor → [] and
 *  nothing cached. A FAILED fetch is never cached, so the next call in this job (or a retry) can
 *  try again: `onError` fires and the list is []. */
export async function mergedList(cache, fetchPage, base, floor, onError = (e) => warn(`catch-up skipped — ${e.message}`)) {
  if (existsSync(cache)) return JSON.parse(readFileSync(cache, "utf8"));
  if (!floor) return [];
  let failed = false;
  const list = await gatherMerged(fetchPage, base, floor, (e) => { failed = true; onError(e); });
  if (!failed) writeFileSync(cache, JSON.stringify(list));
  return list;
}

/** The read-only GitHub fetcher gatherMerged uses inside Actions: closed PRs into `base`, newest-updated first. */
const ghPulls = (base, page) =>
  gh(`/repos/${process.env.GITHUB_REPOSITORY}/pulls?state=closed&base=${encodeURIComponent(base)}&sort=updated&direction=desc&per_page=100&page=${page}`);

function event() {
  const p = process.env.GITHUB_EVENT_PATH;
  if (!p) { console.error("history-append: no GITHUB_EVENT_PATH — this mode runs inside GitHub Actions."); process.exit(2); }
  return JSON.parse(readFileSync(p, "utf8")).pull_request;
}

async function selfTest() {
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
  // Month boundary (26.1010): a late entry already opened November at the top; an on-time PR merged at
  // 23:30 on Oct 31 (Boise, 05:30Z Nov 1) asks for October. It must sit at the top under November.
  const nov = "# H\n\n## November 2026\n\n**praxis #55: b** · [PR #55](u55) · merged 26.0919.1740 · recorded late 26.1101.0010 · v1.3.1\n- Fixed: b.\n\n## October 2026\n\n**praxis #56: c** · [PR #56](u56) · merged 26.0919.1741 · v1.3.0\n- Fixed: c.\n";
  const e57 = "**praxis #57: d** · [PR #57](u57) · merged 26.1031.2330 · v1.3.2\n- Fixed: d.";
  const d3 = insertEntry(nov, e57, "2026-11-01T05:30:00Z");
  ok(d3 === nov.replace("## November 2026\n\n", `## November 2026\n\n${e57}\n\n`) && (d3.match(/^## October 2026$/gm) || []).length === 1 && d3.indexOf("## November 2026") < d3.indexOf("## October 2026"), "insert: an entry from a month OLDER than the top heading sits first under the top heading — never a second, older heading above it");
  // catch-up (adopted 26.1009, ruling M-265) — the praxis #54/#55/#56 case, offline
  const P = (n, mergedAt, base = "main") => ({ number: n, title: `pr ${n}`, html_url: `https://github.com/o/praxis/pull/${n}`, merged_at: mergedAt, base: { ref: base }, head: { ref: `b${n}` }, user: { login: "t" }, body: `<!-- history -->\n**thing ${n}**\n- Fixed: ${n}.\n<!-- /history -->` });
  const cdoc = "# H\n\n## October 2026\n\n**praxis #56: c** · [PR #56](https://github.com/o/praxis/pull/56) · merged 26.0919.1741 · v1.3.0\n- Fixed: c.\n\n**praxis #54: a** · [PR #54](https://github.com/o/praxis/pull/54) · merged 26.0919.1740 · v1.2.0\n- New: a.\n\n## September 2026\n\n**backfilled** · [PR #9](https://github.com/o/praxis/pull/9) · merged 26.0901.1000 · v1.1.0\n- New: old.\n";
  ok(recorded(cdoc, 54) && recorded(cdoc, 9) && !recorded(cdoc, 55) && !recorded(cdoc, 5), "catch-up: a PR is recorded by its [PR #n](…/pull/n) link, backfill entries included");
  ok(catchUpFloor(cdoc, "praxis") === "26.0919.1740" && catchUpFloor("# H\n\n**backfilled** · [PR #9](u) · merged 26.0901.1000\n", "praxis") === null, "catch-up: the floor is the oldest bot-written header; none → null");
  const lost = [P(56, "2026-09-19T23:41:35Z"), P(55, "2026-09-19T23:40:32Z"), P(54, "2026-09-19T23:40:00Z"), P(8, "2026-09-01T10:00:00Z"), P(70, "2026-10-09T05:00:00Z", "dev")];
  ok(toFile(cdoc, [...lost, P(57, "2026-10-09T05:00:00Z")], { base: "main", floor: "26.0919.1740", mustInclude: 57 }).map((p) => p.number).join(",") === "55,57", "catch-up: files the lost #55 then the event's #57 — oldest first, never below the floor, never another base");
  ok(toFile(cdoc, [P(57, "2026-10-09T05:00:00Z"), P(55, "2026-09-19T23:40:32Z")], { base: "main", floor: null, mustInclude: 57 }).map((p) => p.number).join(",") === "57", "catch-up: no floor yet (fresh install) → only the event's own PR");
  ok(toFile(cdoc, [P(56, "2026-09-19T23:41:35Z")], { base: "main", floor: "26.0919.1740", mustInclude: 56 }).length === 0, "catch-up: the event's PR already recorded (a race lost) → nothing to do");
  ok(lateStamp("2026-09-19T23:40:32Z", "2026-10-09T14:12:00Z") === "26.1009.0812" && lateStamp("2026-09-19T23:40:32Z", "2026-09-19T23:50:00Z") === null, "late: over an hour after merging → late, stamped with the Boise filing time; a queued run minutes behind is on time");
  const lateEntry = markLate("**praxis #55: b** · [PR #55](u) · merged 26.0919.1740\n- Fixed: b.", "26.1009.0812");
  ok(lateEntry.startsWith("**praxis #55: b** · [PR #55](u) · merged 26.0919.1740 · recorded late 26.1009.0812\n") && versionIn(stampHeader(lateEntry, "1.3.1")) === "1.3.1", "late: the header says when it was recorded, and still carries its version at the end");
  const TAGS_HEAD = /^\*\*(.+?)\*\* · (.*) · (?:merged|backed up) (\d\d\.\d{4}\.\d{4})(?: ·[^·]*)? · v(\d+\.\d+\.\d+)\s*$/;
  ok(TAGS_HEAD.test(stampHeader(lateEntry, "1.3.1").split("\n")[0]), "late: the header still matches tags.py's pattern");
  // fileOne is async; checked synchronously through a promise below
  const pending = fileOne(cdoc, P(55, "2026-09-19T23:40:32Z"), "2026-10-09T14:12:00Z").then(({ doc: d, version }) => {
    ok(version === "1.3.1" && d.indexOf("[PR #55]") < d.indexOf("[PR #56]") && d.indexOf("[PR #55]") > d.indexOf("## October 2026") && (d.match(/## September 2026/g) || []).length === 1, "late: #55 lands at the TOP under the current month with the NEXT version; nothing published is renumbered");
  });
  await pending;
  {
    // One catch-up run across the month boundary (26.1010): late #55 filed at 00:10 Nov 1 (Boise) opens
    // November; then on-time #57, merged 23:30 Oct 31 (Boise), is filed in the same run.
    const now = "2026-11-01T06:10:00Z";
    const a = await fileOne(cdoc, P(55, "2026-09-19T23:40:32Z"), now);
    const b = await fileOne(a.doc, P(57, "2026-11-01T05:30:00Z"), now);
    const months = [...b.doc.matchAll(/^## (\w+) (\d{4})$/gm)].map((m) => `${m[1]} ${m[2]}`);
    ok(a.version === "1.3.1" && b.version === "1.3.2" && b.doc.indexOf("[PR #57]") < b.doc.indexOf("[PR #55]") && b.doc.indexOf("[PR #55]") < b.doc.indexOf("[PR #56]") && /· recorded late 26\.1101\.0010 · v1\.3\.1/.test(b.doc) && !/\[PR #57\][^\n]*recorded late/.test(b.doc), "boundary run: late #55 then on-time #57 → versions in filing order, newest on top, only #55 marked late");
    ok(months.join(" | ") === "November 2026 | October 2026 | September 2026", `boundary run: every month heading once, newest first (got: ${months.join(" | ")})`);
  }
  // catch-up paging + degrade (26.1010, ruling M-265): page the merged-PR list back to the floor,
  // and a failing API call skips catch-up instead of failing the run's own PR.
  const U = (n, updatedAt, merged = true) => ({ ...P(n, merged ? "2026-10-01T18:00:00Z" : null), updated_at: updatedAt });
  const fullPage = (oldest) => [...Array.from({ length: 99 }, (_, i) => U(1000 + i, "2026-10-09T18:00:00Z")), U(999, oldest)];
  ok(morePages(fullPage("2026-09-20T18:00:00Z"), "26.0919.1740") === true, "paging: a full page whose oldest update is still after the floor → fetch the next page");
  ok(morePages(fullPage("2026-09-01T18:00:00Z"), "26.0919.1740") === false, "paging: a full page that reaches back past the floor → stop");
  ok(morePages([U(1, "2026-09-20T18:00:00Z")], "26.0919.1740") === false, "paging: a short page is the last page → stop");
  {
    let warned = 0;
    const thrown = await gatherMerged(async () => { throw new Error("HTTP 403"); }, "main", "26.0919.1740", () => warned++).catch(() => "threw");
    ok(Array.isArray(thrown) && thrown.length === 0 && warned === 1, "degrade: a failing API call → an empty list and one warning, never a throw (the run's own PR still gets filed)");
    let calls = 0;
    const pages = [
      Array.from({ length: 100 }, (_, i) => U(500 + i, "2026-10-05T18:00:00Z", i % 2 === 0)),
      [...Array.from({ length: 99 }, (_, i) => U(400 + i, "2026-09-25T18:00:00Z")), U(399, "2026-09-10T18:00:00Z")],
      Array.from({ length: 100 }, (_, i) => U(300 + i, "2026-09-01T18:00:00Z")),
    ];
    const got = await gatherMerged(async (base, page) => { calls++; return pages[page - 1]; }, "main", "26.0919.1740", () => {});
    ok(calls === 2 && got.length === 150 && got.every((p) => p.merged_at), "paging: stops after the first page that crosses the floor (2 calls), and keeps only merged PRs");
    let nullCalls = 0;
    const fresh = await gatherMerged(async () => { nullCalls++; return []; }, "main", null, () => {});
    ok(nullCalls === 0 && Array.isArray(fresh) && fresh.length === 0, "paging: no floor (a fresh install) → no API call at all");
    // Four full pages all updated after the floor, then the page that crosses it, then one more that
    // must never be read. Pins the loop itself (not just morePages): any fixed cap below 5 stops early.
    let deepCalls = 0;
    const deep = [
      ...[0, 1, 2, 3].map((k) => Array.from({ length: 100 }, (_, i) => U(2000 + k * 100 + i, "2026-10-0" + (8 - k) + "T18:00:00Z", i % 4 !== 0))),
      [...Array.from({ length: 99 }, (_, i) => U(2400 + i, "2026-09-25T18:00:00Z")), U(2499, "2026-09-10T18:00:00Z")],
      Array.from({ length: 100 }, (_, i) => U(2500 + i, "2026-09-01T18:00:00Z")),
    ];
    const deepGot = await gatherMerged(async (base, page) => { deepCalls++; return deep[page - 1]; }, "main", "26.0919.1740", () => {});
    ok(deepCalls === 5 && deepGot.length === 4 * 75 + 100 && new Set(deepGot.map((p) => p.number)).size === 400, "paging: 4 full pages after the floor, then the one that crosses it → exactly 5 calls, every merged PR from all 5 kept");
  }
  {
    // The per-job cache (mergedList): a failed fetch is never cached, a good one is, a cached one costs no call.
    const dir = mkdtempSync(join(tmpdir(), "history-append-selftest-"));
    try {
      const cache = join(dir, "history-merged-prs.json");
      let errs = 0, calls = 0;
      const bad = await mergedList(cache, async () => { calls++; throw new Error("HTTP 401"); }, "main", "26.0919.1740", () => errs++).catch(() => "threw");
      ok(Array.isArray(bad) && bad.length === 0 && errs === 1 && !existsSync(cache), "cache: a failed fetch → empty list, one warning, and NO cache file (a retry can fetch again)");
      const good = await mergedList(cache, async () => { calls++; return [U(1, "2026-10-01T18:00:00Z"), U(2, "2026-10-01T18:00:00Z", false)]; }, "main", "26.0919.1740", () => errs++);
      ok(good.length === 1 && existsSync(cache) && JSON.parse(readFileSync(cache, "utf8")).length === 1, "cache: a good fetch is written to the cache file");
      const before = calls;
      const again = await mergedList(cache, async () => { calls++; return []; }, "main", "26.0919.1740", () => errs++);
      ok(calls === before && again.length === 1 && again[0].number === 1, "cache: a cached list is reused with no API call");
      rmSync(cache);
      const noFloor = await mergedList(cache, async () => { calls++; return []; }, "main", null, () => errs++);
      ok(calls === before && noFloor.length === 0 && !existsSync(cache), "cache: no floor → no call and no cache file");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }
  {
    // 26.1010 (Auditor2 F2): in a release repo (www), a MISSED release PR whose feature lookup fails
    // is skipped this run with one warning, and the run's own PR is still filed; a later run files the
    // skipped one late. A failed lookup for the run's OWN release PR still fails the run (a re-run heals).
    const nowIso = "2026-10-10T19:00:00Z";
    const wdoc = "# www\n\n## October 2026\n\n**www #150: a** · [PR #150](https://github.com/travis-horton/www/pull/150) · merged 26.1001.1000 · v3.30.0\n- New: a.\n";
    const W = (n, minsAgo, head, login = "t") => ({ number: n, title: `pr ${n}`, html_url: `https://github.com/travis-horton/www/pull/${n}`, merged_at: new Date(Date.parse(nowIso) - minsAgo * 60000).toISOString(), base: { ref: "main" }, head: { ref: head }, user: { login }, body: "" });
    const rel151 = W(151, 180, "dev");
    const own152 = W(152, 3, "dependabot/x", "dependabot[bot]");
    const feat140 = { number: 140, title: "feat 140", html_url: "https://github.com/travis-horton/www/pull/140", merged_at: "2026-10-09T18:00:00Z", base: { ref: "dev" }, user: { login: "t" }, body: "<!-- history -->\n**a new page**\n- New: a page.\n<!-- /history -->" };
    const boom = async (p) => { throw new Error(`GitHub API /repos/travis-horton/www/pulls/${p.number}/commits: HTTP 503`); };
    // (a) catch-up release PR's lookup throws → skipped with one warning; own #152 filed
    const skipsA = []; let lookupsA = 0;
    const a = await fileNext(wdoc, [rel151, own152], { own: 152, nowIso, from: "dev", features: (p) => { lookupsA++; return boom(p); }, onSkip: (p) => skipsA.push(p.number) }).catch((e) => `threw: ${e.message}`);
    ok(a?.pr?.number === 152 && a.version === "3.30.1" && recorded(a.doc, 152) && !recorded(a.doc, 151) && skipsA.join(",") === "151" && lookupsA === 1, `release lookup: a missed release PR whose lookup fails is skipped with one warning, and the run's own PR is still filed (got: ${typeof a === "string" ? a : a?.pr?.number})`);
    // (b) the run's OWN PR is a release and its lookup throws → reject (the run fails visibly, as before)
    const skipsB = [];
    const b = await fileNext(wdoc, [W(153, 3, "dev")], { own: 153, nowIso, from: "dev", features: boom, onSkip: (p) => skipsB.push(p.number) }).then(() => "resolved", (e) => `threw: ${e.message}`);
    ok(b.startsWith("threw: GitHub API") && skipsB.length === 0, `release lookup: a failure on the run's OWN release PR still fails the run — no catch around it (got: ${b})`);
    // (c) manual run (no own PR), only the failing catch-up PR queued → null (the CLI prints NOTHING)
    const skipsC = [];
    const c = await fileNext(wdoc, [rel151], { own: null, nowIso, from: "dev", features: boom, onSkip: (p) => skipsC.push(p.number) }).catch((e) => `threw: ${e.message}`);
    ok(c === null && skipsC.join(",") === "151", `release lookup: a manual run whose only missing PR is a failing release → null (NOTHING), one warning (got: ${c})`);
    // (d) heal: next run the lookup works → #151 filed late, with a version ABOVE #152's, on top
    if (a && typeof a === "object") {
      const healIso = "2026-10-10T20:00:00Z";
      const d = await fileNext(a.doc, [rel151], { own: null, nowIso: healIso, from: "dev", features: async () => [feat140], onSkip: () => {} });
      const versions = splitEntries(d?.doc ?? "").map(versionIn);
      ok(d?.pr?.number === 151 && d.version === "3.31.0" && versions.join(" ") === "3.31.0 3.30.1 3.30.0" && /\[PR #151\][^\n]*recorded late 26\.1010\.1400/.test(d.doc) && d.doc.includes("[a new page](https://github.com/travis-horton/www/pull/140)") && (d.doc.match(/^## October 2026$/gm) || []).length === 1, `release lookup: the skipped PR heals on a later run — filed late on top with the next version, versions still decrease top-down (got: ${versions.join(" ")})`);
    } else ok(false, "release lookup: heal row needs row (a)'s document");
    // (e) a catch-up release PR whose lookup SUCCEEDS is still filed first, fetched exactly once
    let lookupsE = 0;
    const e = await fileNext(wdoc, [rel151, own152], { own: 152, nowIso, from: "dev", features: async () => { lookupsE++; return [feat140]; }, onSkip: () => {} }).catch((err) => `threw: ${err.message}`);
    ok(e?.pr?.number === 151 && e.version === "3.31.0" && recorded(e.doc, 151) && !recorded(e.doc, 152) && lookupsE === 1 && /\[PR #151\][^\n]*recorded late/.test(e.doc), `release lookup: a missed release PR whose lookup works is filed first (oldest first), its features fetched once (got: ${typeof e === "string" ? e : `#${e?.pr?.number}, ${lookupsE} lookups`})`);
  }
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
} else if (mode === "--append-next") {
  // node scripts/history-append.mjs --append-next   (adopted 26.1009, ruling M-265)
  // Files the OLDEST merged PR the history is missing — the event's own PR, or one an earlier run
  // lost — and prints one machine line for the workflow's loop:
  //   RECORDED <pr> <version>   (call again: there may be more)
  //   NOTHING                   (the history is complete)
  // The merged-PR list is fetched once per job and cached in $RUNNER_TEMP, so a push retry
  // (reset to the remote, file again) costs no extra API calls. HISTORY_CATCHUP=off → own PR only.
  // 26.1010 (Auditor2 F2): a missed RELEASE PR whose feature lookup fails is skipped with a warning
  // and a later run files it; the run's own PR is still filed (a failure on the own PR fails the run).
  const pr = event() ?? null; // null on a manual "Run workflow" (workflow_dispatch): catch-up only
  const branch = process.env.DEFAULT_BRANCH || pr?.base?.ref || "main";
  const doc = existsSync(DOC)
    ? readFileSync(DOC, "utf8")
    : `# ${REPO_LABEL || "repo"} — what changed, in plain words\n\nNewest first. Entries before the first one here are still to be written (the backfill).\n`;
  let list = [];
  const floor = catchUpFloor(doc);
  if (process.env.HISTORY_CATCHUP !== "off") {
    list = await mergedList(`${process.env.RUNNER_TEMP || "/tmp"}/history-merged-prs.json`, ghPulls, branch, floor);
  }
  const queue = toFile(doc, pr ? [...list, pr] : list, { base: branch, floor, mustInclude: pr?.number ?? null });
  const done = await fileNext(doc, queue, { own: pr?.number ?? null, nowIso: new Date().toISOString() });
  if (!done) { console.log("NOTHING"); process.exit(0); }
  const { doc: out, version, pr: next } = done;
  writeFileSync(DOC, out);
  setPackageVersion(version);
  if (next.number !== pr?.number) console.error(`history: CATCH-UP — PR #${next.number} (merged ${boiseStamp(next.merged_at).stamp}) was not recorded yet; filed it (this run's own PR: ${pr ? `#${pr.number}` : "none — a manual run"}).`);
  console.log(`RECORDED ${next.number} ${version}`);
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
  console.error("usage: history-append.mjs --check | --append-next | --append | --self-test");
  process.exit(2);
}
