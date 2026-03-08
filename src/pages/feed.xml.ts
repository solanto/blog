import rss from "@astrojs/rss"
import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import { markdown } from "@astropub/md"
import sanitizeHtml from "sanitize-html"

const allowedTags = new Set<string>(sanitizeHtml.defaults.allowedTags)
allowedTags.add("img")
allowedTags.add("img")
allowedTags.add("pre")
allowedTags.add("math")

export const GET: APIRoute = async context => {
    const posts = await getCollection("posts")
    const photos = await getCollection("photos")

    return rss({
        // `<title>` field in output xml
        title: "dandelion.computer",
        // `<description>` field in output xml
        description: "andrew’s blog",
        // Pull in your project "site" from the endpoint context
        // https://docs.astro.build/en/reference/api-reference/#site
        site: context.site!,
        // Array of `<item>`s in output xml
        // See "Generating items" section for examples using content collections and glob imports
        items: (await Promise.all(
            posts.map(async post => ({
                title: post.data.title,
                pubDate: post.data.date,
                // description: post.,
                content: sanitizeHtml(await markdown(post.body ?? ""), {
                    allowedTags: Array.from(allowedTags)
                })
                    .replace(/<h1>.*?<\/h1>/, "")
                    .replace(/(<img(?: .*?) src=")(\.\.\/\.\.\/assets)(.*? \/>)/g, `$1${context.site!}assets$3`),
                // Compute RSS link from post `id`
                // This example assumes all posts are rendered as `/blog/[id]` routes
                link: `/posts/${post.id}/`,
            })).concat(photos.map(async photo => ({
                title: photo.data.title,
                pubDate: new Date(photo.data.date_taken ?? photo.data.date_last_update ?? new Date()),
                // description: post.,
                content: `<img src="${photo.data.imageUrls["1024px"]?.url
                    ?? photo.data.imageUrls["1600px"]?.url
                    ?? photo.data.imageUrls["800px"]?.url
                    ?? photo.data.imageUrls.original?.url}">`,
                // Compute RSS link from post `id`
                // This example assumes all posts are rendered as `/blog/[id]` routes
                link: `https://flickr.com/photos/daisygobbler/${photo.data.id}`,
            })))
        )).sort((a, b) => a.pubDate > b.pubDate ? -1 : 1),
        // (optional) inject custom xml
        customData: `<language>en-us</language>`
    })
}