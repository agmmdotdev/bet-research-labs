#!/usr/bin/env node
"use strict";

const dns = require("dns").promises;

const DEFAULT_API_BASE = process.env.ONE_XBET_API_BASE || "https://1x-bet-mm.com/service-api/LineFeed";
const DEFAULT_TEMPLATE_BASE = process.env.ONE_XBET_TEMPLATE_BASE || "https://mm.1xbet.com/genfiles/cms/betstemplates";
const USER_AGENT = process.env.ONE_XBET_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

function readValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function readNumber(argv, index, flag) {
  const value = readValue(argv, index, flag);
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${flag} requires a finite number`);
  return number;
}

function parseArgs(argv) {
  const args = {
    apiBase: DEFAULT_API_BASE,
    templateBase: DEFAULT_TEMPLATE_BASE,
    query: "france sweden",
    lang: "en",
    nameType: "short",
    limit: 1,
    country: 127,
    partner: 1,
    cfview: 0,
    mode: 4,
    timeoutMs: 8000,
    retries: 0,
    strict: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--api-base") {
      args.apiBase = readValue(argv, i, arg).replace(/\/+$/, "");
      i += 1;
    } else if (arg === "--template-base") {
      args.templateBase = readValue(argv, i, arg).replace(/\/+$/, "");
      i += 1;
    } else if (arg === "--query") {
      args.query = readValue(argv, i, arg);
      i += 1;
    } else if (arg === "--lang") {
      args.lang = readValue(argv, i, arg);
      i += 1;
    } else if (arg === "--name-type") {
      args.nameType = readValue(argv, i, arg);
      i += 1;
    } else if (arg === "--limit") {
      args.limit = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--country") {
      args.country = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--partner") {
      args.partner = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--cfview") {
      args.cfview = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--mode") {
      args.mode = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--timeout-ms") {
      args.timeoutMs = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--retries") {
      args.retries = readNumber(argv, i, arg);
      i += 1;
    } else if (arg === "--strict") {
      args.strict = true;
    } else if (arg === "--help") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!/^https?:\/\//i.test(args.apiBase)) throw new Error("--api-base must be an http(s) URL");
  if (!/^https?:\/\//i.test(args.templateBase)) throw new Error("--template-base must be an http(s) URL");
  if (!Number.isInteger(args.limit) || args.limit <= 0) throw new Error("--limit must be a positive integer");
  if (!Number.isInteger(args.retries) || args.retries < 0) throw new Error("--retries must be a non-negative integer");
  if (!Number.isInteger(args.timeoutMs) || args.timeoutMs <= 0) throw new Error("--timeout-ms must be a positive integer");

  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/check-1xbet-live.cjs --query "france sweden"

Options:
  --api-base       Override 1xBet LineFeed API base
  --template-base  Override 1xBet template base
  --query          Search text, default "france sweden"
  --country        1xBet country id, default 127
  --partner        1xBet partner id, default 1
  --cfview         Odds view id, default 0
  --mode           Search mode, default 4
  --timeout-ms     Fetch timeout, default 8000
  --retries        Retry count, default 0

Environment:
  ONE_XBET_API_BASE
  ONE_XBET_TEMPLATE_BASE
  ONE_XBET_USER_AGENT
`);
}

function makeUrl(base, params) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, args) {
  let lastError;
  for (let attempt = 0; attempt <= args.retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), args.timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          accept: "application/json, text/plain, */*",
          "user-agent": USER_AGENT,
          referer: "https://1xbet.com/",
        },
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < args.retries) await delay(500 * Math.pow(2, attempt));
    }
  }
  throw lastError;
}

async function main() {
  const args = parseArgs(process.argv);
  const apiHost = new URL(args.apiBase).hostname;
  const templateHost = new URL(args.templateBase).hostname;
  const hosts = [...new Set([apiHost, templateHost])];

  const templateUrl = `${args.templateBase}/bets_model_map_${args.nameType}_${args.lang}.json`;
  const searchUrl = makeUrl(`${args.apiBase}/Web_SearchZip`, {
    text: args.query,
    limit: args.limit,
    lng: args.lang,
    country: args.country,
    mode: args.mode,
    partner: args.partner,
    userId: 0,
    cfview: args.cfview,
    cyberFlag: 0,
    strict: args.strict,
  });

  const report = {
    ok: true,
    node: process.version,
    api_base: args.apiBase,
    template_base: args.templateBase,
    query: args.query,
    dns: [],
    endpoint_checks: [],
    next_steps: [],
  };

  for (const host of hosts) {
    try {
      const records = await dns.lookup(host, { all: true });
      report.dns.push({ host, ok: true, records });
    } catch (error) {
      report.ok = false;
      report.dns.push({ host, ok: false, error: error.message });
    }
  }

  for (const check of [
    { name: "template_map", url: templateUrl },
    { name: "search", url: searchUrl },
  ]) {
    try {
      const payload = await fetchJson(check.url, args);
      report.endpoint_checks.push({
        name: check.name,
        ok: true,
        sample_keys: Object.keys(payload).slice(0, 10),
        success_field: payload.Success ?? null,
        value_count: Array.isArray(payload.Value) ? payload.Value.length : null,
      });
    } catch (error) {
      report.ok = false;
      report.endpoint_checks.push({ name: check.name, ok: false, error: error.message });
    }
  }

  if (report.dns.some((item) => !item.ok)) {
    report.next_steps.push("DNS failed. Try a different DNS resolver/network, or pass a legally accessible regional mirror with --api-base / --template-base.");
  }
  if (report.endpoint_checks.some((item) => !item.ok)) {
    report.next_steps.push("HTTP fetch failed. Check geo restrictions, TLS/proxy interception, endpoint drift, or whether the mirror needs different country/partner parameters.");
  }
  if (report.ok) {
    report.next_steps.push("Live API reachable. Run humanize script with --search and then --select, and enable template caching after the first successful run.");
  }

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
