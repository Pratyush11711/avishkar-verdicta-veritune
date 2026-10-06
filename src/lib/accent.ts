export interface AccentPart {
  text: string;
  accent: boolean;
}

/** Splits `Quality from {{every call}} your agents take` into plain and accent parts. */
export function splitAccent(input: string): AccentPart[] {
  return input
    .split(/(\{\{.+?\}\})/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('{{') ? { text: part.slice(2, -2), accent: true } : { text: part, accent: false },
    );
}

export const stripAccent = (input: string): string => input.replace(/\{\{(.+?)\}\}/g, '$1');
