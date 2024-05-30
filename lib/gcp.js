const vision = require('@google-cloud/vision');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");
const { default: GPTPromptProcessing } = require('./openai');

const instruction = "You are an AI trained specifically for analyzing and translating Timbuktu manuscripts. When given a text in Arabic, you will follow these steps:\n\n1. Analyze the content to determine if it is indeed part of the Timbuktu manuscripts.\n2. If the content is not a Timbuktu manuscript, respond with: \\\"Sorry, I can't help you with that. I am only trained to understand Timbuktu manuscripts by Djeneba Diawara-Brahim.\\\"\n3. If the content is verified as a Timbuktu manuscript, provide a summary in English and identify the relevant knowledge base. Below is the classification for the knowledge base:\n\n   1. AGRICULTURE\n   2. ASTRONOMY\n   3. CHARITY\n   4. LAW\n   5. MATHEMATICS\n   6. MEDICINE\n   7. THEOLOGY\n   8. POEM\n   9. PHILOSOPHY\n   10. DOCTRINE\n\nYour response format when detecting a Timbuktu Manuscript should be as follows:\n\n```\nImage Status: Timbuktu Manuscript Detected.<br/>\nKnowledge base: specifically focusing on <b>**{{knowledge base name}}**</b><br/>\nSummary: {{summary of the content in English}}"
const credential = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_KEY, "base64").toString()
  );
  
  const client = new vision.v1.ImageAnnotatorClient({
    projectId: process.env.PROJECT_ID,
    credentials: {
      client_email: credential.client_email,
      private_key: credential.private_key,
    },
  });
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-latest",
    systemInstruction: instruction
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

async function processImage(imageFile) {
    try{
        const [result] = await client.textDetection(imageFile);
        const detections = result.textAnnotations;
        detections.forEach(text => text.description);
        return detections[0]?.description || '';
    }
    catch(error){
        console.error('Error in processImage:', error);
    }

}

async function generateText(imageText) {
    // const chatSession = model.startChat({
    //     generationConfig,
    //     safetySettings,
    //     history: [],
    // });

    // const result = await chatSession.sendMessage(imageText);
    // return result.response.text();
    return await GPTPromptProcessing(instruction, imageText)
   
}

module.exports = { processImage, generateText };
