import { useState, useCallback, useEffect } from "react";
import { GAME_DATA, getShuffledWords } from "./data/gameData";
import grinchImg from "./assets/grinch.png";
import pabloImg from "./assets/pablo-xmas-new.png";
import pabloDanceVideo from "./assets/pablo-dance.mp4";
import "./App.css";

const MAX_LIVES = 5;
const MAX_SELECTED = 4;
const SNOWFLAKE_COUNT = 100;

function App() {
  const [words, setWords] = useState(() => getShuffledWords());
  const [selected, setSelected] = useState(new Set());
  const [foundGroups, setFoundGroups] = useState([]);
  const [lives, setLives] = useState(MAX_LIVES);
  const [toast, setToast] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [guessedCombinations, setGuessedCombinations] = useState(new Set());
  const [isShaking, setIsShaking] = useState(false);
  const [showSnow, setShowSnow] = useState(false);
  const [snowflakes, setSnowflakes] = useState([]);

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Clear shake after 2 seconds
  useEffect(() => {
    if (isShaking) {
      const timer = setTimeout(() => setIsShaking(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isShaking]);

  // Generate and clear snowflakes
  useEffect(() => {
    if (showSnow) {
      // Generate random snowflakes
      const flakes = Array.from({ length: SNOWFLAKE_COUNT }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
        size: 10 + Math.random() * 20,
      }));
      setSnowflakes(flakes);

      const timer = setTimeout(() => {
        setShowSnow(false);
        setSnowflakes([]);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [showSnow]);

  // Helper to create a consistent key for a set of words
  const getGuessKey = (wordsSet) => {
    return Array.from(wordsSet).sort().join(",");
  };

  // Check if current selection has already been guessed
  const isAlreadyGuessed =
    selected.size === MAX_SELECTED &&
    guessedCombinations.has(getGuessKey(selected));

  const remainingWords = words.filter(
    (w) => !foundGroups.some((g) => g.words.includes(w.word)),
  );

  const toggleSelect = useCallback(
    (word) => {
      if (gameOver || isShaking) return;

      setSelected((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(word)) {
          newSet.delete(word);
        } else if (newSet.size < MAX_SELECTED) {
          newSet.add(word);
        }
        return newSet;
      });
    },
    [gameOver, isShaking],
  );

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  const submitGuess = useCallback(() => {
    if (selected.size !== MAX_SELECTED) return;

    const selectedWords = Array.from(selected);
    const guessKey = getGuessKey(selected);

    // Record this guess
    setGuessedCombinations((prev) => new Set([...prev, guessKey]));

    // Check which group(s) the selected words belong to
    const groupCounts = {};
    selectedWords.forEach((word) => {
      const wordData = words.find((w) => w.word === word);
      if (wordData) {
        groupCounts[wordData.groupIndex] =
          (groupCounts[wordData.groupIndex] || 0) + 1;
      }
    });

    // Find if any group has all 4 selected
    const correctGroupIndex = Object.entries(groupCounts).find(
      ([, count]) => count === 4,
    )?.[0];

    if (correctGroupIndex !== undefined) {
      // Correct guess!
      const group = GAME_DATA.groups[parseInt(correctGroupIndex)];
      setFoundGroups((prev) => [...prev, group]);
      setSelected(new Set());

      // Check for win (this is the 4th/last group)
      if (foundGroups.length === 3) {
        setWon(true);
        setGameOver(true);
      } else {
        // Only show snow animation for non-winning connections
        setShowSnow(true);
      }
    } else {
      // Incorrect guess
      const maxCount = Math.max(...Object.values(groupCounts));

      if (maxCount === 3) {
        setToast("One away...");
      }

      setIsShaking(true);
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives === 0) {
        setGameOver(true);
        // Reveal all remaining groups
        const remaining = GAME_DATA.groups.filter(
          (g) => !foundGroups.some((fg) => fg.category === g.category),
        );
        setFoundGroups((prev) => [...prev, ...remaining]);
      }
    }
  }, [selected, words, foundGroups, lives]);

  const resetGame = useCallback(() => {
    setWords(getShuffledWords());
    setSelected(new Set());
    setFoundGroups([]);
    setLives(MAX_LIVES);
    setToast("");
    setGameOver(false);
    setWon(false);
    setGuessedCombinations(new Set());
    setIsShaking(false);
    setShowSnow(false);
    setSnowflakes([]);
  }, []);

  return (
    <div className="app">
      <h1>Connections</h1>
      <p className="subtitle">Create four groups of four!</p>

      {/* Snow Effect */}
      {showSnow && (
        <div className="snow-container">
          {snowflakes.map((flake) => (
            <div
              key={flake.id}
              className="snowflake"
              style={{
                left: `${flake.left}%`,
                animationDelay: `${flake.delay}s`,
                animationDuration: `${flake.duration}s`,
                fontSize: `${flake.size}px`,
              }}
            >
              ❄
            </div>
          ))}
          <img
            src={pabloImg}
            alt="Pablo catching snowflakes"
            className="pablo"
          />
        </div>
      )}

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
            <div className="group-words">{group.words.join(", ")}</div>
          </div>
        ))}
      </div>

      {/* Word Grid */}
      {!gameOver && (
        <div className="word-grid">
          {remainingWords.map((wordData, index) => (
            <button
              key={index}
              className={`word-tile ${selected.has(wordData.word) ? "selected" : ""} ${selected.has(wordData.word) && isShaking ? "shake" : ""}`}
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
            className={`life-dot ${i < lives ? "active" : "used"}`}
          />
        ))}
      </div>

      {/* Controls */}
      {!gameOver && (
        <div className="controls">
          <button
            className="control-btn"
            onClick={deselectAll}
            disabled={selected.size === 0 || isShaking}
          >
            Deselect All
          </button>
          <button
            className="control-btn submit-btn"
            onClick={submitGuess}
            disabled={
              selected.size !== MAX_SELECTED || isAlreadyGuessed || isShaking
            }
          >
            Submit
          </button>
        </div>
      )}

      {/* Game Over - Win */}
      {gameOver && won && (
        <div className="game-over win">
          <div className="pablo-dance-container">
            <video
              src={pabloDanceVideo}
              autoPlay
              loop
              muted
              playsInline
              className="pablo-dance"
            />
          </div>
          <h2>Congratulations!</h2>
          <p>You found all the connections!</p>
          <button className="control-btn" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}

      {/* Game Over - Lose */}
      {gameOver && !won && (
        <div className="game-over lose">
          <div className="grinch-container">
            <img src={grinchImg} alt="Grinch" className="grinch" />
            <div className="coal"></div>
          </div>
          <h2>Game Over</h2>
          <p>Coal for you!</p>
          <button className="control-btn" onClick={resetGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
