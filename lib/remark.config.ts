import rehypeMathml from "@daiji256/rehype-mathml"
import remarkAbbr from "@richardtowers/remark-abbr"
import type { AstroUserConfig } from "astro"
import emojiRegex from "emoji-regex"
import { fromDom } from "hast-util-from-dom"
import { fromHtml } from "hast-util-from-html"
import { JSDOM } from "jsdom"
import type { Root, Text } from "mdast"
import { findAndReplace } from "mdast-util-find-and-replace"
import rehypeMermaid from "rehype-mermaid"
import rehypeSortAttributes from "rehype-sort-attributes"
import rehypeSvgo from "rehype-svgo"
import rehypeWidont from "rehype-widont"
import remarkDeflist from "remark-deflist"
import remarkDirective from "remark-directive"
import remarkDirectiveSugar from "remark-directive-sugar"
import remarkIns from "remark-ins"
import remarkMath from "remark-math"
import remarkRedirect from "remark-redirect"
import remarkSectionize from "remark-sectionize"
import remarkSmartypants from "remark-smartypants"
import remarkSupersub from "remark-supersub"
import remarkToc from "remark-toc"
import type { Plugin } from "unified"
import rehypeShiki from "@shikijs/rehype"
import {
	transformerNotationDiff,
	transformerNotationHighlight
} from "@shikijs/transformers"
import type { Element } from "hast"
import fetchOpenGraph from "open-graph-scraper"
import { createCssVariablesTheme } from "shiki"
// @ts-ignore
import getBBox from "svg-pathdata-getbbox"
import type { Literal, Node as UnistNode } from "unist"
import { visit } from "unist-util-visit"
import abcjsScript from "../node_modules/abcjs/dist/abcjs-basic-min.js?raw"
import code from "./components/unist/code"
import fetchOembed, { isLink, isPhoto, type OembedData } from "./fetch-oembed"
import render from "./music-audio/render"
import abcGrammarJSON from "./sublime-abc/ABC Notation.JSON-tmLanguage?raw"
import type * as ABCJS from "abcjs"
import { type Handler, toHast } from "mdast-util-to-hast"
// import remarkOembed from "remark-oembed"
import remarkEmbedder from "@remark-embedder/core"
import transformerOembed from "@remark-embedder/transformer-oembed"

declare global {
	interface Window {
		ABCJS: typeof ABCJS
	}
}

const remarkMusic: Plugin = () => async tree => {
	const nodes: (UnistNode & Element & Literal)[] = []
	visit(tree, "code", node => {
		if ((node as any).lang === "abc") nodes.push(node)
	})

	await Promise.all(
		nodes.map(async node => {
			const dom = new JSDOM(
				/*html*/ `
					<body>
						<figure class="paper">
							<div id="abc"></div>
						</figure>
						<script>${abcjsScript}</script>
					</body>
				`,
				{ runScripts: "dangerously" }
			)

			const container = dom.window.document.getElementById("abc")!

			const [tune] = dom.window.ABCJS.renderAbc(
				"abc",
				(node as any).value,
				{
					ariaLabel: "",
					add_classes: true,
					paddingleft: 0,
					wrap: {
						preferredMeasuresPerLine: 4,
						minSpacing: 1,
						maxSpacing: 5
					}
				}
			)

			const midiBinary = dom.window.ABCJS.synth.getMidiFile(tune, {
				midiOutputType: "binary"
			})

			const filename = render(midiBinary)

			container.removeAttribute("id")
			container.removeAttribute("style")

			const svg = container.firstElementChild!

			const { width, height }: { width: number; height: number } =
				getBBox.getBBoxFromEl(svg)

			svg.setAttribute("width", width.toString())
			svg.setAttribute("viewBox", `0 40 ${width} ${height}`)
			svg.classList.add("music")

			const audioElement = dom.window.document.createElement("audio")
			audioElement.setAttribute("controls", "")
			audioElement.setAttribute("preload", "metadata")
			audioElement.setAttribute("src", `/assets/abc-audio/${filename}`)
			container.parentElement!.append(audioElement)

			const data = fromDom(container.parentElement!) as Element

			// replace node
			Object.assign(node, {
				type: "abc",
				value: node.value,
				data: {
					hName: data.tagName,
					hProperties: data.properties,
					hChildren: [
						...data.children,
						{
							type: "element",
							tagName: "details",
							properties: {},
							children: [
								{
									type: "element",
									tagName: "summary",
									properties: {},
									children: [
										{
											type: "text",
											value: "abc notation"
										}
									]
								},
								toHast({
									type: "code",
									lang: "abc",
									meta: "hi",
									value: node.value as string,
									data: {
										hProperties: { "data-test": "default" }
									}
								}) as Element
							]
						} satisfies Element
					]
				}
			})
		})
	)

	return tree
}

