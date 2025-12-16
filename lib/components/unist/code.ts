import type { Element } from "hast"
import type { Code } from "mdast"
import type { BundledLanguage } from "shiki"

export default (code: string, language: BundledLanguage | string): Code =>
	// {
	// 	type: "element",
	// 	tagName: "pre",
	// 	properties: { default: true },
	// 	children: [
	// 		{
	// 			type: "element",
	// 			tagName: "code",
	// 			properties: { className: [`language-${language}`] },
	// 			children: [
	// 				{
	// 					type: "text",
	// 					value: code
	// 				}
	// 			]
	// 		}
	// 	]
	// }
	({
		type: "code",
		lang: language,
		meta: null,
		value: code
	})
