import { getCollection } from "astro:content"
import slug from "slug"
import type { Post } from "../src/content.config"

export interface Tag {
	id: string
	lastUpdated?: Date
	posts: Post[]
}

const coalesceMax = <T>(a: T, b: T) => ((a ?? b) > (b ?? a) ? a ?? b : b ?? a)

export default async () => {
	const tags: Record<string, Tag> = {}

	for (const post of await getCollection("posts")) {
		for (const tagName of (post.data.tags as string[]) ?? []) {
			const extant = tags[tagName] as Tag | undefined

			tags[tagName] = {
				id: extant?.id ?? slug(tagName),
				lastUpdated: coalesceMax(
					extant?.lastUpdated,
					post.data.updated ?? post.data.date
				),
				posts: [...(extant?.posts ?? []), post]
			}
		}
	}

	return tags
}
