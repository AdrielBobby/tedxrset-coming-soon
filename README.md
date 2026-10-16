# TEDxRSET — Coming Soon

Official countdown and teaser landing page for TEDxRSET at Rajagiri School of Engineering & Technology.

## Development

You need Node.js and npm:

```sh
npm install
npm run dev
```

## GitHub Pages Deployment

To publish this website using GitHub Pages:

1. In your GitHub repository, navigate to **Settings** > **Pages** (in the left sidebar).
2. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main`
   - **Folder**: Select `/docs` ⚠️ _(Make sure to select `/docs`, not `/(root)`)_
   - Click **Save**.
3. GitHub Pages will publish the static site from the `/docs` folder within 1 minute at:
   `https://<your-username>.github.io/<repository-name>/`

### Updating the Build

Whenever you make changes to the code, run:

```sh
npm run build
```

This automatically compiles the project and refreshes the `/docs` directory for GitHub Pages.
