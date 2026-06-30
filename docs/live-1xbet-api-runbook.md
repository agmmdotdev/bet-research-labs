# Live 1xBet API Troubleshooting Runbook

This runbook explains how to make the live 1xBet odds fetch work when the parser logic is already correct but the network/API layer fails.

## Current known failure

In the current execution environment, live DNS resolution failed for:

```text
1x-bet-mm.com
mm.1xbet.com
```

Observed errors:

```text
getaddrinfo EAI_AGAIN 1x-bet-mm.com
getaddrinfo EAI_AGAIN mm.1xbet.com
TypeError: fetch failed
```

This means the container cannot reach the live hosts. It does not prove the endpoints are wrong.

## Diagnostic script

Run:

```bash
npm run check:1xbet
```

Or directly:

```bash
node scripts/check-1xbet-live.cjs --query "france sweden"
```

The script checks:

1. Node version.
2. DNS resolution for the API host.
3. DNS resolution for the template host.
4. Template map endpoint reachability.
5. Search endpoint reachability.

It returns JSON so the result can be pasted back into ChatGPT or stored in the repo.

## If DNS fails

Example failure:

```json
{
  "host": "1x-bet-mm.com",
  "ok": false,
  "error": "getaddrinfo EAI_AGAIN 1x-bet-mm.com"
}
```

Try:

```bash
nslookup 1x-bet-mm.com
nslookup mm.1xbet.com
```

Then try a different resolver/network:

```bash
# Linux example using Cloudflare DNS temporarily for lookup
nslookup 1x-bet-mm.com 1.1.1.1
nslookup mm.1xbet.com 1.1.1.1

# Google DNS
nslookup 1x-bet-mm.com 8.8.8.8
nslookup mm.1xbet.com 8.8.8.8
```

If the domains resolve locally but not in a server/container, the issue is the server/container DNS or network policy.

## If API host changes

The diagnostic script supports configurable bases:

```bash
node scripts/check-1xbet-live.cjs \
  --api-base "https://YOUR-LEGAL-REGIONAL-MIRROR/service-api/LineFeed" \
  --template-base "https://YOUR-TEMPLATE-HOST/genfiles/cms/betstemplates" \
  --query "france sweden"
```

Environment variables also work:

```bash
export ONE_XBET_API_BASE="https://YOUR-LEGAL-REGIONAL-MIRROR/service-api/LineFeed"
export ONE_XBET_TEMPLATE_BASE="https://YOUR-TEMPLATE-HOST/genfiles/cms/betstemplates"
npm run check:1xbet
```

Use only hosts that are legal and accessible from your jurisdiction/account context.

## If template host fails but GetGameZip works

Template failures stop human-readable names from resolving. Add template caching after the first successful run.

Recommended future humanizer flags:

```bash
--cache-templates --template-cache-dir outputs/template-cache
```

Then saved raw odds can be converted later using cached templates.

If live templates are temporarily down, the parser should support:

```bash
--allow-template-failure
```

This produces `id_fallback` rows instead of failing completely.

## If search works but selected game fetch fails

Try direct game ID:

```bash
node outputs/humanize-1xbet-odds.js --game-id 732163048 --out-dir outputs
```

Also test parameter changes:

```bash
--country 127
--partner 1
--cfview 0
--mode 4
```

If those fail, compare the query URL printed in the script output with the browser/network request from a working 1xBet page.

## If script runs inside this repo

Because `package.json` uses:

```json
"type": "module"
```

CommonJS scripts that use `require()` should use the `.cjs` extension. That is why the diagnostic script is:

```text
scripts/check-1xbet-live.cjs
```

If the humanizer script remains CommonJS, prefer:

```text
scripts/humanize-1xbet-odds.cjs
```

or remove/avoid the package-level `type: module` setting.

## Live workflow

1. Run the diagnostic:

```bash
npm run check:1xbet
```

2. If DNS/API works, run search:

```bash
node outputs/humanize-1xbet-odds.js --search "france sweden" --limit 5 --out-dir outputs
```

3. Select the correct match:

```bash
node outputs/humanize-1xbet-odds.js --search "france sweden" --select 1 --out-dir outputs
```

4. Save and reuse raw odds:

```bash
node outputs/humanize-1xbet-odds.js --input outputs/france-sweden-732163048-raw.json --out-dir outputs
```

5. Paste the generated CSV or JSON into the value calculator workflow.

## Key principle

The parser is confirmed with mocked end-to-end tests. The remaining live issue is network/API reachability. Fix DNS/endpoint access first; then the parser can fetch and humanize real odds.
