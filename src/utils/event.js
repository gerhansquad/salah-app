class MyEventTarget extends EventTarget {
	constructor(trigger) {
		super()
		this.triggerName = trigger
		this.event = new Event(this.triggerName)
	}
}

export const renderEvent = new MyEventTarget("render-new-data")
