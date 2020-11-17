export class CallbackManager {
	private fns: Function[] = []

	constructor() { }

	push(fn: Function) {
		this.fns.push(fn)
	}

	clear() {
		this.fns.map(fn => fn())
	}
}