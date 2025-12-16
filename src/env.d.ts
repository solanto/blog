interface ImportMetaEnv {
	readonly FLICKR_API_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare module "smartypants" {
	export default function smartypants(raw: string): string
}

interface OembedResponse {
	type?: string
	version?: string
	title?: string
	author_name?: string
	author_url?: string
	provider_name?: string
	provider_url?: string
	cache_age?: string
	thumbnail_url?: string
	thumbnail_width?: number
	thumbnail_height?: number
	html?: string
	width?: number
	height?: number
	[key: string]: any // for nonstandard fields
}

interface OembetterOptions {
	maxwidth?: number
	maxheight?: number
	headers?: Record<string, string>
	[key: string]: any
}

type BeforeFilter = (
	url: string,
	options: OembetterOptions,
	response: OembedResponse | undefined,
	callback: (
		err: Error | null,
		url?: string,
		options?: OembetterOptions,
		response?: OembedResponse
	) => void
) => void

type AfterFilter = (
	url: string,
	options: OembetterOptions,
	response: OembedResponse,
	callback: (err: Error | null, response?: OembedResponse) => void
) => void

type FallbackFilter = (
	url: string,
	options: OembetterOptions,
	callback: (err: Error | null, response?: OembedResponse) => void
) => void

interface OembetterEndpoint {
	domain: string
	endpoint: string
	path?: RegExp
}

interface Oembetter {
	fetch(
		url: string,
		callback: (
			err: Error | null,
			response?: OembedResponse,
			warnings?: Error[]
		) => void
	): void
	fetch(
		url: string,
		options: OembetterOptions,
		callback: (
			err: Error | null,
			response?: OembedResponse,
			warnings?: Error[]
		) => void
	): void

	addBefore(filter: BeforeFilter): void
	addAfter(filter: AfterFilter): void
	addFallback(filter: FallbackFilter): void

	inDomain(domain: string, hostname: string): boolean

	allowlist(domains: string[]): void
	endpoints(endpoints: OembetterEndpoint[]): void

	suggestedAllowlist: string[]
	suggestedEndpoints: OembetterEndpoint[]
}

declare module "oembetter" {
	export default function newOembetter(): Oembetter
}
