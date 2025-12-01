import { useState, useCallback, useEffect } from 'react';
import { GAME_DATA, getShuffledWords } from './data/gameData';
import './App.css';

const MAX_LIVES = 5;
const MAX_SELECTED = 4;

function App() {
  const [words, setWords] = useState(() => getShuffledWords());
  const [selected, setSelected] = useState(new Set());
  const [foundGroups, setFoundGroups] = useState([]);
  const [lives, setLives] = useState(MAX_LIVES);
  const [toast, setToast] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [guessedCombinations, setGuessedCombinations] = useState(new Set());

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Helper to create a consistent key for a set of words
  const getGuessKey = (wordsSet) => {
    return Array.from(wordsSet).sort().join(',');
  };

  // Check if current selection has already been guessed
  const isAlreadyGuessed = selected.size === MAX_SELECTED && 
    guessedCombinations.has(getGuessKey(selected));

  const remainingWords = words.filter(
    w => !foundGroups.some(g => g.words.includes(w.word))
  );

  const toggleSelect = useCallback((word) => {
    if (gameOver) return;
    
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else if (newSet.size < MAX_SELECTED) {
        newSet.add(word);
      }
      return newSet;
    });
  }, [gameOver]);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const submitGuess = useCallback(() => {
    if (selected.size !== MAX_SELECTED) return;

    const selectedWords = Array.from(selected);
    const guessKey = getGuessKey(selected);
    
    // Record this guess
    setGuessedCombinations(prev => new Set([...prev, guessKey]));
    
    // Check which group(s) the selected words belong to
    const groupCounts = {};
    selectedWords.forEach(word => {
      const wordData = words.find(w => w.word === word);
      if (wordData) {
        groupCounts[wordData.groupIndex] = (groupCounts[wordData.groupIndex] || 0) + 1;
      }
    });

    // Find if any group has all 4 selected
    const correctGroupIndex = Object.entries(groupCounts).find(
      ([, count]) => count === 4
    )?.[0];

    if (correctGroupIndex !== undefined) {
      // Correct guess!
      const group = GAME_DATA.groups[parseInt(correctGroupIndex)];
      setFoundGroups(prev => [...prev, group]);
      setSelected(new Set());

      // Check for win
      if (foundGroups.length === 3) {
        setWon(true);
        setGameOver(true);
      }
    } else {
      // Incorrect guess
      const maxCount = Math.max(...Object.values(groupCounts));
      
      if (maxCount === 3) {
        setToast('One away...');
      }

      const newLives = lives - 1;
      setLives(newLives);

      if (newLives === 0) {
        setGameOver(true);
        // Reveal all remaining groups
        const remaining = GAME_DATA.groups.filter(
          g => !foundGroups.some(fg => fg.category === g.category)
        );
        setFoundGroups(prev => [...prev, ...remaining]);
      }
    }
  }, [selected, words, foundGroups, lives]);

  const resetGame = useCallback(() => {
    setWords(getShuffledWords());
    setSelected(new Set());
    setFoundGroups([]);
    setLives(MAX_LIVES);
    setToast('');
    setGameOver(false);
    setWon(false);
    setGuessedCombinations(new Set());
  }, []);

  return (
    <div className="app">
      <h1>Connections</h1>
      <p className="subtitle">Create four groups of four!</p>

      {/* Toast Popup */}
      {toast && (
        <div className="toast-overlay">
          <div className="toast">{toast}</div>
        </div>
      )}

      {/* Found Groups */}
      <div className="found-groups">
        {foundGroups.map((group, index) => (
          <div
            key={index}
            className="found-group"
            style={{ backgroundColor: group.color }}
          >
            <div className="group-category">{group.category}</div>
            <div className="group-words">{group.words.join(', ')}</div>
          </div>
        ))}
      </div>

      {/* Word Grid */}
      {!gameOver && (
        <div className="word-grid">
          {remainingWords.map((wordData, index) => (
            <button
              key={index}
              className={`word-tile ${selected.has(wordData.word) ? 'selected' : ''}`}
              onClick={() => toggleSelect(wordData.word)}
            >
              {wordData.word}
            </button>
          ))}
        </div>
      )}

      {/* Lives */}
      <div className="lives">
        <span>Mistakes remaining: </span>
        {Array.from({ length: MAX_LIVES }).map((_, i) => (
          <span
            key={i}
            className={`life-dot ${i < lives ? 'active' : 'used'}`}
          />
        ))}
      </div>

      {/* Controls */}
      {!gameOver && (
        <div className="controls">
          <button
            className="control-btn"
            onClick={deselectAll}
            disabled={selected.size === 0}
          >
            Deselect All
          </button>
          <button
            className="control-btn submit-btn"
            onClick={submitGuess}
            disabled={selected.size !== MAX_SELECTED || isAlreadyGuessed}
          >
            Submit
          </button>
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="game-over">
          <h2>{won ? 'Congratulations!' : 'Game Over'}</h2>
          <p>{won ? 'You found all the connections!' : 'Better luck next time!'}</p>
          <button className="control-btn" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
