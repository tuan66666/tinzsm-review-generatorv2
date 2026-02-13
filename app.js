const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const templateImg = new Image();
templateImg.src = "template.png";

const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");

const GOOGLE_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbz7bG6uuuqFa9cC06B8EhPkxRHkMg7OUP0AHofcBmgJpU4OGS9XrtyYj1IsFEozESpG/exec";


// ===============================
// 產生圖片
// ===============================
function generate() {

  const file = document.getElementById("imgInput").files[0];
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!file || !name || !comment) {
    alert("請填寫完整資料");
    return false;
  }

  const userImg = new Image();
  userImg.src = URL.createObjectURL(file);

  userImg.onload = () => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(templateImg, 0, 0, 1080, 1920);

    ctx.fillStyle = "#000";
    ctx.font = "bold 34px Arial";
    ctx.fillText(`顧客：${name}`, 330, 580);

    ctx.drawImage(userImg, 290, 620, 500, 500);

    ctx.font = "28px Arial";
    wrapText(ctx, `評價：${comment}`, 330, 1160, 420, 40);
  };

  return true;
}


// ===============================
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  let line = "";
  for (let char of text) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}


// ===============================
// 進度條動畫（跑到 90%）
// ===============================
function startProgress() {
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 8;

    if (progress >= 90) {
      progress = 90;
      clearInterval(interval);
    }

    progressBar.style.width = progress + "%";
  }, 200);

  return interval;
}


// ===============================
// 送出評價
// ===============================
async function sendToYou() {

  const btn = event.target;
  btn.disabled = true;
  btn.innerText = "處理中...";

  try {

    // 1️⃣ 產圖
    const ok = generate();
    if (!ok) {
      btn.disabled = false;
      btn.innerText = "送出評價";
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    // 2️⃣ 進度條開始
    const progressInterval = startProgress();

    // 3️⃣ 轉圖
    const imageData = canvas.toDataURL("image/png");

    const now = new Date();
    const fileName =
      `review_${now.getFullYear()}_${now.getMonth()+1}_${now.getDate()}_${Date.now()}.png`;

    const payload = {
      image: imageData,
      fileName: fileName
    };

    // 4️⃣ 上傳
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload)
    });

    // 5️⃣ 直接跳到 100%
    progressBar.style.width = "100%";

    setTimeout(() => {
      alert("您的訂單評價已送出，期待再次為您服務!!!");
      progressContainer.style.display = "none";
      progressBar.style.width = "0%";
      btn.innerText = "送出評價";
      btn.disabled = false;
    }, 500);

  } catch (err) {
    alert("發生錯誤，請稍後再試");
    progressContainer.style.display = "none";
    progressBar.style.width = "0%";
    btn.innerText = "送出評價";
    btn.disabled = false;
  }
}
