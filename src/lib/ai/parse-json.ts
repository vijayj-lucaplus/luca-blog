/**
 * Robust JSON extraction for LLM output. Models frequently emit JSON whose
 * string values contain RAW control characters (literal newlines/tabs inside
 * e.g. a Markdown body), which `JSON.parse` rejects. This escapes control
 * characters that occur inside string literals, then parses.
 */
function escapeControlCharsInStrings(json: string): string {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < json.length; i += 1) {
    const ch = json[i];
    const code = json.charCodeAt(i);

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString && code < 0x20) {
      if (ch === '\n') result += '\\n';
      else if (ch === '\r') result += '\\r';
      else if (ch === '\t') result += '\\t';
      else result += `\\u${code.toString(16).padStart(4, '0')}`;
      continue;
    }
    result += ch;
  }

  return result;
}

/** Extracts and parses the first JSON object from raw model output. */
export function parseLenientJson(raw: string): unknown {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in model output');
  }

  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return JSON.parse(escapeControlCharsInStrings(slice));
  }
}
