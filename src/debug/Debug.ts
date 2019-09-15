import { uuid } from "../lib/util";

class Debug {
	private map = new Map();

	public set(el: any): void {
		this.map.set(uuid(), el);
		console.log(Array.from(this.map.values()));
	}
}

export const DebugMap = new Debug();