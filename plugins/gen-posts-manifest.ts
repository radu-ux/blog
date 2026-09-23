import { join } from 'path'
import matter from 'gray-matter'
import type { Plugin } from 'vite'
import { readdirSync, readFileSync } from 'fs'

interface PluginConfig {
  postsPath: string
}
type Manifest = Record<string, unknown>

const PLUGIN_NAME = 'vite-plugin-gen-posts-manifest'
const MANIFEST_PROD_PLACEHOLDER = '<!-- INJECT_MANIFEST_HERE -->'

function buildManifest(postsPath: string) {
  const cwd = process.cwd()
  const rootPath = join(cwd, postsPath)
  const manifest: Manifest = {}
  const postFiles = readdirSync(rootPath)

  for (const postFile of postFiles) {
    const postFilePath = join(rootPath, postFile)
    const contents = readFileSync(postFilePath, 'utf-8')
    const { data } = matter(contents)

    if (!data) {
      throw new Error(
        `[${PLUGIN_NAME}]: No front-matter data for ${postFile} post`,
      )
    }

    manifest[data.slug] = data
  }

  return manifest
}

function builManifestInjectionScript(manifest: Manifest) {
  return `<script type=module>window.__MANIFEST=${JSON.stringify(manifest)}</script>`
}

export default function genPostsManifest({ postsPath }: PluginConfig): Plugin {
  return {
    name: PLUGIN_NAME,
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/manifest.json') {
          const manifest = buildManifest(postsPath)

          res.setHeader('Content-Type', 'application/json')
          res.end(manifest)
        }

        next()
      })
    },
    transformIndexHtml(html) {
      const manifest = buildManifest(postsPath)

      return html.replace(
        MANIFEST_PROD_PLACEHOLDER,
        builManifestInjectionScript(manifest),
      )
    },
    // generateBundle() {
    //   const manifest = buildManifest(postsPath)

    //   this.emitFile({
    //     type: 'asset',
    //     fileName: 'manifest.json',
    //     source: JSON.stringify(manifest),
    //   })
    // },
  }
}
