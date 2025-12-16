import yaml from "yaml"
import { flickrPeopleGetPhotosLoader as photostream } from "@lekoarts/flickr-loader"

// 1. Import utilities from `astro:content`
import { defineCollection, z } from "astro:content"

// 2. Import loader(s)
import { glob, file } from "astro/loaders"

// 3. Define your collection(s)
const posts = defineCollection({
	loader: glob({
		pattern: ["*.md", "*.mdx"],
		base: "src/content/posts"
	}),
	schema: z.object({
		title: z.string(),
		date: z.date(),
		updated: z.optional(z.date()),
		tags: z.optional(z.array(z.string()))
	})
})

const photos = defineCollection({
	loader: photostream({
		api_key: import.meta.env.FLICKR_API_KEY,
		username: "daisygobbler"
	})
})

const navigation = defineCollection({
	schema: z.object({
		id: z.string(),
		mnemonic: z.number().int(),
		href: z.string(),
		match: z.optional(z.string())
	}),
	loader: file("src/config/navigation.yaml", {
		parser: yaml.parse
	})
})

const prompts = defineCollection({
	schema: z.object({
		id: z.string(),
		text: z.string()
	}),
	loader: file("src/config/prompts.yaml", {
		parser: raw =>
			(yaml.parse(raw) as string[]).map((text, index) => ({
				id: index.toString(),
				text
			}))
	})
})

// 4. Export a single `collections` object to register your collection(s)
export const collections = { posts, photos, navigation, prompts }

import type { DataEntryMap } from "astro:content"

export type Post = DataEntryMap["posts"][number]
export type Photo = DataEntryMap["photos"][number]
export type NavigationItem = DataEntryMap["navigation"][number]
export type Prompt = DataEntryMap["prompts"][number]
