import nextConnect from 'next-connect';
import multer from 'multer';
import { processImage, generateText } from '../../lib/gcp'; 

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

const handler = nextConnect();

handler.use(upload.single('image'));

handler.post(async (req, res) => {
    const imageFile = req.file.buffer;
    try {
        const imageText = await processImage(imageFile);
        const response = await generateText(imageText);
        res.status(200).json({ response });
    } catch (error) {
        // console.error('Error in handler.post:', error);
        res.status(500).json({ error: error.message });
    }
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;