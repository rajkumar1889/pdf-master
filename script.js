// ---------- Setup for pdf.js worker ----------
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js";
}

// ---------- Any File placeholder ----------
function anyFileConvert() {
  let file = document.getElementById("fileUpload").files[0];
  let format = document.getElementById("anyFileFormat").value;
  if (!file) { alert("Select a file!"); return; }
  alert(`Placeholder: ${file.name} → ${format}. Backend needed for real conversion.`);
  document.getElementById("anyFileResult").innerText = `Converted ${file.name} to ${format} (placeholder).`;
}

// ---------- Image Convert (PNG/JPG) ----------
function convertImage() {
  let file = document.getElementById("imageFile").files[0];
  let format = document.getElementById("format").value;
  if (!file || !file.type.startsWith("image/")) { alert("Select an image!"); return; }
  let reader = new FileReader();
  reader.onload = function (e) {
    let img = new Image(); img.src = e.target.result;
    img.onload = function () {
      let canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      let ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0);
      let dataURL = canvas.toDataURL(format, 0.9);
      let link = document.createElement("a"); link.href = dataURL;
      let ext = format === "image/png" ? "png" : "jpg"; link.download = "converted_image." + ext; link.click();
      document.getElementById("imageResult").innerHTML = `<img src="${dataURL}" width="200">`;
    };
  };
  reader.readAsDataURL(file);
}

