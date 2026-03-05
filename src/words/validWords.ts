import csw21 from "@herbcaudill/scrabble-words/csw21"
import type { Word } from "@herbcaudill/scrabble-words"

/** All valid words as an uppercase Set for O(1) lookup. */
export const validWords = new Set<string>((csw21 as Word[]).map(w => w.word.toUpperCase()))

/** Map from uppercase word to its full entry for definition lookups. */
export const wordMap = new Map<string, Word>((csw21 as Word[]).map(w => [w.word.toUpperCase(), w]))
