const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const templateImg = new Image();
templateImg.src = "template.png";

// 👉 你的 Apps Script Web App URL
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyj2M0Owz7MPu86PcW0aPjRTQRYq6YmChjd1Lge_-nWMnvLCToEdX0rlyxhfPDg_N1m/exec"

function generate() {
  const file = document.getElementById("imgInput").files[0];
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!file || !name || !comment) {
    alert("請填寫完整資料");
    return;
  }

  const userImg = new Image();
  userImg.src = URL.createObjectURL(file);

  userImg.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 背景
    ctx.drawImage(templateImg, 0, 0, 1080, 1920);

    // 名字
    ctx.fillStyle = "#000";
    ctx.font = "bold 34px Arial";
    ctx.fillText(`顧客：${name}`, 330, 580);

    // 圖片
    ctx.drawImage(userImg, 290, 620, 500, 500);

    // 評價
    ctx.font = "28px Arial";
    wrapText(
      ctx,
      `評價：${comment}`,
      330,
      1160,
      420,
      40
    );
  };
}

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

function sendToYou() {
  if (canvas.width === 0 || canvas.height === 0) {
    alert("請先產生圖片");
    return;
  }

  const payload = {
    image: canvas.toDataURL("image/png")
  };

  fetch("https://script.google.com/macros/s/AKfycbyj2M0Owz7MPu86PcW0aPjRTQRYq6YmChjd1Lge_-nWMnvLCToEdX0rlyxhfPDg_N1m/exec", {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain"
    },
    body: JSON.stringify(payload)
  });

  alert("已送出，圖片已上傳至 Google Drive ✅");
}


