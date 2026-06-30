# 1xBet Humanizer Script Review

Date: 2026-06-30

## Review scope

The pasted script fragment starts a Node.js CLI script intended to load 1xBet bet-template metadata from:

```text
https://mm.1xbet.com/genfiles/cms/betstemplates
```

and use the template chunks to humanize raw `GetGameZip` odds data.

The pasted version ends inside `loadTemplates()` at:

```js
Object.assign(templates, chunkBody);
```

Therefore, the visible script is incomplete and cannot be confirmed end-to-end.

## Local checks performed

### Syntax check

Command:

```bash
node --check humanize-1xbet-odds.partial.js
```

Result:

```text
SyntaxError: Unexpected end of input
```

Reason: the pasted code is truncated before closing the loop, function, and program body.

### Endpoint check

Attempted to fetch:

```text
https://mm.1xbet.com/genfiles/cms/betstemplates/bets_model_map_short_en.json
https://mm.1xbet.com/genfiles/cms/betstemplates/bets_model_short_en_0.json
```

Result from this environment:

```text
Could not resolve host: mm.1xbet.com
```

This does not prove the endpoint is invalid. It only means the current execution environment could not resolve that host.

### Unit-level logic check

The visible `parseArgs()` and `findChunkId()` logic is directionally correct, but `parseArgs()` does not validate missing flag values.

Example problem:

```bash
node humanize-1xbet-odds.js --input
```

Current behavior would set:

```js
args.input = undefined
```

A production CLI should throw a clear error instead.

## Visible logic assessment

### Good parts

- Uses a CLI argument parser with sane defaults.
- Supports `short` and `full` template names.
- Uses the 1xBet template-map file to determine which template chunks are needed.
- Loads only required chunks rather than blindly downloading every template file.
- Uses a browser-like user agent.
- `findChunkId()` correctly defaults low group IDs to chunk `0`.

### Issues / risks

| Issue | Severity | Recommendation |
|---|---|---|
| Pasted script is incomplete | High | Provide the full file before end-to-end confirmation. |
| Missing CLI value validation | Medium | Reject `--input`, `--out-dir`, `--lang`, or `--name-type` if no value follows. |
| Requires global `fetch` | Medium | Require Node.js 18+ or use `undici` / `node-fetch`. |
| Endpoint could not be resolved in current environment | Medium | Test on local machine/VPS where `mm.1xbet.com` resolves. |
| `findChunkId()` silently falls back to `0` for invalid group IDs | Low-medium | Skip invalid IDs or warn. |
| Template shape is assumed | Medium | Validate chunk body before merging. |
| Raw `GetGameZip` structure not included | High | Cannot verify market-name mapping without sample raw JSON. |

## Recommended patch for argument validation

```js
function readValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}
```

Usage:

```js
if (arg === "--input") {
  args.input = readValue(argv, i, arg);
  i += 1;
}
```

## Expected completion for `loadTemplates()`

The visible function likely needs to end like this:

```js
    Object.assign(templates, chunkBody);
  }

  return templates;
}
```

## Confirmation status

Current status: **not fully confirmed**.

Confirmed:

- The visible design is reasonable.
- `parseArgs()` and `findChunkId()` work for normal cases.
- The pasted version is syntactically incomplete.
- The current environment cannot resolve the 1xBet template host.

Not confirmed:

- End-to-end live template download.
- Raw `GetGameZip` parsing.
- Correct humanized market-name generation.
- CSV/JSON output correctness.

## Next required inputs

To fully test the script, provide:

1. the complete script file,
2. one raw `GetGameZip` JSON sample,
3. expected output format or a known-good output sample.
