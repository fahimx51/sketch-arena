const WORD_LIST = [
    "Apple", "Banana", "Cat", "Dog", "Elephant", "Fire", "Guitar",
    "House", "Ice Cream", "Jungle", "Kite", "Lemon", "Moon", "Ninja",
    "Ocean", "Pizza", "Queen", "Robot", "Sun", "Tree", "Umbrella",
    "Vampire", "Windmill", "Xylophone", "Yacht", "Zebra"
];

export const getRandomWords = (count: number = 5): string[] => {
    const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};