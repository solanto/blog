import { defineConfig, passthroughImageService } from "astro/config"
// import { imageService } from "@unpic/astro/service"
import markdown from "./lib/remark.config"
import musicAudio from "./lib/music-audio"
import mdx from "@astrojs/mdx"
import markdownIntegration from "@astropub/md"
// import elmstronaut from "elmstronaut"

export const cacheDir = ".astro"

const workingDir = `./${cacheDir}/music-audio`

const inputDir = `${workingDir}/input`,
	outputDir = `${workingDir}/output`

export const musicAudioDirs = Object.freeze({
	workingDir,
	inputDir,
	outputDir
})

const _fetch = globalThis.fetch;
globalThis.fetch = function (input, init) {
	let hostname
	try {
		const url = input instanceof Request ? input.url
			: input instanceof URL ? input.href
				: String(input)

		hostname = new URL(url).hostname
	} catch { return _fetch(input, init) }

	const headers = new Headers(input instanceof Request ? input.headers : undefined)
	headers.set('User-Agent', 'dandelion.computer/1.0 (https://dandelion.computer; person@dandelion.computer)')

	if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v))

	init = { ...init, headers }

	return _fetch(input, init)
}

export default defineConfig({
	output: "static",
	site: "https://dandelion.computer",
	build: {
		inlineStylesheets: "never",
		assets: "bundled"
	},
	compressHTML: true,
	image: {
		domains: ["flickr.com", "live.staticflickr.com", "wikimedia.org"],
		service: passthroughImageService()
	},
	integrations: [
		// elmstronaut()
		musicAudio,
		mdx(),
		markdownIntegration()
	],
	markdown,
	cacheDir,
	experimental: {
		contentIntellisense: true
	},
	redirects: {
		"/photography": "/photography/1"
	}
})
