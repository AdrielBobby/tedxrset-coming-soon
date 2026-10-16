# Pixel Perfect Replica

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5e6f334d-8520-4b9b-b528-1f06ee615269).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## GitHub Pages Deployment

This repository is configured to deploy directly using GitHub Pages' **Deploy from a branch** option:

1. In your GitHub repository, navigate to **Settings** > **Pages**.
2. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main`
   - **Folder**: Select `/docs`
   - Click **Save**.
3. Your website will be live at `https://<your-username>.github.io/<repository-name>/`.

### Updating the Static Build

Whenever you make updates, run:

```sh
npm run build
```

This automatically recompiles all assets and refreshes the `/docs` folder for GitHub Pages.
