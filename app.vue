<template>
	<div style="padding:50px">
		<button @click="startStream">Start Stream</button>
		<p style="margin-top:20px"> {{ streamed_response }}</p>
	</div>
</template>
<script setup>

const streamed_response = ref([])
const startStream = async() => {
	streamed_response.value = ''
	await fetch('/api/stream').then(update_stream)
}

const update_stream = async (resp) => {
	const data = resp.body
	if (data) {
		const reader = data.getReader()
		const decoder = new TextDecoder()
		let done = false
		try {
			while (!done) {
			const { value, done:doneReading } = await reader.read()
			done = doneReading
			decoder.decode(value)
					.split("\n")
					.filter(line => line.startsWith("data:") && !line.endsWith('data: [DONE]'))
					.forEach(line => {
						try {
							const json = JSON.parse(line.substring(5))
							streamed_response.value = streamed_response.value + (json?.choices?.[0]?.delta?.content ?? '')
						} catch {
							`Can not parse to json: ${line.substring(5)}`
						}
					})
			}
		} finally {
			console.log("Cleared Stream")
			reader.cancel("Streaming ended and we don't need it anymore")
		}
	}
}
</script>