// ---------- PDF -> JPG (renders all pages, creates download links) ----------
async function convertPdfToJpg() {
  const input = document.getElementById("pdfFile");
  const out = document.getElementById("pdfResult");
  out.innerHTML = "";
  if (!input.files || !input.files[0]) { alert("Select a PDF file!"); return; }

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async function () {
    try {
      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument(typedarray).promise;
      const total = pdf.numPages;
      out.innerHTML = `<p>PDF loaded, ${total} page(s). Rendering...</p>`;
      for (let p = 1; p <= total; p++) {
        const page = await pdf.getPage(p);
        const scale = 2; // increase for higher quality
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        // create download link and preview
        const div = document.createElement("div");
        div.innerHTML = `<p>Page ${p}:</p>`;
        const img = document.createElement("img"); img.src = dataUrl; img.width = 200;
        const a = document.createElement("a"); a.href = dataUrl; a.download = `page-${p}.jpg`; a.innerText = "Download JPG";
        div.appendChild(img); div.appendChild(document.createElement("br")); div.appendChild(a);
        out.appendChild(div);
      }
    } catch (err) {
      console.error(err);
      alert("Error processing PDF: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

/* ------------------- JPG → PDF with VIEW ------------------ */

function previewJpg() {
    let files = document.getElementById("jpgToPdf").files;
    let preview = document.getElementById("jpgPreview");
    preview.innerHTML = "";

    if (!files.length) {
        alert("Select images first");
        return;
    }

    [...files].forEach(file => {
        let reader = new FileReader();
        reader.onload = function(e) {
            let img = document.createElement("img");
            img.src = e.target.result;
            img.width = 120;
            img.style.border = "1px solid #ccc";
            img.style.borderRadius = "5px";
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

async function convertJpgToPdf() {
    const { jsPDF } = window.jspdf;
    let pdf = new jsPDF();

    let files = document.getElementById("jpgToPdf").files;
    if (!files.length) return alert("Select JPG images!");

    for (let i = 0; i < files.length; i++) {
        let imgData = await fileToDataURL(files[i]);
        pdf.addImage(imgData, 'JPEG', 10, 10, 180, 250);

        if (i < files.length - 1)
            pdf.addPage();
    }

    pdf.save("converted.pdf");
    document.getElementById("jpgPdfResult").innerHTML = "✔ PDF Generated & Downloaded!";
}

function fileToDataURL(file) {
    return new Promise(res => {
        let reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(file);
    });
}


  // load each image sequentially
  let first = true;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const dataUrl = await readFileAsDataURL(file);
    const img = await createImage(dataUrl);
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (img.height * pdfWidth) / img.width;
    if (!first) pdf.addPage();
    pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    first = false;
  }
  pdf.save("converted_images.pdf");
  out.innerText = "JPG(s) converted to PDF and downloaded.";


function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function createImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

// ---------- PDF Compress (basic front-end): re-render pages to JPEG at given quality and rebuild PDF ----------
async function compressPdf() {
  const input = document.getElementById("compressPdfFile");
  const out = document.getElementById("compressResult");
  out.innerHTML = "";
  if (!input.files || !input.files[0]) { alert("Select a PDF file!"); return; }
  let quality = parseFloat(document.getElementById("compressQuality").value);
  if (isNaN(quality) || quality <= 0 || quality > 1) { alert("Enter quality between 0.1 and 1.0"); return; }

  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = async function () {
    try {
      const typedarray = new Uint8Array(this.result);
      const pdfOriginal = await pdfjsLib.getDocument(typedarray).promise;
      const total = pdfOriginal.numPages;
      out.innerHTML = `<p>Compressing ${total} page(s)... This may take time.</p>`;
      const { jsPDF } = window.jspdf;
      const pdfNew = new jsPDF();
      let first = true;
      for (let p = 1; p <= total; p++) {
        const page = await pdfOriginal.getPage(p);
        const scale = 1.5; // lower/higher influences quality/size
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
        // get compressed JPEG dataURL
        const jpegDataUrl = canvas.toDataURL("image/jpeg", quality);
        // add to PDF (fit to page width)
        const pdfWidth = pdfNew.internal.pageSize.getWidth();
        const img = await createImage(jpegDataUrl);
        const pdfHeight = (img.height * pdfWidth) / img.width;
        if (!first) pdfNew.addPage();
        pdfNew.addImage(jpegDataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        first = false;
      }
      pdfNew.save("compressed.pdf");
      out.innerText = "Compression complete — downloaded compressed.pdf";
    } catch (err) {
      console.error(err);
      alert("Error during compression: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

// ---------- QR Generate & Download ----------
function generateQRCode() {
  const text = document.getElementById("qrText").value;
  const out = document.getElementById("qrResult");
  out.innerHTML = "";
  if (!text) { alert("Enter text or URL to encode"); return; }
  new QRCode(out, { text, width: 200, height: 200, colorDark: "#000", colorLight: "#fff" });
}
function downloadQRCode() {
  const img = document.querySelector("#qrResult img");
  const canvas = document.querySelector("#qrResult canvas");
  let url = null;
  if (img) url = img.src;
  else if (canvas) url = canvas.toDataURL("image/png");
  if (!url) { alert("Generate QR first"); return; }
  const a = document.createElement("a"); a.href = url; a.download = "qrcode.png"; a.click();
}

// ---------- QR Scan from image ----------
function scanQRCode() {
  const input = document.getElementById("qrFile");
  const out = document.getElementById("qrScanResult");
  out.innerText = "";
  if (!input.files || !input.files[0]) { alert("Select an image with a QR code"); return; }
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) out.innerText = "QR Code Text: " + code.data;
      else out.innerText = "No QR code detected in image.";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}


// ---------- Small tools ----------
function calculateBMI() {
  const w = parseFloat(document.getElementById("bmiWeight").value);
  const h = parseFloat(document.getElementById("bmiHeight").value);
  if (!w || !h) { alert("Enter weight (kg) and height (cm)"); return; }
  const heightM = h / 100;
  const bmi = w / (heightM * heightM);
  document.getElementById("bmiResult").innerText = `BMI: ${bmi.toFixed(2)}`;
}
function calculateAge() {
  const v = document.getElementById("birthDate").value;
  if (!v) { alert("Select birth date"); return; }
  const b = new Date(v);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  document.getElementById("ageResult").innerText = `Age: ${age} years`;
}
function createLink() {
  let text = document.getElementById("linkText").value.trim();
  let result = document.getElementById("linkResult");

  if (!text) {
    alert("Enter text or URL");
    return;
  }

  // अगर http / https नहीं है तो auto add करो
  if (!text.startsWith("http://") && !text.startsWith("https://")) {
    text = "https://" + text;
  }

  result.innerHTML = `
    <p>Generated Link:</p>
    <a href="${text}" target="_blank">${text}</a>
  `;
}
