const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const templateImg = new Image();
templateImg.src = "template.png";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz7bG6uuuqFa9cC06B8EhPkxRHkMg7OUP0AHofcBmgJpU4OGS9XrtyYj1IsFEozESpG/exec";


// ===============================
// 產生圖片（等待完成）
// ===============================
function generateImage() {
  return new Promise((resolve, reject) => {

    const file = document.getElementById("imgInput").files[0];
    const name = document.getElementById("name").value.trim();
    const comment = document.getElementById("comment").value.trim();

    if (!file || !name || !comment) {
      alert("請填寫完整資料");
      reject("資料不完整");
      return;
    }

    const userImg = new Image();
    userImg.src = URL.createObjectURL(file);

    userImg.onload = () => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 畫背景
      ctx.drawImage(templateImg, 0, 0, 1080, 1920);

      // 畫名字
      ctx.fillStyle = "#000";
      ctx.font = "bold 34px Arial";
      ctx.fillText(`顧客：${name}`, 330, 580);

      // 畫圖片
      ctx.drawImage(userImg, 290, 620, 500, 500);

      // 畫評價
      ctx.font = "28px Arial";
      wrapText(ctx, `評價：${comment}`, 330, 1160, 420, 40);

      // 🔥 等一幀確保 canvas 完全渲染
      requestAnimationFrame(() => {
        resolve();
      });
    };

    userImg.onerror = () => {
      reject("圖片載入失敗");
    };

  });
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
// 點擊送出
// ===============================
async function sendToYou() {

  const btn = event.target;
  btn.disabled = true;
  btn.innerText = "處理中...";

  try {

    // 1️⃣ 產生圖片（等待完成）
    await generateImage();

    // 2️⃣ 轉 base64
    const imageData = canvas.toDataURL("image/png");

    // 3️⃣ 組檔名
    const now = new Date();
    const fileName =
      `review_${now.getFullYear()}_${now.getMonth()+1}_${now.getDate()}_${Date.now()}.png`;

    const payload = {
      image: imageData,
      fileName: fileName
    };

    // 4️⃣ 上傳並等待成功
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: JSON.stringify(payload)
    });

    // 5️⃣ 成功才顯示
    alert("您的訂單評價已送出，期待再次為您服務!!!");

  } catch (err) {
    alert("發生錯誤，請稍後再試");
    console.log(err);
  }

  btn.disabled = false;
  btn.innerText = "送出評價";
}
