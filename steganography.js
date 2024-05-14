function textToBinary(text) {
    const bits = [];
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      const charBits = char.toString(2).padStart(8, "0");
      for (let j = 0; j < charBits.length; j++) {
        bits.push(parseInt(charBits[j], 10));
      }
    }
    return bits;
  }
  
  function binaryTotext(bits) {
    let text = "";
    const bitsCount = bits.length;
    for (let i = 0; i < bitsCount; i += 8) {
      const charBits = bits.slice(i, i + 8);
      const char = String.fromCharCode(parseInt(charBits.join(""), 2));
      text += char;
    }
    return text;
  }
  
  function encodeMessage(imageData, message) {
    const messageBits = textToBinary(message);
    let bitIndex = 0;
  
    for (let i = 0; i < imageData.data.length; i += 4) {
     
      const pixel = [
        imageData.data[i], 
        imageData.data[i + 1],
        imageData.data[i + 2], 
        imageData.data[i + 3],
      ];
  
            for (let j = 0; j < 3; j++) {
        if (bitIndex < messageBits.length) {
          const lsb = pixel[j] & 1; 
          pixel[j] = (pixel[j] & 0xfe) | messageBits[bitIndex]; 
          bitIndex++;
        } else {
          
          pixel[j] = (pixel[j] & 0xfe) | 0;
        }
      }
  
      
      imageData.data[i] = pixel[0];
      imageData.data[i + 1] = pixel[1];
      imageData.data[i + 2] = pixel[2];
      imageData.data[i + 3] = pixel[3];
    }
  
    return imageData;
  }
  
  
  function decodeMessage(imageData) {
    const bits = [];
  
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixel = [
        imageData.data[i], 
        imageData.data[i + 1],
        imageData.data[i + 2],
        imageData.data[i + 3],
      ];
  
      for (let j = 0; j < 3; j++) {
        const lsb = pixel[j] & 1;
        bits.push(lsb);
      }
  
      
      if (bits.length % 8 === 0) {
        const decodedMessage = binaryTotext(bits);
        if (decodedMessage.includes("\u0000")) {

          return decodedMessage.split("\u0000")[0];
        }
      }
    }
  
   
    return binaryTotext(bits);
  }
  
  
  const encodeImageInput = document.getElementById("image-input");
  const encodeMessageInput = document.getElementById("message-input");
  const encodeBtn = document.getElementById("encode-btn");
  const encodedImageContainer = document.getElementById(
    "encoded-image-container"
  );
  const encodeFileNameSpan = document.getElementById("file-name");
  
  if (
    encodeImageInput &&
    encodeMessageInput &&
    encodeBtn &&
    encodedImageContainer &&
    encodeFileNameSpan
  ) {
    encodeImageInput.addEventListener("change", () => {
      const file = encodeImageInput.files[0];
      if (file) {
        encodeFileNameSpan.textContent = file.name;
      } else {
        encodeFileNameSpan.textContent = "Pilih Gambar";
      }
    });
  
    encodeBtn.addEventListener("click", () => {
      const file = encodeImageInput.files[0];
      const message = encodeMessageInput.value;
  
      if (!file) {
        alert("Pilih gambar terlebih dahulu.");
        return;
      }
  
      if (!message) {
        alert("Masukkan pesan yang ingin dienkode.");
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          const imageData = context.getImageData(0, 0, image.width, image.height);
          const encodedImageData = encodeMessage(imageData, message);
          context.putImageData(encodedImageData, 0, 0);
          encodedImageContainer.innerHTML = "";
          const encodedImage = document.createElement("img");
          encodedImage.src = canvas.toDataURL();
          encodedImageContainer.appendChild(encodedImage);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  
  const saveImageBtn = document.getElementById("save-image-btn");
  
  if (saveImageBtn) {
    saveImageBtn.addEventListener("click", () => {
      const encodedImage = encodedImageContainer.querySelector("img");
      if (encodedImage) {
        const link = document.createElement("a");
        link.download = "encode.png";
        link.href = encodedImage.src;
        link.click();
      }
      if (!encodedImage) {
        alert("Tidak ada gambar terenkode yang dapat disimpan.");
        return;
      }
    });
  }
  
  
  const resetBtnEncode = document.getElementById("reset-btn");
  
  if (resetBtnEncode) {
    resetBtnEncode.addEventListener("click", () => {
      encodeImageInput.value = ""; 
      encodeMessageInput.value = "";
      encodedImageContainer.innerHTML = ""; 
      encodeFileNameSpan.textContent = "Pilih Gambar"; 
    });
  }
  
  
  const decodeImageInput = document.getElementById("image-input");
  const decodeBtn = document.getElementById("decode-btn");
  const decodedMessageContainer = document.getElementById(
    "decoded-message-container"
  );
  const decodeFileNameSpan = document.getElementById("file-name");
  
  if (
    decodeImageInput &&
    decodeBtn &&
    decodedMessageContainer &&
    decodeFileNameSpan
  ) {
    decodeImageInput.addEventListener("change", () => {
      const file = decodeImageInput.files[0];
      if (file) {
        decodeFileNameSpan.textContent = file.name;
      } else {
        decodeFileNameSpan.textContent = "Pilih Gambar";
      }
    });
  
    decodeBtn.addEventListener("click", () => {
      const file = decodeImageInput.files[0];
  
      if (!file) {
        alert("Pilih gambar terlebih dahulu.");
        return;
      }
  
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          const imageData = context.getImageData(0, 0, image.width, image.height);
          const decodedMessage = decodeMessage(imageData);
          decodedMessageContainer.innerHTML = "";
          const messageElement = document.createElement("p");
          messageElement.textContent = decodedMessage;
          decodedMessageContainer.appendChild(messageElement);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  
  
  const resetBtnDecode = document.getElementById("reset-btn");
  
  if (resetBtnDecode) {
    resetBtnDecode.addEventListener("click", () => {
      decodeImageInput.value = ""; 
      decodedMessageContainer.innerHTML = "";
      decodeFileNameSpan.textContent = "Pilih Gambar";
    });
  }
  