# Posts are MDX modules served through a build-time virtual module

Posts are authored as MDX so that shared element overrides and per-post interactive components (e.g. data-structure demos) are possible. A Vite plugin owns the set of Posts: it validates front-matter, derives each Slug from the filename, and emits a `virtual:posts` module mapping each Slug to its metadata and a lazy `import()` of the compiled post. The `/posts/:slug` route is a single dynamic route whose loader awaits that import.

## Considered Options

- **Inject the Manifest into `index.html` (`window.__MANIFEST`).** This was the original design. It was dropped because the virtual module already carries the metadata, is typed, and updates with HMR. Keeping both would mean two channels to keep in sync.
- **Compile Markdown to HTML and fetch it per post.** Rejected because plain HTML can't host React components, and internal links would need click interception.
- **Plain `import.meta.glob` over `posts/`.** Rejected because the glob compiles Drafts into production chunks, which leaks their content. The plugin excludes Drafts from both the Manifest and the compiled chunks in production.
- **One generated route per Post.** Rejected in favour of one dynamic route, so the router config stays static and an unknown Slug is an explicit 404.
