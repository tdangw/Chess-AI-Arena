# Chess AI Arena

This is a web-based Chinese Chess (Xiangqi) game built with React, TypeScript, and Vite.

## Features

-   Play against three distinct AI opponents (Easy, Medium, Hard).
-   Player progression system with XP and Coins.
-   In-game shop to purchase cosmetic items like board skins, avatars, and emojis.
-   Inventory to equip purchased items.
-   Customizable game settings, including timers and audio controls.
-   In-game features like Undo, Hints, and Resign.
-   Responsive design for desktop, tablet, and mobile.
-   Audio feedback for game actions and UI interactions.
-   Modern build setup with Vite for a fast development experience.

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

### 2. Place Files in the `public/assets` Directory

Create a folder named `public` in the root of your project if it doesn't exist. Inside `public`, create another folder named `assets`. Place all your audio files inside this `public/assets` folder.

The final structure should look like this:

```
/
├── public/
│   ├── assets/
│   │   ├── music.mp3
│   │   ├── move.mp3
│   │   └── ... (etc)
│   └── vite.svg
├── components/
├── services/
├── index.html
├── vite.config.ts
└── ... (other files)
```

### 3. That's It!

The `services/audioService.ts` is configured to look for these files at the root path `/assets/`. Files placed in the `public` directory are automatically served from the root, so no code changes are necessary.

---

## How to Deploy to GitHub Pages

This project uses Vite and the `gh-pages` package for a simple and automated deployment process.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine.

### Deployment Steps

1.  **Install Dependencies:** If you haven't already, open your terminal in the project's root directory and run:
    ```bash
    npm install
    ```

2.  **Configure `package.json`:** Open the `package.json` file and find the `"homepage"` line. You **must** edit this URL to match your GitHub Pages URL. Replace `{USERNAME}` with your GitHub username and `{REPO_NAME}` with your repository name.
    ```json
    "homepage": "https://{USERNAME}.github.io/{REPO_NAME}",
    ```
    For example, if your username is `tdangw` and your repository is `chess-ai-arena`, it should look like this:
    ```json
    "homepage": "https://tdangw.github.io/chess-ai-arena/",
    ```
    This step is crucial as it tells Vite how to set the correct paths for the deployed site.

3.  **Run the Deploy Script:** Once configured, simply run the following command in your terminal:
    ```bash
    npm run deploy
    ```
    This single command will automatically:
    a.  **Build** your project using Vite into an optimized `dist` folder.
    b.  **Push** the contents of the `dist` folder to a special branch named `gh-pages` in your repository.

4.  **Set GitHub Pages Source:**
    *   In your repository on GitHub, go to **Settings** > **Pages**.
    *   Under "Build and deployment", set the **Source** to **Deploy from a branch**.
    *   Under "Branch", select `gh-pages` and keep the folder as `/ (root)`.
    *   Click **Save**.

After a minute or two, your application will be live at the URL you specified in the `homepage` field.
