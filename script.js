// ========== Atom Logo Animation ==========

const canvas = document.getElementById('atom-logo');
const ctx = canvas.getContext('2d');

const scaleFactor = 2;
canvas.width = canvas.clientWidth * scaleFactor;
canvas.height = canvas.clientHeight * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

const x_c = canvas.width / (2 * scaleFactor);
const y_c = canvas.height / (2 * scaleFactor);

const ellipses = [
  { a: 68, b: 8, theta: Math.PI / 4 + 0.02, speed: 0.02, phase: 0, size: 6 },
  { a: 68, b: 8, theta: Math.PI / 4 + 0.02, speed: 0.015, phase: Math.PI / 3, size: 4.7 },
  { a: 85, b: 9, theta: 3 * Math.PI / 4 + 0.03, speed: 0.01, phase: Math.PI / 2, size: 3.4 }
];

const logo = new Image();
logo.src = './assets/img/cryptolaxy_logo_atom.svg';

let time = 0;

logo.onload = function () {
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;

    const logoSize = 150;
    ctx.drawImage(logo, x_c - logoSize / 2, y_c - logoSize / 2, logoSize, logoSize);

    ellipses.forEach(({ a, b, theta, speed, phase, size }) => {
      const x = x_c + a * Math.cos(time * speed + phase) * Math.cos(theta)
        - b * Math.sin(time * speed + phase) * Math.sin(theta);
      const y = y_c + a * Math.cos(time * speed + phase) * Math.sin(theta)
        + b * Math.sin(time * speed + phase) * Math.cos(theta);

      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();
      ctx.closePath();
    });

    time += 1;
    requestAnimationFrame(draw);
  }

  draw();
};

// ========== CoinGecko API Logic ==========

async function fetchPrices() {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd'
    );
    const data = await res.json();

    document.getElementById('btc').textContent = `$${data.bitcoin.usd}`;
    document.getElementById('eth').textContent = `$${data.ethereum.usd}`;
    document.getElementById('sol').textContent = `$${data.solana.usd}`;
  } catch (error) {
    console.error("Failed to fetch prices", error);
  }
}

async function fetchMarketCap() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/global');
    const data = await res.json();

    const marketCap = data.data.total_market_cap.usd;
    document.getElementById('market-cap').textContent =
      `$${(marketCap / 1e12).toFixed(2)} Trillion`;
  } catch (error) {
    console.error("Failed to fetch market cap", error);
  }
}

// Initial load + auto-refresh every 60 seconds
fetchPrices();
fetchMarketCap();
setInterval(() => {
  fetchPrices();
  fetchMarketCap();
}, 60000);
