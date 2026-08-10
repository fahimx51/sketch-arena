export interface HintState {
    revealedIndexes: number[];
}

/**
 * Generates a hint string where unrevealed letters are replaced by underscores.
 * Spaces remain as spaces.
 */
export const getMaskedWord = (word: string, revealedIndexes: number[]): string => {
    return word
        .split("")
        .map((char, index) => {
            if (char === " ") return " ";
            if (revealedIndexes.includes(index)) return char;
            return "_";
        })
        .join(" ");
};

/**
 * Returns index to reveal based on remaining time and word length
 */
export const getNextHintIndex = (
    word: string,
    revealedIndexes: number[],
    remainingTime: number
): number | null => {
    const cleanWord = word.trim();
    const len = cleanWord.length;

    // Words shorter than 3 letters get no hints
    if (len <= 3) return null;

    const unrevealed = Array.from({ length: len }, (_, i) => i).filter(
        (i) => !revealedIndexes.includes(i) && cleanWord[i] !== " "
    );

    if (unrevealed.length === 0) return null;

    // Hint 1: At 45s -> Reveal 1st letter (if >= 4 letters)
    if (remainingTime === 45 && !revealedIndexes.includes(0)) {
        return 0;
    }

    // Hint 2: At 30s -> Reveal last letter
    if (remainingTime === 30 && !revealedIndexes.includes(len - 1)) {
        return len - 1;
    }

    // Hint 3: At 15s -> Reveal a random middle letter (if word length >= 5)
    if (remainingTime === 15 && len >= 5) {
        return unrevealed[Math.floor(Math.random() * unrevealed.length)];
    }

    return null;
};