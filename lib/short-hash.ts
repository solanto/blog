import { createHash } from "node:crypto"

export default (data: string) =>
	createHash("md5").update(data).digest("hex").slice(0, 7)
