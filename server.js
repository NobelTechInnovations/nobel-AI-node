import express from 'express';
import { main } from './agent.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
const app = express();

const port = 3001;
// Fix __dirname since ES modules don’t have it by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, "public")));

// Route for index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.post('/chat', async(req,res) => {
    const msg = req.body;
    const result = await main(msg.message);
    res.json({message:result});
})

app.listen(port,()=>{
    console.log('server strted');
})