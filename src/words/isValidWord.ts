import { validWords } from "./validWords"

/** Check if a word is valid according to the CSW21 Scrabble dictionary (case-insensitive). */
export const isValidWord = (
  /** The word to check */
  word: string,
): boolean => {
  return validWords.has(word.toUpperCase())
}
