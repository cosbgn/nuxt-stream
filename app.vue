<template>
	<div style="padding:50px">
		<button @click="startStream">Start Stream</button>
		<p style="margin-top:20px"> {{ streamed_response }}</p>
	</div>
</template>
<script setup>

const streamed_response = ref('')

const startStream = async() => {
	streamed_response.value = ''
	await fetch('/api/stream').then(processChunkedResponse).then(processStream)
}


// Stream

const processChunkedResponse = (response) => {
	const reader = response.body.getReader()
  	const decoder = new TextDecoder()
	return new ReadableStream({
		start(controller) {
		function push() {
			reader.read().then(({ done, value }) => {
				// console.log(value)
			if (done) {
				controller.close()
				return;
			}
			const data = decoder.decode(value, { stream: !done })
			controller.enqueue(data)
			let objects = []
			try{
				objects = data.split("\n").filter((line) => line.startsWith("data:") && !line.endsWith('data: [DONE]')).map((line) => JSON.parse(line.substring(5)))
			} catch(e){
				// console.log(e)
				// console.log(data)
			}

			for (const obj of objects){
				streamed_response.value += obj?.choices?.[0]?.delta?.content ?? ''
			}push()
			})
		}
		push()
		},
	})
}

const processStream = (stream) => {
    let reader = stream.getReader();

    return readChunk()

    function readChunk() {
        return reader.read().then(appendChunks)
    }

    function appendChunks(result) {
        // process chunk as Uint8Array and update the UI

        if (result.done) {
            // console.log('returning')
            return result
        } else {
            // console.log('recursing')
            return readChunk()
        }
    }
}
</script>