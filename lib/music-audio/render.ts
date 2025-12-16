import { writeFile } from "node:fs/promises"
import shortHash from "../short-hash"
import { musicAudioDirs } from "../../astro.config"
import { Worker } from "node:worker_threads"

export interface WorkerData {
	outputDir: string
	filename: string
	input: string
	midiBinary: any
}

export default function (midiBinary: any) {
	const id = shortHash(midiBinary.toString())
	const filename = `${id}.mp3`

	new Worker(new URL("./render-worker.js", import.meta.url), {
		workerData: {
			outputDir: musicAudioDirs.outputDir,
			input: `${musicAudioDirs.inputDir}/${id}.mid`,
			filename,
			midiBinary
		} satisfies WorkerData
	})

	return filename
}
