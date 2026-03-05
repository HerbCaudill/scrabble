# Scrabble vs Computer with Move Analysis

## Goal

Build a single-player Scrabble game against a computer opponent, with post-game analysis showing the best moves you could have made each turn.

## Approach

**Reuse from scorable:** Board layout, tile values/distribution, move scoring, word validation, board state representation. Copy these as standalone pure functions (no Automerge dependency).

**New for this project:** Tile bag management, rack management, move generation engine (for AI + analysis), computer player AI, drag-and-drop tile placement UI, post-game analysis view.

**Move generation** is the core algorithmic challenge. We'll implement the standard approach: for each anchor square (empty square adjacent to a filled square), generate all valid left-parts, then extend rightward. This same engine serves both the AI player and the post-game "best move" analysis.

**Computer AI** picks from the top-scoring moves with some randomization so it's not unbeatable.

**Post-game analysis** replays each of the human's turns, runs the move generator on the board state at that point with the player's rack, and shows the top moves they missed.

## Architecture

```
src/
  lib/           # Pure game logic (copied/adapted from scorable)
    board/       # Board layout, creation, state queries
    tiles/       # Tile bag, rack, values, distribution
    scoring/     # Move scoring, word multipliers
    words/       # Word validation via @herbcaudill/scrabble-words
    moves/       # Move generation engine (new)
    game/        # Game state management, turn flow
    ai/          # Computer player strategy
    analysis/    # Post-game move analysis
  components/    # React UI
    Board/       # Board grid, square rendering
    Rack/        # Player's tile rack with drag-and-drop
    Game/        # Main game screen, turn management
    Analysis/    # Post-game analysis view
    ScoreBoard/  # Current scores display
  types.ts       # Shared types
```

## Tasks

### Epic 1: Core game engine (pure functions, no UI)

1. **Copy board utilities from scorable** - boardLayout, createEmptyBoard, tileValues, constants, types
2. **Tile bag and rack management** - drawTiles, exchangeTiles, shuffleBag, createTileBag
3. **Copy scoring from scorable** - calculateMoveScore, getWordsFromMove, getTileValue
4. **Copy word validation from scorable** - wordList wrapping @herbcaudill/scrabble-words
5. **Move validation** - validateMove (adapted from scorable, simplified for single-player)
6. **Move generation engine** - Given a board state and rack, find all valid moves with scores
7. **Game state machine** - Turn flow: place tiles -> score -> draw tiles -> switch player -> check end conditions
8. **Computer player AI** - Select best-scoring move from generated moves
9. **Post-game analysis function** - For each human turn, find top N moves that were available

### Epic 2: UI

10. **Board component** - 15x15 grid with multiplier squares, placed tiles
11. **Tile component** - Letter tile with point value, draggable
12. **Rack component** - Player's 7 tiles, drag source
13. **Game screen** - Board + rack + scoreboard + controls (play, exchange, pass)
14. **Drag-and-drop tile placement** - Drag tiles from rack to board squares
15. **Computer turn animation** - Brief delay + tile placement animation for computer moves
16. **Score display** - Running scores for both players
17. **Game flow UI** - Start game, end game detection, game over screen

### Epic 3: Post-game analysis

18. **Analysis view** - Turn-by-turn replay with "your move" vs "best move" comparison
19. **Move highlighting on board** - Show where alternative moves would have been placed
20. **Score differential** - Show points left on the table each turn and cumulative

## Decisions

- **Tile placement**: Drag-and-drop
- **Blank tiles**: Modal popup to pick letter
- **Computer difficulty**: Randomize from top moves (not always best)
- **Exchange tiles**: Tap tiles in rack to toggle selection, then confirm
- **Analysis**: Post-game only (no in-game hints)
