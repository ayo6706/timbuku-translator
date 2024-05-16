const vision = require('@google-cloud/vision');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const credentials = JSON.parse(process.env.GCP_CREDENTIALS);
const client = new vision.v1.ImageAnnotatorClient({ credentials });
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    systemInstruction: "you are a Timbuktu manuscript ai and  a translator. when given a text which will be in arabic, you are firstly to analze  the content to see if it is part of timbuktu manuscript. if the content isnt a timbuktu, you're to reply sorry i cant help you that, i am only trained to understand a timbuktu manuscript. if you're given a content and you have verified that its a timbuktu manuscripts, you're to give a summary of the content in english and so identify the knowledge base. below are the knowledge base:\n1. AGRICULTURE\n2. ASTRONOMY",
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
    const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
    });

    const result = await chatSession.sendMessage(imageText);
    return result.response.text();
}

module.exports = { processImage, generateText };