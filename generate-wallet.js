import fs from 'fs';
import Arweave from 'arweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

(async () => {
  const jwk = await arweave.wallets.generate(); // Генерация нового кошелька
  fs.writeFileSync('bundlr-key.json', JSON.stringify(jwk)); // Сохраняем в файл
  console.log('bundlr-key.json создан');
})();
