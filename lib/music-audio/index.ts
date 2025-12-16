import type { AstroIntegration } from "astro"
import { createReadStream, mkdirSync } from "node:fs"
import copyFunction from "copy"
import { musicAudioDirs } from "../../astro.config"
import { promisify } from "node:util"
import { fileURLToPath } from "node:url"
import { join } from "node:path"

const copy = promisify(copyFunction)

const maybeMkdirSync: typeof mkdirSync = (...args) => {
	console.log(args)
	try {
		mkdirSync(...args)
	} catch (error: any) {
		if (error.code != "EEXIST") throw error
	}
}

const integration: AstroIntegration = {
	name: "music-audio",
	hooks: {
		"astro:config:setup": async ({ createCodegenDir }) => {
			createCodegenDir() // ensure cacheDir

			maybeMkdirSync(musicAudioDirs.workingDir)
			maybeMkdirSync(musicAudioDirs.inputDir)
			maybeMkdirSync(musicAudioDirs.outputDir)
		},
		// inject audio into build
		"astro:build:done": async ({ dir }) => {
			const assetDir = fileURLToPath(new URL("assets/abc-audio", dir))
			maybeMkdirSync(assetDir)

			await copy(`${musicAudioDirs.outputDir}/*`, assetDir)
		},
		// serve audio in dev
		"astro:server:setup": ({ server }) => {
			server.middlewares.use((req, res, next) => {
				if (req.url?.startsWith("/assets/abc-audio/")) {
					createReadStream(
						join(
							process.cwd(),
							".astro/music-audio/output",
							req.url.replace("/assets/abc-audio/", "")
						)
					)
						.on("error", () => {
							res.statusCode = 404
							res.end("Not found")
						})
						.pipe(res)
				} else next()
			})
		}
	}
}

export default integration
