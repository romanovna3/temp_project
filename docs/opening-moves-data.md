# Opening Moves Data

This document defines the first 5 moves (main line) for each opening. Used for:
1. Showing position on board when a course card is selected
2. Filtering courses when user plays moves on the board

## Format

Each opening has an array of move pairs: `{ white: 'move', black: 'move' }`
- White's move comes first in each pair
- If Black hasn't moved yet in a pair, use empty string `''`
- Use standard algebraic notation (SAN): e4, Nf3, Bc4, O-O, etc.

## Opening Moves (5 moves each)

### 1. e4 Openings

**Italian Game** (1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.c3 Nf6 5.d4)
```
e4 e5 | Nf3 Nc6 | Bc4 Bc5 | c3 Nf6 | d4 exd4
```

**Ruy Lopez** (1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O)
```
e4 e5 | Nf3 Nc6 | Bb5 a6 | Ba4 Nf6 | O-O Be7
```

**Scotch Game** (1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 5.Be3)
```
e4 e5 | Nf3 Nc6 | d4 exd4 | Nxd4 Bc5 | Be3 Qf6
```

**Four Knights** (1.e4 e5 2.Nf3 Nc6 3.Nc3 Nf6 4.Bb5 Bb4 5.O-O)
```
e4 e5 | Nf3 Nc6 | Nc3 Nf6 | Bb5 Bb4 | O-O O-O
```

**Fried Liver Attack** (1.e4 e5 2.Nf3 Nc6 3.Bc4 Nf6 4.Ng5 d5 5.exd5)
```
e4 e5 | Nf3 Nc6 | Bc4 Nf6 | Ng5 d5 | exd5 Nxd5
```

**Petroff Defense** (1.e4 e5 2.Nf3 Nf6 3.Nxe5 d6 4.Nf3 Nxe4 5.d4)
```
e4 e5 | Nf3 Nf6 | Nxe5 d6 | Nf3 Nxe4 | d4 d5
```

**Scandinavian Defense** (1.e4 d5 2.exd5 Qxd5 3.Nc3 Qa5 4.d4 Nf6 5.Nf3)
```
e4 d5 | exd5 Qxd5 | Nc3 Qa5 | d4 Nf6 | Nf3 Bf5
```

**French Defense** (1.e4 e6 2.d4 d5 3.Nd2 Nf6 4.e5 Nfd7 5.Bd3)
```
e4 e6 | d4 d5 | Nd2 Nf6 | e5 Nfd7 | Bd3 c5
```

**Caro-Kann Defense** (1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5 5.Ng3)
```
e4 c6 | d4 d5 | Nc3 dxe4 | Nxe4 Bf5 | Ng3 Bg6
```

**Pirc Defense** (1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.f4 Bg7 5.Nf3)
```
e4 d6 | d4 Nf6 | Nc3 g6 | f4 Bg7 | Nf3 O-O
```

### Sicilian Variations

**Open Sicilian** (Najdorf: 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3)
```
e4 c5 | Nf3 d6 | d4 cxd4 | Nxd4 Nf6 | Nc3 a6
```

**Sicilian Defense** (same as Open Sicilian for filtering)
```
e4 c5 | Nf3 d6 | d4 cxd4 | Nxd4 Nf6 | Nc3 a6
```

**Alapin Sicilian** (1.e4 c5 2.c3 d5 3.exd5 Qxd5 4.d4 Nf6 5.Nf3)
```
e4 c5 | c3 d5 | exd5 Qxd5 | d4 Nf6 | Nf3 e6
```

### 1. d4 Openings

**London System** (1.d4 d5 2.Bf4 Nf6 3.e3 e6 4.Nf3 c5 5.c3)
```
d4 d5 | Bf4 Nf6 | e3 e6 | Nf3 c5 | c3 Nc6
```

**Queen's Gambit** (1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3)
```
d4 d5 | c4 e6 | Nc3 Nf6 | Bg5 Be7 | e3 O-O
```

**Queen's Gambit Accepted** (1.d4 d5 2.c4 dxc4 3.e3 e5 4.Bxc4 exd4 5.exd4)
```
d4 d5 | c4 dxc4 | e3 e5 | Bxc4 exd4 | exd4 Nf6
```

