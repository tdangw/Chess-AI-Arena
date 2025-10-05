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

This project is configured to be deployed easily to GitHub Pages.

### 1. Create a GitHub Repository

If you haven't already, create a new repository on GitHub and push your project files to it.

### 2. Enable GitHub Pages

1.  In your repository on GitHub, go to the **Settings** tab.
2.  In the left sidebar, click on **Pages**.
3.  Under the "Build and deployment" section, for the **Source**, select **Deploy from a branch**.
4.  Choose the branch you want to deploy from (usually `main` or `master`).
5.  Keep the folder as `/ (root)`.
6.  Click **Save**.

### 3. Access Your Deployed Site

After a few minutes, your site will be deployed. GitHub will provide you with the public URL at the top of the Pages settings screen (e.g., `https://<your-username>.github.io/<your-repo-name>/`).

**Important:** The project's `index.html` file uses relative paths (e.g., `./index.tsx`), which allows it to work correctly when hosted in a subdirectory like on GitHub Pages. No further configuration is needed.