// function imageEmbed(
// 	node: UnistNode,
// 	url: string,
// 	width: any,
// 	height: any
// ): void {
// 	const dom = new JSDOM(/*html*/ `
// 		<body>
// 			<figure id="embed">
// 				<img src="${url}" width="${width}" height="${height}" alt="">
// 				<figcaption>
// 					${(node as any).alt} (<a href="${(node as any).url}">view original content</a>)
// 				</figcaption>
// 			</figure>
// 		</body>
// 	`)

// 	node.type = "element"
// 	node.data = {
// 		hName: "figure",
// 		hProperties: {
// 			class: "windowed",
// 			style: "--aspect-ratio: auto"
// 		},
// 		hChildren: fromHtml(
// 			dom.window.document.getElementById("embed")!.innerHTML
// 		).children
// 	}
// 		; (node as any).alt = ""
// }

// const remarkEmbed: Plugin = () => async tree => {
// 	const matches: [node: typeof tree, index: number, parent: typeof tree][] =
// 		[]

// 	visit(tree, "image", (...args) => matches.push(args))
// 	console.log(matches)

// 	await Promise.all(
// 		matches.map(async ([node]): Promise<void> => {
// 			let oembedData: OembedData

// 			try {
// 				oembedData = await fetchOembed((node as any).url)
// 			} catch {
// 				let openGraphData: Awaited<ReturnType<typeof fetchOpenGraph>>

// 				try {
// 					openGraphData = await fetchOpenGraph({
// 						url: (node as any).url
// 					})

// 					if (
// 						!openGraphData.error &&
// 						openGraphData.result.ogImage?.length
// 					) {
// 						const { url, width, height } =
// 							openGraphData.result.ogImage[0]

// 						imageEmbed(node, url, width, height)
// 					}
// 				} catch {
// 					imageEmbed(node, (node as any).url, undefined, undefined)
// 				}

// 				return
// 			}

// 			console.log("hi")


// 			// TODO: handle links
// 			if (isLink(oembedData)) return
// 			else if (isPhoto(oembedData))
// 				imageEmbed(
// 					node,
// 					oembedData.url,
// 					oembedData.width,
// 					oembedData.height
// 				)
// 			else {
// 				const aspectRatio = oembedData.width / oembedData.height

// 				const dom = new JSDOM(/*html*/ `
// 					<body>
// 						<figure id="embed">
// 							${oembedData.html}
// 							<figcaption>${(node as any).alt}</figcaption>
// 						</figure>
// 					</body>
// 				`)

// 				const firstChild =
// 					dom.window.document.getElementById("embed")!
// 						.firstElementChild!

// 				const isBlockquote = firstChild.nodeName == "BLOCKQUOTE"

// 				if (isBlockquote) firstChild.classList.add("pre")

// 				node.type = "element"
// 				node.data = {
// 					hName: "figure",
// 					hProperties: {
// 						class: isBlockquote ? null : "windowed",
// 						style: isFinite(aspectRatio)
// 							? `--aspect-ratio: ${aspectRatio.toPrecision(4)}`
// 							: null
// 					},
// 					hChildren: fromHtml(
// 						dom.window.document.getElementById("embed")!.innerHTML
// 					).children
// 				}
// 			}
// 		})
// 	)

// 	return tree
// }

const inlineMatcher = (leftDelimiter: string, rightDelimiter = leftDelimiter) =>
	new RegExp(
		leftDelimiter + "(?! +)([^\n\r]( [^\n\r])*(?! +))+?" + rightDelimiter,
		"g"
	)

const remarkSmall: Plugin =
	() =>
		(tree): void =>
			findAndReplace(tree as Root, [
				[
					inlineMatcher("--"),
					(match: string): Text => {
						const text = match.slice(2, -2)

						return {
							type: "text",
							value: text,
							data: {
								hName: "small",
								hChildren: [{ type: "text", value: text }]
							}
						}
					}
				]
			])

const citeNode = (
	value: string,
	hProperties: Record<string, string> = {}
): Text => ({
	type: "text",
	value,
	data: {
		hName: "cite",
		hProperties,
		hChildren: [{ type: "text", value }]
	}
})

