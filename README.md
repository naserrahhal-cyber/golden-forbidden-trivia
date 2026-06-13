# Golden & Forbidden Trivia 🏆

A multiplayer **pass-and-play** trivia web game. For every round, the category has many valid answers — but two of them are secret: a **Golden Answer** (bonus point) and a **Forbidden Answer** (penalty). Players take turns submitting one answer, then everything is revealed at once and scored.

Built with plain **HTML, CSS, and vanilla JavaScript** — no dependencies, no build step. Just open the file in a browser.

---

## 🎮 How to Play

1. Add 2 or more player names and pick how many rounds (questions) to play.
2. Each round shows a category (e.g. "Name a European country").
3. Players pass the device around — each one secretly types their answer in turn.
4. Once everyone has answered, all answers are revealed together along with the round's hidden Golden and Forbidden answers.
5. Scores update automatically, and a leaderboard is shown between rounds.
6. After the final round, the overall winner(s) are announced.

---

## 🧮 Scoring Rules

| Situation | Points |
|---|---|
| Valid answer, unique | **+1** |
| Valid answer, duplicated by another player | **0** |
| Golden Answer, unique | **+2** (+1 unique bonus, +1 golden bonus) |
| Golden Answer, duplicated | **+1** (golden bonus only) |
| Forbidden Answer | **-1** (always, regardless of duplication) |
| Invalid / wrong answer, unique | **0** |
| Invalid / wrong answer, duplicated | **-1** each |

- The **Forbidden Answer** always results in exactly **-1**, overriding all other rules.
- The **Golden Answer** bonus is awarded even if duplicated.
- Players can have negative total scores.

### 🥇 Tie-Breaker Rules
If two or more players are tied on total score at the end of the game:
1. The player with the **most Golden Answers** wins.
2. If still tied, the player with the **fewest cancelled (duplicated-valid) answers** wins.
3. If still tied, the result is a shared win.

---

## 📚 Built-in Question Bank

The game includes 10 ready-made categories, each with a predefined list of valid answers plus a secret Golden and Forbidden answer:

- European countries
- Fruits
- Programming languages
- Football clubs
- Marvel characters
- Animals
- Colors
- Arab cities
- Planets
- Sports

Golden/Forbidden answers and valid answer lists are hardcoded per question and never shown to players until the reveal screen.

---

## 🚀 Running the Game

No installation needed — just open `trivia_game.html` in any modern web browser (Chrome, Firefox, Safari, Edge).

```bash
# Clone the repo
git clone https://github.com/<your-username>/golden-forbidden-trivia.git
cd golden-forbidden-trivia

# Open in your browser
open trivia_game.html   # macOS
# or just double-click the file
```

---

## 🛠 Tech Stack

- HTML5
- CSS3 (custom properties, RTL support)
- Vanilla JavaScript (no frameworks)

---

## 📄 License

Free to use and modify.
