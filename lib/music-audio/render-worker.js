import { workerData } from "node:worker_threads"
import { execSync } from "node:child_process"
import { exit } from "node:process"
import { performance } from "node:perf_hooks"
import { writeFileSync } from "node:fs"

const { outputDir, filename, input, midiBinary } =
	/** @type {import("./render").WorkerData} */ (workerData)

const outputFile = `${outputDir}/${filename}`

console.log(`🔊⏳️ rendering ${outputFile} async`)

writeFileSync(input, midiBinary)

execSync(
	`QT_QPA_PLATFORM=offscreen musescore -o ${outputFile} ${input} &> /dev/null`
)

console.log(
	`🔊✅ rendered ${outputFile} async in ${Math.round(
		performance.now() / 1000
	)}s`
)

exit()
