import { Buffer } from 'buffer'
import path from 'path'
import { Compilation, sources, WebpackPluginFunction } from 'webpack'
import RawSource = sources.RawSource

export type RawContent = string | Buffer

/** see https://webpack.js.org/api/compilation-hooks/#list-of-asset-processing-stages */
export type Stage =
  | 'additional'
  | 'pre_process'
  | 'derived'
  | 'additions'
  | 'optimize'
  | 'optimize_count'
  | 'optimize_compatibility'
  | 'optimize_size'
  | 'dev_tooling'
  | 'optimize_inline'
  | 'summarize'
  | 'optimize_hash'
  | 'optimize_transfer'
  | 'analyse'
  | 'report'

export interface Options {
  disabled?: boolean
  name: string | ((hash: Compilation['hash']) => string)
  content: RawContent | ((assets: Compilation['assets']) => PromiseLike<RawContent> | RawContent)
  stage?: Stage
}

export const emitFile = (options: Options): WebpackPluginFunction => {
  const pluginName = 'EmitFileWebpackPlugin'
  const stage = (options.stage ?? 'additional').toUpperCase() as Uppercase<Stage>
  const tapOptions = { name: pluginName, stage: Compilation[`PROCESS_ASSETS_STAGE_${stage}`] }
  return (compiler) => {
    if (options.disabled) {
      return
    }
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      const basePath = compilation.options.output.path ?? ''
      const fileName = typeof options.name === 'function' ? options.name(compilation.hash) : options.name
      const filePath = path.relative(basePath, path.resolve(basePath, fileName))
      compilation.hooks.processAssets.tapPromise(tapOptions, async () => {
        const source = await toSource(options.content, compilation.assets)
        if (source !== null) {
          compilation.emitAsset(filePath, source)
        }
      })
    })
  }
}

export interface JSONOptions<T> extends Omit<Options, 'content'> {
  content: T | { toJSON(): T }
  space?: number
}

export const emitJSONFile = <T>(options: JSONOptions<T>) => {
  return emitFile({
    disabled: options.disabled,
    name: options.name,
    content: JSON.stringify(options.content, null, options.space ?? 2),
    stage: options.stage,
  })
}

export default emitFile

async function toSource(input: Options['content'], assets: Compilation['assets']): Promise<RawSource | null> {
  if (typeof input === 'string' || Buffer.isBuffer(input)) {
    return new RawSource(input)
  } else if (typeof input === 'function') {
    return toSource(await input(assets), assets)
  }
  return null
}
