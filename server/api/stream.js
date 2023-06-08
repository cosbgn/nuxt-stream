import { Configuration, OpenAIApi } from "openai"
const configuration = new Configuration({ apiKey: process.env.OPENAI_KEY })
const openai = new OpenAIApi(configuration)

export default defineEventHandler(async (event) => {
	const messages = [{role:'user', content:"Is 1 + 1 equal to two?"}]
	const body = { model:"gpt-3.5-turbo", messages, stream:true }
	const response = await openai.createChatCompletion(body, { responseType: 'stream' } )
	console.log(response.data)
	return sendStream(event, response.data)
})