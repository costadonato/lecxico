/**
 * Fisher-Yates shuffle algorithm for randomizing arrays
 * Ensures true randomness without bias
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Shuffle options for games with correct/incorrect answers
 * @param correct The correct answer
 * @param incorrect Array of incorrect answers
 * @returns Shuffled array of objects with text and isCorrect properties
 */
export function shuffleOptions(correct: string, incorrect: string[]): Array<{ text: string; isCorrect: boolean }> {
  const options = [{ text: correct, isCorrect: true }, ...incorrect.map((ans) => ({ text: ans, isCorrect: false }))]
  return shuffle(options)
}

/**
 * Shuffle options with additional data
 * @param correct The correct answer with data
 * @param incorrect Array of incorrect answers with data
 * @returns Shuffled array
 */
export function shuffleOptionsWithData<T>(
  correct: T & { isCorrect?: boolean },
  incorrect: (T & { isCorrect?: boolean })[],
): (T & { isCorrect: boolean })[] {
  const options = [{ ...correct, isCorrect: true }, ...incorrect.map((item) => ({ ...item, isCorrect: false }))]
  return shuffle(options)
}
