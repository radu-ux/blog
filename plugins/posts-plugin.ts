import { join } from 'node:path'
import { readdirSync, readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { collectPosts, MDX_EXTENSION, type Mode } from './collect-posts.ts'

interface PluginConfig {
  postsPath: string
}

const PLUGIN_NAME = 'vite-plugin-posts'
const VIRTUAL_MODULE_ID = 'virtual:posts'
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

function readPostFiles(rootPath: string) {
  return readdirSync(rootPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(MDX_EXTENSION))
    .map((entry) => ({
      filename: entry.name,
      contents: readFileSync(join(rootPath, entry.name), 'utf-8'),
    }))
}

function toImportSpecifier(filePath: string) {
  return filePath.split('\\').join('/')
}

function generateModuleSource(rootPath: string, mode: Mode) {
  const { posts, errors } = collectPosts(readPostFiles(rootPath), { mode })

  if (errors.length > 0) {
    if (mode === 'production') {
      throw new Error(`[${PLUGIN_NAME}] Invalid posts:\n${errors.join('\n')}`)
    }
    for (const error of errors) {
      console.warn(`[${PLUGIN_NAME}] ${error}`)
    }
  }

  const entries = Object.values(posts).map((post) => {
    const importPath = JSON.stringify(
      toImportSpecifier(join(rootPath, `${post.slug}${MDX_EXTENSION}`)),
    )
    return `  ${JSON.stringify(post.slug)}: { metadata: ${JSON.stringify(post)}, load: () => import(${importPath}) }`
  })

  return `export const posts = {\n${entries.join(',\n')}\n}\n`
}

export default function postsPlugin({ postsPath }: PluginConfig): Plugin {
  const rootPath = join(process.cwd(), postsPath)
  let mode: Mode = 'production'

  return {
    name: PLUGIN_NAME,
    configResolved(config) {
      mode = config.command === 'build' ? 'production' : 'development'
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return generateModuleSource(rootPath, mode)
      }
    },
    configureServer(server) {
      server.watcher.add(rootPath)
      server.watcher.on('all', (_event, changedPath) => {
        if (!changedPath.startsWith(rootPath)) return

        const virtualModule = server.moduleGraph.getModuleById(
          RESOLVED_VIRTUAL_MODULE_ID,
        )
        if (virtualModule) {
          server.moduleGraph.invalidateModule(virtualModule)
        }
        server.ws.send({ type: 'full-reload' })
      })
    },
  }
}
