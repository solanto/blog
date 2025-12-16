import type { APIRoute } from "astro"
import processor from "../../../lib/postcss-processor"
import colors from "../../../node_modules/a11y-syntax-highlighting/dist/json/a11y-light-on-dark.json"

export const GET: APIRoute = async () => {
	return new Response(
		(
			await processor.process(/*css*/ `
                    x {
                        --shiki-foreground: ${colors["no-token"].hex};
                        --shiki-background: ${colors.background.hex};
                        --shiki-token-constant: ${colors["no-token"].hex};
                        --shiki-token-string: ${colors.green.hex};
                        --shiki-token-comment: ${colors.comment.hex};
                        --shiki-token-keyword: ${colors.blue.hex};
                        --shiki-token-parameter: ${colors["no-token"].hex};
                        --shiki-token-function: ${colors.yellow.hex};
                        --shiki-token-string-expression: ${colors["no-token"].hex};
                        --shiki-token-punctuation: ${colors.gray.hex};
                        --shiki-token-link: ${colors["no-token"].hex};
                    }
                `)
		).toString()
	)
}

Math.E
