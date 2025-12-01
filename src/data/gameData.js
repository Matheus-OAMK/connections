// Hardcoded game data - you can swap these out later
export const GAME_DATA = {
  groups: [
    {
      category: "PLANETS IN OUR SOLAR SYSTEM",
      words: ["MARS", "VENUS", "SATURN", "JUPITER"],
      color: "#f9df6d" // yellow - easiest
    },
    {
      category: "GREEK GODS",
      words: ["ZEUS", "APOLLO", "ATHENA", "POSEIDON"],
      color: "#a0c35a" // green
    },
    {
      category: "THINGS THAT ARE RED",
      words: ["CHERRY", "FIRE", "BLOOD", "RUBY"],
      color: "#b0c4ef" // blue
    },
    {
      category: "_____ KING",
      words: ["LION", "BURGER", "DRAG", "STEPHEN"],
      color: "#ba81c5" // purple - hardest
    }
  ]
};

// Utility to shuffle an array
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get all words from the game data, shuffled
export function getShuffledWords() {
  const allWords = GAME_DATA.groups.flatMap(group => 
    group.words.map(word => ({ word, groupIndex: GAME_DATA.groups.indexOf(group) }))
  );
  return shuffleArray(allWords);
}
