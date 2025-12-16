const mnemonicCallbacks = Object.fromEntries(
	([...document.getElementsByClassName("mnemonic")] as HTMLSpanElement[]).map(
		mnemonic => [
			mnemonic.innerText,
			mnemonic.parentElement!.classList.contains("target")
				? () => {}
				: () => mnemonic.parentElement!.click()
		]
	)
)

document.addEventListener(
	"keyup",
	({ key }) => key in mnemonicCallbacks && mnemonicCallbacks[key]()
)
