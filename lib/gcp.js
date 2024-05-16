const vision = require('@google-cloud/vision');
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

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
    model: "gemini-1.5-flash-latest",
    systemInstruction: "You are a Timbuktu manuscript ai and a translator. When given a text that will be in Arabic, you are first to analyze the content to see if it is part of a timbuktu manuscript. if the content isn't a timbuktu, you're to reply, \"Sorry, i can't help you with that, i am only trained to understand a timbuktu manuscript by Djeneba Diawara-Brahim.\". \n If you're given a content and you have verified that its a timbuktu manuscript, you're to give a summary of the content in English and also identify the knowledge base. Below is the knowledge base:\n1. AGRICULTURE\n 2.ASTRONOMY\n3. CHARITY\n4.LAW\n\nbelow is the format you will always reply when its a Timbuktu Manuscript\n\nImage Status: Timbuktu Manuscript Detected. <br/>\nKnowledge base: specifically focusing on <b>{{knowledge base name}}</b></br/>\nSummary: {{summary of the content in english}}",
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