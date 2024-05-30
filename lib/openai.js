import * as dotenv from "dotenv";
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});

export default async function GPTPromptProcessing(instruction, task) {
    try {
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
            model: "gpt-4o",
            messages: [
                { role: "system", content: instruction },
                { role: "user", content: task },
            ],
        });

        return (completion.data.choices[0].message.content);
    } catch (error) {
        if (error?.data?.error?.message) {
            const errorMessage = error.data.error.message;
            throw new Error(`GPTPromptProcessing failed: ${errorMessage}`);
        } else {
            throw new Error(`GPTPromptProcessing failed: ${error.message}`);
        }
    }
}