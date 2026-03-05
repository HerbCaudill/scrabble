/**
 * Build a set of all prefixes of all words in the given word set.
 * A prefix is any leading substring of length >= 1.
 * Used for efficient prefix checking during move generation.
 */
export const buildPrefixSet = (
  /** The set of valid words (uppercase) */
  words: Set<string>,
): Set<string> => {
  const prefixes = new Set<string>()
  for (const word of words) {
    for (let i = 1; i <= word.length; i++) {
      prefixes.add(word.substring(0, i))
    }
  }
  return prefixes
}
