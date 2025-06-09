import fs from 'fs';
import express from 'express';
import Irys from '@irys/sdk';
import multer from 'multer';
import { create } from '@web3-storage/w3up-client'

const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(express.json({ limit: '10mb' }));

const key = JSON.parse(fs.readFileSync('./bundlr-key.json', 'utf8'));

const irys = new Irys({
  url: "https://devnet.bundlr.network",
  token: "arweave",
  key: key
});

const web3StorageClient = await create()
await web3StorageClient.login('victor_k02@mail.ru')
await web3StorageClient.setCurrentSpace('did:key:z6MkqSCAttYC2RrtcyLEGeRcNv8z1aJu5BoSH2cz9a6BD1wr')

app.post('/upload', async (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body);

    const tx = await irys.upload(jsonData, {
      tags: [{ name: "Content-Type", value: "application/json" }]
    });

    console.log("✅ Uploaded to Irys Devnet:", tx.id);
    res.json({ txId: tx.id, url: `https://arweave.net/${tx.id}` });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
});

app.post('/upload-web3', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const mimeType = req.file.mimetype;
    const buffer = await fs.promises.readFile(filePath);

    const file = new File([buffer], originalName, { type: mimeType });

    const cid = await web3StorageClient.uploadFile(file);
    console.log("✅ Uploaded to Web3.Storage:", cid);

    res.json({ txId: cid.toString(), url: `https://w3s.link/ipfs/${cid}` });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload to Web3.Storage failed", details: err.message });
  } finally {
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
  }
});

app.listen(3000, () => {
  console.log("🚀 Bundlr uploader (Irys) running on http://localhost:3000");
});
