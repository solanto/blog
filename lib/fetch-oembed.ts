import newOembetter from "oembetter"
import { promisify } from "node:util"
import code from "./components/unist/code"

export interface Photo {
	type: "photo"
	url: string
	width: number
	height: number
	[_: string]: any
}

export interface Rich<T = "rich"> {
	type: T
	html: string
	width: number
	height: number
	[_: string]: any
}

export interface Link {
	type: "link"
	[_: string]: any
}

export type Video = Rich<"video">

export type OembedData = Photo | Video | Rich | Link

export const isPhoto = (data: OembedData): data is Photo =>
	data.type === "photo"

export const isRich = (data: OembedData): data is Rich => data.type === "rich"

export const isLink = (data: OembedData): data is Link => data.type === "link"

export const isVideo = (data: OembedData): data is Video =>
	data.type === "video"

const oembetter = newOembetter()

oembetter.addBefore((url, options, response, callback) => {
	const parsed = new URL(url)

	if (!oembetter.inDomain("codepen.io", parsed.hostname))
		return setImmediate(() => callback(null, url, options, response))

	const matches = parsed.pathname.match(/\/(.+)\/pen\/(.+)/)

	if (!matches)
		return setImmediate(() => callback(null, url, options, response))

	const [_, username, hash] = matches

	const height = 226

	const newResponse = {
		type: "rich",
		width: 400,
		height,
		html: `
			<p class="codepen" data-height="${height}" data-theme-id="dark" data-default-tab="result" data-slug-hash="${hash}"data-user="${username}" style="height: ${height}px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
				<span><a href="https://codepen.io/${username}/pen/${hash}">See this pen</a> by <a href="https://codepen.io/${username}">@${username}</a> on <a href="https://codepen.io">CodePen</a>.</span>
			</p>
			<script async src="https://public.codepenassets.com/embed/index.js"></script>
		`
	} satisfies Rich

	return callback(null, url, options, newResponse)
})

const fetchOembed = promisify(oembetter.fetch) as unknown as (
	url: string,
	options?: {
		maxWidth?: number
		maxHeight?: number
		[_: string]: any
	}
) => Promise<OembedData>

export default fetchOembed
