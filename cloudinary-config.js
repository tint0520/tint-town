// 請用你自己的 Cloudinary 帳號設定
const cloudName = "你的cloudinary帳號名稱";
const uploadPreset = "你的unsigned preset名稱";

// 壓縮 + 上傳圖片
async function uploadImageToCloudinary(file) {
  return new Promise((resolve, reject) => {
    // 壓縮圖片
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800; // 最長邊最大 800px
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const formData = new FormData();
          formData.append('file', blob);
          formData.append('upload_preset', uploadPreset);

          fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
          })
            .then(response => response.json())
            .then(data => {
              resolve(data.secure_url); // 回傳圖片網址
            })
            .catch(error => {
              reject(error);
            });
        }, 'image/jpeg', 0.8); // 壓縮為 JPEG, 壓縮品質 80%
      };
    };
  });
}