**Queen's Gambit Declined** (1.d4 d5 2.c4 e6 3.Nc3 Nf6 4.Bg5 Be7 5.e3)
```
d4 d5 | c4 e6 | Nc3 Nf6 | Bg5 Be7 | e3 O-O
```

**Nimzo-Indian Defense** (1.d4 Nf6 2.c4 e6 3.Nc3 Bb4 4.Qc2 O-O 5.a3)
```
d4 Nf6 | c4 e6 | Nc3 Bb4 | Qc2 O-O | a3 Bxc3+
```

**King's Indian Defense** (1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3)
```
d4 Nf6 | c4 g6 | Nc3 Bg7 | e4 d6 | Nf3 O-O
```

### 1. c4 / 1. Nf3 Openings

**English Opening** (1.c4 e5 2.Nc3 Nf6 3.Nf3 Nc6 4.g3 Bb4 5.Bg2)
```
c4 e5 | Nc3 Nf6 | Nf3 Nc6 | g3 Bb4 | Bg2 O-O
```

**Against 1. c4 & 1. Nf3** (Symmetrical English: 1.c4 e5 2.Nc3 Nf6 3.Nf3 Nc6 4.g3 d5 5.cxd5)
```
c4 e5 | Nc3 Nf6 | Nf3 Nc6 | g3 d5 | cxd5 Nxd5
```

---

## JSON Format for Code

Copy this into `OPENING_FIRST_5_MOVES` in `Courses.vue`:

```javascript
const OPENING_FIRST_5_MOVES = {
  "Alapin": [
    { white: 'e4', black: 'c5' },
    { white: 'c3', black: 'd5' },
    { white: 'exd5', black: 'Qxd5' },
    { white: 'd4', black: 'Nf6' },
    { white: 'Nf3', black: 'e6' }
  ],
  "Against 1. c4 & 1. Nf3": [
    { white: 'c4', black: 'e5' },
    { white: 'Nc3', black: 'Nf6' },
    { white: 'Nf3', black: 'Nc6' },
    { white: 'g3', black: 'd5' },
    { white: 'cxd5', black: 'Nxd5' }
  ],
  "Caro-Kann Defense": [
    { white: 'e4', black: 'c6' },
    { white: 'd4', black: 'd5' },
    { white: 'Nc3', black: 'dxe4' },
    { white: 'Nxe4', black: 'Bf5' },
    { white: 'Ng3', black: 'Bg6' }
  ],
  "English Opening": [
    { white: 'c4', black: 'e5' },
    { white: 'Nc3', black: 'Nf6' },
    { white: 'Nf3', black: 'Nc6' },
    { white: 'g3', black: 'Bb4' },
    { white: 'Bg2', black: 'O-O' }
  ],
  "Four Knights": [
    { white: 'e4', black: 'e5' },
    { white: 'Nf3', black: 'Nc6' },
    { white: 'Nc3', black: 'Nf6' },
    { white: 'Bb5', black: 'Bb4' },
    { white: 'O-O', black: 'O-O' }
  ],
  "French Defense": [
    { white: 'e4', black: 'e6' },
    { white: 'd4', black: 'd5' },
    { white: 'Nd2', black: 'Nf6' },
    { white: 'e5', black: 'Nfd7' },
    { white: 'Bd3', black: 'c5' }
  ],
  "Fried Liver": [
    { white: 'e4', black: 'e5' },
    { white: 'Nf3', black: 'Nc6' },
    { white: 'Bc4', black: 'Nf6' },
    { white: 'Ng5', black: 'd5' },
    { white: 'exd5', black: 'Nxd5' }
  ],
  "Italian Game": [
    { white: 'e4', black: 'e5' },
    { white: 'Nf3', black: 'Nc6' },
    { white: 'Bc4', black: 'Bc5' },
    { white: 'c3', black: 'Nf6' },
    { white: 'd4', black: 'exd4' }
  ],
  "King's Indian Defense": [
    { white: 'd4', black: 'Nf6' },
    { white: 'c4', black: 'g6' },
    { white: 'Nc3', black: 'Bg7' },
    { white: 'e4', black: 'd6' },
    { white: 'Nf3', black: 'O-O' }
  ],
  "London System": [
    { white: 'd4', black: 'd5' },
    { white: 'Bf4', black: 'Nf6' },
    { white: 'e3', black: 'e6' },
    { white: 'Nf3', black: 'c5' },
    { white: 'c3', black: 'Nc6' }
  ],
  "Nimzo-Indian Defense": [
    { white: 'd4', black: 'Nf6' },
    { white: 'c4', black: 'e6' },
    { white: 'Nc3', black: 'Bb4' },
    { white: 'Qc2', black: 'O-O' },
    { white: 'a3', black: 'Bxc3+' }
  ],
  "Open Sicilian": [
    { white: 'e4', black: 'c5' },
    { white: 'Nf3', black: 'd6' },
    { white: 'd4', black: 'cxd4' },
    { white: 'Nxd4', black: 'Nf6' },
    { white: 'Nc3', black: 'a6' }
  ],
  "Petroff Defense": [
    { white: 'e4', black: 'e5' },
    { white: 'Nf3', black: 'Nf6' },
    { white: 'Nxe5', black: 'd6' },
    { white: 'Nf3', black: 'Nxe4' },
    { white: 'd4', black: 'd5' }
  ],
  "Pirc Defense": [
    { white: 'e4', black: 'd6' },
    { white: 'd4', black: 'Nf6' },
    { white: 'Nc3', black: 'g6' },
    { white: 'f4', black: 'Bg7' },
    { white: 'Nf3', black: 'O-O' }
  ],
  "Queen's Gambit": [
    { white: 'd4', black: 'd5' },
    { white: 'c4', black: 'e6' },
    { white: 'Nc3', black: 'Nf6' },
    { white: 'Bg5', black: 'Be7' },
    { white: 'e3', black: 'O-O' }
  ],
  "Queen's Gambit Accepted": [
    { white: 'd4', black: 'd5' },
    { white: 'c4', black: 'dxc4' },
    { white: 'e3', black: 'e5' },
    { white: 'Bxc4', black: 'exd4' },
    { white: 'exd4', black: 'Nf6' }
  ],
  "Queen's Gambit Declined": [
    { white: 'd4', black: 'd5' },
    { white: 'c4', black: 'e6' },
    { white: 'Nc3', black: 'Nf6' },
    { white: 'Bg5', black: 'Be7' },
    { white: 'e3', black: 'O-O' }
  ],
  "Ruy Lopez": [
    { white: 'e4', black: 'e5' },
    { white: 'Nf3', black: 'Nc6' },
    { white: 'Bb5', black: 'a6' },
    { white: 'Ba4', black: 'Nf6' },
    { white: 'O-O', black: 'Be7' }
  ],
  "Scandinavian Defense": [
    { white: 'e4', black: 'd5' },
    { white: 'exd5', black: 'Qxd5' },
    { white: 'Nc3', black: 'Qa5' },
    { white: 'd4', black: 'Nf6' },
    { white: 'Nf3', black: 'Bf5' }
  ],
  "Scotch": [
    { white: 'e4', black: 'e5' },
    { white: 'Nf3', black: 'Nc6' },
    { white: 'd4', black: 'exd4' },
    { white: 'Nxd4', black: 'Bc5' },
    { white: 'Be3', black: 'Qf6' }
  ],
  "Sicilian Defense": [
    { white: 'e4', black: 'c5' },
    { white: 'Nf3', black: 'd6' },
    { white: 'd4', black: 'cxd4' },
    { white: 'Nxd4', black: 'Nf6' },
    { white: 'Nc3', black: 'a6' }
  ],
}
```

---

## How to Edit

1. Find the opening you want to change
2. Update the moves in both the human-readable section and the JSON section
3. Make sure move notation is valid SAN (e.g. `Nf3` not `N-f3`, `O-O` for castling)
4. After editing, copy the JSON into `Courses.vue` replacing `OPENING_FIRST_3_MOVES`
