import { codeToHtml, type BundledLanguage } from "shiki"
import { transformerStyleToClass } from "@shikijs/transformers"

export default async function (code: string, lang: BundledLanguage) {
	const toClass = transformerStyleToClass({
		classPrefix: "__shiki_"
	})

	return {
		html: await codeToHtml(code, {
			lang,
			themes: {
				dark: "vitesse-dark",
				light: "vitesse-light"
			},
			defaultColor: false,
			transformers: [toClass]
		}),
		css: toClass.getCSS()
	}
}
