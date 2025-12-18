pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.worker.min.js';
function convertPdfToJpg(file){
    if(!file){alert('Select PDF'); return;}
    let reader = new FileReader();
    reader.onload = function(e){
        pdfjsLib.getDocument({data: e.target.result}).promise.then(pdf=>{
            const zip = new JSZip();
            let processed = 0;

            for(let i=1; i <= pdf.numPages; i++){
                pdf.getPage(i).then(page=>{
                    let viewport = page.getViewport({scale:2});
                    let canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    page.render({canvasContext: canvas.getContext('2d'), viewport: viewport}).promise.then(()=>{
                        canvas.toBlob(blob=>{
                            zip.file(`page_${i}.jpg`, blob);
                            processed++;

                            // After last page processed, generate ZIP
                            if(processed === pdf.numPages){
                                zip.generateAsync({type:"blob"}).then(content=>{
                                    saveAs(content, "converted_pages.zip");
                                });
                            }
                        }, 'image/jpeg', 0.95);
                    });
                });
            }
        });
    }
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

/**************** Text → Link ****************/
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


