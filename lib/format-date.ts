import { DateTime } from "luxon"

export default (date: Date): string =>
	DateTime.fromJSDate(date).setZone("America/New_York").toFormat("yyyy-MM-dd")
