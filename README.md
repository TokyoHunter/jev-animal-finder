# Animal Emoji Finder

A single-page app where every animal emoji floats around the screen and a search bar sits in the middle. Type what you want in plain English, such as `birds`, `sea animals` or `animals that fly`, and the matching emojis gather in a panel below the search bar. Click any emoji to copy it.

Searching is powered by **Jev**, TypeSafe AI's decision model. If Jev isn't available, the page falls back to a built-in search, so it never stops working.

## What's in the box

| File | What it does |
| --- | --- |
| `animal-emoji-finder-jev.html` | The whole app: page, styles and search logic in one file. |
| `server.js` | A tiny local server that serves the page and passes searches to Jev, keeping your API key private. |
| `.env` | You create this. It holds your API key (see below). It is never uploaded to GitHub. |
| `.gitignore` | Tells git to skip `.env` and other files that shouldn't be uploaded. |

## Quick start

You need [Node.js](https://nodejs.org) 18 or newer. There is nothing to install with npm.

1. Put `animal-emoji-finder-jev.html` and `server.js` in the same folder.
2. In that folder, create a text file named exactly `.env` containing one line:

   ```
   TYPESAFE_API_KEY=your_key_here
   ```

   On Windows with Notepad, choose **Save as**, set the type to **All files**, and type `.env` as the name.
3. Open a terminal in that folder and run:

   ```
   node server.js
   ```
4. Open <http://localhost:3000> in your browser.

To use a different port, set `PORT` (for example `PORT=8080`) in the `.env` file.

### Other ways to provide the key

You can skip the `.env` file and set the key in your terminal instead.

| Terminal | Command |
| --- | --- |
| Windows Command Prompt | `set TYPESAFE_API_KEY=your_key_here` then `node server.js` (two separate lines) |
| Windows PowerShell | `$env:TYPESAFE_API_KEY="your_key_here"; node server.js` |
| macOS / Linux | `TYPESAFE_API_KEY=your_key_here node server.js` |

### Without the server

You can open `animal-emoji-finder-jev.html` directly in your browser instead. Click the ⚙️ button in the top-right corner, paste your key, and save. The key is stored only in your browser. Some browsers block direct calls to the API, and if that happens the page tells you so. In that case, use `server.js`.

Without a key, the app still works using its built-in search.

## Using the app

- **Search box:** type a request and wait half a second, or press **Enter** to search immediately. Press **Esc** to clear.
- **Quick buttons:** All animals, Mammals, Birds, Sea life, Insects, Reptiles, Pets, Farm and Wild.
- **Copy an emoji:** click any emoji, floating or in the results panel.
- **Status line:** shows what happened, for example "Matched by Jev" or a warning if Jev didn't answer.

Things worth trying: `all the animals`, `birds`, `birds and fish`, `pets`, `animals that live in the ocean`, `dangerous animals`, `insects`.

## How the search works

1. Your text is sent to Jev as the search request.
2. The page asks Jev one yes/no question per emoji: "Should this emoji appear for this request?" With 128 emojis, that is 4 requests of 35 questions each, sent in parallel.
3. Jev returns a probability for each question. Emojis at 50% or higher are shown, best matches first.
4. Results are cached, so repeating a search costs nothing.

Searches that already match every animal, such as `all the animals`, skip Jev and show everything at once.

**Built-in fallback search** is used when there is no key or Jev doesn't answer. It matches emoji names, animal groups and Persian names, ignores small typos, and understands `and` or commas to combine groups.

### Cost

Jev is priced per input token. A typical search sends roughly 10,000 tokens, which at the published rate of about $0.042 per million tokens is a small fraction of a cent. Check TypeSafe's current pricing and access rules for your account.

## Settings (⚙️)

| Setting | Default | Notes |
| --- | --- | --- |
| Endpoint | `/api/systemone` when served by `server.js`, otherwise `https://api.typesafe.ai/v1/systemone` | Change it to use a proxy or a gateway that supports the same request format. |
| API key | empty | Leave empty when using `server.js`. |
| Model | `jev-latest` | Or pin a version, such as `jev-1.13.0`. |

`server.js` also supports `JEV_URL` (in `.env` or your environment) to point it at a different upstream endpoint.

## Customizing

Everything is in the `<script>` section of the HTML file.

- **Add or edit emojis:** find the `RAW` list. Each line is `emoji|English name|tags|Persian name`, for example `🦁|lion|mammal wild|شیر`.
- **Match sensitivity:** change `threshold` in `DEFAULTS` (default `0.5`). Raise it for stricter results, lower it for more.
- **Questions per request:** change `BATCH` (default `35`). Smaller batches are usually more accurate but use more requests.
- **Colours and fonts:** edit the variables at the top of the `<style>` section. Light and dark themes follow your system setting.

## Publishing on GitHub and GitHub Pages

1. Rename `animal-emoji-finder-jev.html` to `index.html` (GitHub Pages looks for that name).
2. Keep the `.gitignore` file in the folder. It tells git to skip `.env`, so your key is never uploaded.
3. Create a new repository on GitHub, then in your project folder run:

   ```
   git init
   git add .
   git status
   git commit -m "Animal emoji finder"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

   Check that `.env` is **not** listed by `git status` before you commit.
4. On GitHub, open **Settings > Pages**, set the source to **Deploy from a branch**, choose `main` and `/ (root)`, and save. After a minute your site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

GitHub Pages only hosts static files, so `server.js` does not run there. The published page works like this:

- It starts with the built-in search, which needs no key.
- Each visitor can click ⚙️ and paste their own Jev key to switch on Jev search. The key stays in that visitor's browser.
- Your key is never in the files, so it can't leak from the repository.
- Jev may refuse requests made directly from a browser page (a browser security rule called CORS). If it does, the page shows a warning and keeps using the built-in search. To use Jev on a public site you need a small proxy that holds your key, for example a serverless function on Netlify, Vercel or Cloudflare.

If you ever commit your key by mistake, deleting it in a later commit is not enough because it stays in the history. Create a new key in your TypeSafe dashboard and delete the old one.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `'TYPESAFE_API_KEY' is not recognized...` on Windows | Use the `.env` file, or the Windows commands above. The one-line `KEY=value node server.js` form doesn't work in Command Prompt. |
| `No key found` when starting the server | The `.env` file is missing, misnamed (for example `.env.txt`), or in a different folder from `server.js`. |
| "the browser blocked the request" | Run the app through `server.js` instead of opening the HTML file directly. |
| `HTTP 401` | The API key is wrong or expired. |
| `HTTP 429` | You hit a rate limit. Wait a moment and try again. |
| "Using built-in search" | No key is set. Add one in `.env` or in ⚙️ settings. |
| Some emojis show as empty boxes | Your system's emoji font is older than those emojis. Updating your OS fixes it. |

## Privacy and security

- Never share your `.env` file or your API key, and don't put them in a public repository. If you use git, add `.env` to `.gitignore`.
- With `server.js`, the key stays on your computer and never reaches the browser.
- If you save the key in the ⚙️ settings, it is stored in your browser's local storage. Don't do that on a shared computer.
- The text you type is sent to Jev to find matches. Nothing else leaves your computer.