const remarkCite: Plugin =
	() =>
		(tree): void =>
			findAndReplace(tree as Root, [
				[
					inlineMatcher("\\[\\[", "\\]\\]"),
					(match: string): Text => citeNode(match.slice(2, -2))
				],
				[
					inlineMatcher("\\[", "\\]"),
					(match: string): Text =>
						citeNode("“" + match.slice(1, -1) + "”", {
							class: "small"
						})
				]
			])

const remarkDetails: Plugin =
	() =>
		(tree): void =>
			findAndReplace(tree as Root, [
				[
					inlineMatcher("--"),
					(match: string): Text => {
						const text = match.slice(2, -2)

						return {
							type: "text",
							value: text,
							data: {
								hName: "small",
								hChildren: [{ type: "text", value: text }]
							}
						}
					}
				]
			])

const remarkTaggedEmoji: Plugin =
	() =>
		(tree): void =>
			findAndReplace(tree as Root, [
				[
					new RegExp(`(${emojiRegex().toString().slice(1, -2)})+`, "g"),
					(match: string): Text => ({
						type: "text",
						value: match,
						data: {
							hName: "span",
							hProperties: {
								class: `emoji${match.matchAll(emojiRegex()).toArray().length > 3 ? " long" : ""}`
							},
							hChildren: [{ type: "text", value: match }]
						}
					})
				]
			])

const remarkDates: Plugin =
	() =>
		(tree): void =>
			findAndReplace(tree as Root, [
				[
					/([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?/g,
					(match: string): Text => ({
						type: "text",
						value: match,
						data: {
							hName: "time",
							hProperties: {
								datetime: match
							},
							hChildren: [{ type: "text", value: match }]
						}
					})
				]
			])

const variablesTheme = createCssVariablesTheme({
	name: "css-variables-custom",
	variablePrefix: "--shiki-",
	variableDefaults: {},
	fontStyle: true
})

const codeToHast: Handler = (state, node) => {
	console.log("😍", node)

	const value = node.value ? node.value + "\n" : ""

	const properties: any = {}

	if (node.lang) properties.className = ["language-" + node.lang]

	// Create `<code>`.
	let result: any = {
		type: "element",
		tagName: "code",
		properties,
		children: [{ type: "text", value }]
	}

	if (node.meta) result.data = { meta: node.meta }

	state.patch(node, result)

	result = state.applyData(node, result)

	// Create `<pre>`.
	result = {
		type: "element",
		tagName: "pre",
		properties: { className: ["hi"] },
		children: [result]
	}

	state.patch(node, result)

	return result
}

const imageToHast: Handler = (state, node) => {
	console.log(node, state)

	const properties: any = { src: node.url, class: "copy" }

	if (node.alt !== null && node.alt !== undefined) properties.alt = node.alt

	if (node.title !== null && node.title !== undefined)
		properties.title = node.title

	let result: any = {
		type: "element",
		tagName: "img",
		properties,
		children: []
	}

	state.patch(node, result)

	// Create `<figure><pre>`.
	result = {
		type: "element",
		tagName: "figure",
		properties: { class: "photo" },
		children: [result]
	}

	state.patch(node, result)

	return state.applyData(node, result)
}

const markdown: AstroUserConfig["markdown"] = {
	smartypants: false,
	remarkPlugins: [
		remarkDeflist as any,
		remarkRedirect as any,
		remarkSupersub as any,
		remarkToc,
		remarkAbbr,
		remarkDirective,
		remarkIns,
		remarkSectionize,
		remarkDirectiveSugar,
		remarkMusic,
		// [remarkOembed, { syncWidget: true }],
		remarkSmall,
		remarkTaggedEmoji,
		remarkCite,
		remarkMath,
		remarkDates,
		remarkSmartypants,
		// [remarkEmbedder, { transformers: [transformerOembed] }]
		// processor => remarkEmbedder(processor, { transformers: [transformerOembed] })
	],
	rehypePlugins: [
		// rehypeShiki,
		rehypeMathml,
		rehypeSvgo,
		rehypeWidont,
		rehypeSortAttributes,
		rehypeMermaid
	],
	remarkRehype: {
		handlers: {
			abbrDefinition: () => undefined,
			code: codeToHast
			// image: imageToHast
		}
	},
	shikiConfig: {
		langs: [{ ...JSON.parse(abcGrammarJSON), name: "abc" }],
		theme: "ayu-dark",
		transformers: [
			transformerNotationDiff(),
			transformerNotationHighlight()
		]
	}
}

export default markdown
