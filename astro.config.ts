import { defineConfig } from "astro/config"
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

export default defineConfig({
	output: "static",
	build: {
		inlineStylesheets: "never",
		assets: "bundled"
	},
	compressHTML: true,
	image: {
		domains: ["flickr.com", "live.staticflickr.com", "wikimedia.org"]
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
