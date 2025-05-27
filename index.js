import fs from 'fs';
import express from 'express';
import Irys from '@irys/sdk'; // Убедимся, что правильно импортируем

const app = express();
app.use(express.json({ limit: '10mb' }));

const key = JSON.parse(fs.readFileSync('./bundlr-key.json', 'utf8'));

// Инициализация клиента Irys (проверь, как именно работает SDK в документации)
const irys = new Irys({
  url: "https://devnet.bundlr.network", // Указываем URL для Devnet
  token: "arweave",                 // Используем Arweave
  key: key
});

app.post('/upload', async (req, res) => {
  try {
    const jsonData = JSON.stringify(req.body);

    // Загружаем данные в Arweave через Irys SDK
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

app.listen(3000, () => {
  console.log("🚀 Bundlr uploader (Irys) running on http://localhost:3000");
});
