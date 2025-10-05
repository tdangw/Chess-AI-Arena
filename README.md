# Chess AI Arena

This is a web-based Chinese Chess (Xiangqi) game built with React and TypeScript, running in a modern browser environment without a traditional bundler setup.

## Features

-   Play against three distinct AI opponents (Easy, Medium, Hard).
-   Player progression system with XP and Coins.
-   In-game shop to purchase cosmetic items like board skins, avatars, and emojis.
-   Inventory to equip purchased items.
-   Customizable game settings, including timers and audio controls.
-   In-game features like Undo, Hints, and Resign.
-   Responsive design for desktop, tablet, and mobile.
-   Audio feedback for game actions and UI interactions.

---

## How to Add Custom Audio

The application is set up to easily accept custom audio files for background music and sound effects.

### 1. Prepare Your Audio Files

You will need the following audio files, preferably in `.mp3` format for broad browser compatibility:

-   `music.mp3`: Background music for the menu and game.
-   `move.mp3`: Sound for a standard piece move.
-   `capture.mp3`: Sound for capturing an opponent's piece.
-   `win.mp3`: Sound for winning a game.
-   `lose.mp3`: Sound for losing a game.
-   `click.mp3`: A simple UI click sound for buttons.

### 2. Place Files in the `assets` Directory

Create a new folder named `assets` in the root directory of your project (the same level as `index.html`). Place all your prepared audio files inside this `assets` folder.

The final structure should look like this:

```
/
├── assets/
│   ├── music.mp3
│   ├── move.mp3
│   ├── capture.mp3
│   ├── win.mp3
│   ├── lose.mp3
│   └── click.mp3
├── components/
├── services/
├── index.html
├── index.tsx
└── ... (other files)
```

### 3. That's It!

The `services/audioService.ts` is already configured to look for these files in the `./assets/` directory. Once you add the files, they will automatically be used in the game. No code changes are necessary.

---

## How to Deploy to GitHub Pages

This project includes an automated script to make deploying to GitHub Pages simple.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Deployment Steps

1.  **Install Dependencies:** Open your terminal in the project's root directory and run this command once to install the necessary deployment tool:
    ```bash
    npm install
    ```

2.  **Configure `package.json`:** Open the `package.json` file and find the `"homepage"` line. You **must** edit this line to match your GitHub Pages URL. Replace `{USERNAME}` with your GitHub username and `{REPO_NAME}` with your repository name.
    ```json
    "homepage": "https://{USERNAME}.github.io/{REPO_NAME}",
    ```
    For example, if your username is `tdangw` and your repository is `chess-ai-arena`, it should look like this:
    ```json
    "homepage": "https://tdangw.github.io/chess-ai-arena/",
    ```

3.  **Run the Deploy Script:** Once configured, run the following command in your terminal:
    ```bash
    npm run deploy
    ```
    This command will automatically create a `gh-pages` branch, push all your project files to it, and publish them.

4.  **Set GitHub Pages Source:**
    *   In your repository on GitHub, go to **Settings** > **Pages**.
    *   Under "Build and deployment", set the **Source** to **Deploy from a branch**.
    *   Set the **Branch** to `gh-pages`.
    *   Click **Save**.

Your application will now be live at the URL you specified in the `homepage` field.
