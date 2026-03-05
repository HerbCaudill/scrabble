import { wordMap } from "./validWords"

/**
 * Return the definition of a word from the CSW21 dictionary, or undefined if the word is not found
 * or has no definition.
 */
export const getWordDefinition = (
  /** The word to look up (case-insensitive) */
  word: string,
): string | undefined => {
  const entry = wordMap.get(word.toUpperCase())
  if (!entry || entry.definitions.length === 0) return undefined
  return entry.definitions.map(d => d.text).join("; ")
}
