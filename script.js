// ========== Atom Logo Animation ==========

const canvas = document.getElementById('atom-logo');
const ctx = canvas.getContext('2d');

// Manually set canvas size and scaling
const width = 400; // display width in pixels
const height = 120; // display height in pixels
const scaleFactor = 2; // for high-resolution canvas

canvas.width = width * scaleFactor;
canvas.height = height * scaleFactor;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';
ctx.scale(scaleFactor, scaleFactor);

// Atom center
const x_c = 40;
const y_c = height / 2;

// Atom electron orbits and spot sizes
const ellipses = [
  { a: 33, b: 4, theta: Math.PI / 4 + 0.02, speed: 0.03, phase: 0, size: 3 },
  { a: 33, b: 4, theta: Math.PI / 4 + 0.02, speed: 0.025, phase: Math.PI / 3, size: 3 },
  { a: 43, b: 5, theta: 3 * Math.PI / 4 + 0.03, speed: 0.02, phase: Math.PI / 2, size: 3 }
];

const atomImg = new Image();
atomImg.src = './assets/img/cryptolaxy_logo_atom.svg';

const textLogo = new Image();
textLogo.src = './assets/img/cryptolaxy_logo_text.png';

let time = 0;

// Wait for both images to load
Promise.all([
  new Promise(resolve => atomImg.onload = resolve),
  new Promise(resolve => textLogo.onload = resolve)
]).then(() => {
  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;

    // Draw atom image
    const logoSize = 75;
    ctx.drawImage(atomImg, x_c - logoSize / 2, y_c - logoSize / 2, logoSize, logoSize);

    // Animate electrons
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

    // Draw logo text image (aligned with atom)
    const textWidth = 200;
    const textHeight = textLogo.height * (textWidth / textLogo.width);
    const textX = x_c + logoSize / 2 + 5;
    const textY = y_c - textHeight / 2;

    ctx.drawImage(textLogo, textX, textY, textWidth, textHeight);

    time += 1;
    requestAnimationFrame(draw);
  }

  draw();
});


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

// === Mobile Nav Toggle ===
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.querySelector(".nav ul");

  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
  });
});

// === Tokens moving strip ===

const tokens = [
  { id: 'bitcoin', name: 'Bitcoin', ticker: 'BTC' },
  { id: 'ethereum', name: 'Ethereum', ticker: 'ETH' },
  { id: 'solana', name: 'Solana', ticker: 'SOL' },
  { id: 'ripple', name: 'Ripple', ticker: 'XRP' },
  { id: 'binancecoin', name: 'BNB', ticker: 'BNB' },
  { id: 'dogecoin', name: 'Dogecoin', ticker: 'DOGE' },
  { id: 'cardano', name: 'Cardano', ticker: 'ADA' },
  { id: 'tron', name: 'Tron', ticker: 'TRX' },
];

async function fetchTokenTickerData() {
  const ids = tokens.map(t => t.id).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const content = tokens.map(token => {
      const price = data[token.id].usd.toFixed(2);
      const change = data[token.id].usd_24h_change.toFixed(2);
      const direction = change >= 0 ? '↑' : '↓';
      const changeColor = change >= 0 ? '#00ff00' : '#ff5050';

      return `
        <div class="token-item">
          <img src="./assets/img/main_tokens/${token.ticker}.png" alt="${token.ticker}">
          <span>${token.name} ${token.ticker} $${price} <span style="color:${changeColor}">${direction}${Math.abs(change)}%</span></span>
        </div>
      `;
    }).join('');

    // Add margin-left to the first item in the cloned row (BTC)
    const contentWithGap = content.replace(
      'class="token-item"',
      'class="token-item" style="margin-left: 30px;"' // match your .gap value
    );

    // Inject both original and spaced duplicate
    document.getElementById('ticker-content').innerHTML = content;
    document.getElementById('ticker-content-clone').innerHTML = contentWithGap;
  } catch (err) {
    console.error("Ticker fetch error:", err);
  }
}

// Load & update every 10 min
fetchTokenTickerData();
setInterval(fetchTokenTickerData, 10 * 60 * 1000);

document.getElementById("scrollTopBtn").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
  scrollTopBtn.style.display = window.scrollY > 300 ? "block" : "none";
});

// Start hidden
scrollTopBtn.style.display = "none";
