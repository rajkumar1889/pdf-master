// PDF.js worker (version SAME as CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

// PDF → JPG
async function convertPdfToJpg(file) {
    if (!file) {
        alert("Please select a PDF");
        return;
    }

    const preview = document.getElementById("pdfJpgPreview");
    preview.innerHTML = "Processing PDF...";

    const reader = new FileReader();

    reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

        preview.innerHTML = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            const img = document.createElement("img");
            img.src = canvas.toDataURL("image/jpeg", 1.0);
            preview.appendChild(img);
        }
    };

    reader.readAsArrayBuffer(file);
}
/**************** JPG → PDF ****************/
async function convertJpgToPdf(files) {
  if (!files.length) {
    alert("Select JPG files");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < files.length; i++) {
    const img = await fileToDataURL(files[i]);
    if (i > 0) pdf.addPage();
    pdf.addImage(img, "JPEG", 10, 10, 190, 270);
  }

  pdf.save("converted.pdf");
}

function fileToDataURL(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

/**************** PNG ↔ JPG ****************/
function convertImage(file) {
  if (!file) return alert("Select image");

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);

      const type =
        file.type === "image/png" ? "image/jpeg" : "image/png";
      const link = document.createElement("a");
      link.href = canvas.toDataURL(type);
      link.download = type === "image/png" ? "converted.png" : "converted.jpg";
      link.click();
    };
  };
  reader.readAsDataURL(file);
}

/**************** BMI ****************/
function calcBMIPrompt() {
  const w = prompt("Weight (kg)");
  const h = prompt("Height (cm)");
  if (!w || !h) return;
  const bmi = w / ((h / 100) ** 2);
  alert("BMI = " + bmi.toFixed(2));
}

/**************** Age ****************/
function calcAgePrompt() {
  const dob = prompt("Birthdate (YYYY-MM-DD)");
  if (!dob) return;
  const age =
    new Date().getFullYear() - new Date(dob).getFullYear();
  alert("Age = " + age);
}

/**************** QR Generator ****************/
function generateQRPrompt() {
  const txt = prompt("Enter text or URL");
  if (!txt) return;

  const qr = new QRious({
    value: txt,
    size: 200
  });

  const link = document.createElement("a");
  link.href = qr.toDataURL();
  link.download = "qr.png";
  link.click();
}

/**************** QR Scanner ****************/
function scanQRPrompt() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const code = jsQR(
          ctx.getImageData(0, 0, canvas.width, canvas.height).data,
          canvas.width,
          canvas.height
        );

        alert(code ? code.data : "QR not found");
      };
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

/**************** Text → Link ****************
function generateTextLink() {
  const text = document.getElementById("textInput").value;
  if (!text) return alert("Text likho!");

  const link =
    location.origin + location.pathname + "?text=" + encodeURIComponent(text);

  document.getElementById("generatedLink").value = link;
  document.getElementById("textQr").innerHTML = "";

  new QRCode(document.getElementById("textQr"), {
    text: link,
    width: 200,
    height: 200
  });
}
// Open Text → Link Tool
function openTextToLink() {
    const box = document.getElementById("tool_textToLink");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

// Generate Link and QR Code
function generateTextLink() {
    let text = document.getElementById("textInput").value.trim();
    if(!text) return alert("Please enter some text!");

    // Encode text as URL parameter
    let encodedText = encodeURIComponent(text);
    let link = `${window.location.origin}/?text=${encodedText}`;

    document.getElementById("generatedLink").value = link;

    // Generate QR Code
    const qrDiv = document.getElementById("textQr");
    qrDiv.innerHTML = ""; // Clear previous QR
    new QRious({
        element: document.createElement('canvas'),
        value: link,
        size: 200,
        level: 'H',
        background: 'white',
        foreground: 'black'
    });

    qrDiv.appendChild(qrDiv.querySelector('canvas') || qrDiv.firstChild);
}*/
// Open/close Text → Link Tool Box
function openTextToLink() {
    const box = document.getElementById("tool_textToLink");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

// Generate link + QR code
function generateTextLink() {
    let text = document.getElementById("textInput").value.trim();
    if(!text) return alert("Please enter some text!");

    let encodedText = encodeURIComponent(text);
    let link = `${window.location.origin}/?text=${encodedText}`;
    document.getElementById("generatedLink").value = link;

    const qrDiv = document.getElementById("textQr");
    qrDiv.innerHTML = ""; // clear old QR

    let qr = new QRious({
        element: document.createElement('canvas'),
        value: link,
        size: 200,
        level: 'H'
    });
    qrDiv.appendChild(qr.canvas);
}


/**************** Tool Open ****************/
function openTool(tool) {
  document.querySelectorAll(".toolBox").forEach(t => t.style.display = "none");
  const el = document.getElementById("tool_" + tool);
  if (el) el.style.display = "block";
}

/**************** Edit PDF ****************/
async function editPdf() {
  const file = document.getElementById("editPdfInput").files[0];
  const text = document.getElementById("editPdfText").value;

  if (!file || !text) return alert("PDF aur text dono chahiye");

  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(bytes);
  const page = pdfDoc.getPages()[0];

  page.drawText(text, { x: 50, y: page.getHeight() - 50 });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "edited.pdf";
  link.click();
}









