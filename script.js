//===============================js file =========//


<!-- ======================= JS Libraries ======================= -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.12.313/pdf.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>



//=====================second===============
<script>
function convertPdfToJpg(file){
    if(!file){alert('Select PDF');return;}
    let reader=new FileReader();
    reader.onload=function(e){
        pdfjsLib.getDocument({data:e.target.result}).promise.then(pdf=>{
            for(let i=1;i<=pdf.numPages;i++){
                pdf.getPage(i).then(page=>{
                    let viewport=page.getViewport({scale:2});
                    let canvas=document.createElement('canvas');
                    canvas.width=viewport.width;
                    canvas.height=viewport.height;
                    page.render({canvasContext:canvas.getContext('2d'),viewport:viewport}).promise.then(()=>{
                        let link=document.createElement('a');
                        link.href=canvas.toDataURL('image/jpeg');
                        link.download=`page_${i}.jpg`;
                        link.click();
                    });
                });
            }
        });
    }
    reader.readAsArrayBuffer(file);
}
/* JPG → PDF */
async function convertJpgToPdf(files){
    if(!files.length){alert('Select JPG files');return;}
    const { jsPDF } = window.jspdf;
    let pdf=new jsPDF("p","mm","a4");
    for(let i=0;i<files.length;i++){
        let img=await fileToDataURL(files[i]);
        pdf.addImage(img,'JPEG',10,10,180,240);
        if(i<files.length-1) pdf.addPage();
    }
    pdf.save('converted.pdf');
}
function fileToDataURL(file){
    return new Promise(res=>{
        let reader=new FileReader();
        reader.onload=()=>res(reader.result);
        reader.readAsDataURL(file);
    });
}

/* PNG ↔ JPG */
function convertImage(file){
    if(!file){alert('Select Image');return;}
    let reader=new FileReader();
    reader.onload=function(e){
        let img=new Image();
        img.src=e.target.result;
        img.onload=function(){
            let canvas=document.createElement('canvas');
            canvas.width=img.width;
            canvas.height=img.height;
            canvas.getContext('2d').drawImage(img,0,0);
            let ext=file.type==='image/png'?'image/jpeg':'image/png';
            let link=document.createElement('a');
            link.href=canvas.toDataURL(ext);
            link.download='converted.'+(ext==='image/png'?'png':'jpg');
            link.click();
        }
    }
    reader.readAsDataURL(file);
}

/* BMI */
function calcBMIPrompt(){
    let w=prompt('Enter weight (kg):');
    let h=prompt('Enter height (cm):');
    if(!w||!h) return;
    alert('BMI = '+(w/(h/100*h/100)).toFixed(2));
}

/* Age */
function calcAgePrompt(){
    let dob=prompt('Enter birthdate (YYYY-MM-DD):');
    if(!dob) return;
    let age=new Date(Date.now()-new Date(dob).getTime()).getUTCFullYear()-1970;
    alert('Age = '+age+' years');
}

/* QR Generator */
function generateQRPrompt(){
    let txt=prompt('Enter text or URL:');
    if(!txt) return;
    let qr=new QRious({element:document.createElement('canvas'),value:txt,size:200});
    let link=document.createElement('a');
    link.href=qr.toDataURL();
    link.download='qr.png';
    link.click();
}

/* QR Scanner */
function scanQRPrompt(){
    let input=document.createElement('input');
    input.type='file';
    input.accept='image/*';
    input.onchange=function(){
        let file=this.files[0];
        if(!file) return;
        let reader=new FileReader();
        reader.onload=function(e){
            let img=new Image();
            img.src=e.target.result;
            img.onload=function(){
                let canvas=document.createElement('canvas');
                canvas.width=img.width;
                canvas.height=img.height;
                let ctx=canvas.getContext('2d');
                ctx.drawImage(img,0,0);
                let code=jsQR(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);
                alert(code ? "QR Scanned: "+code.data : "QR not detected");
            }
        }
        reader.readAsDataURL(file);
    }
    input.click();
}

</script>

<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>-->

<!--<script>
function generateTextLink() {
    let text = document.getElementById("textInput").value;
    if (!text) { alert("Text likho!"); return; }

    let encoded = encodeURIComponent(text);
    let link = window.location.origin + window.location.pathname + "?text=" + encoded;

    document.getElementById("generatedLink").value = link;

    const qrContainer = document.getElementById("textQr");
    qrContainer.innerHTML = ""; // clear old QR

    // Create QR code
    const qr = new QRCode(qrContainer, {
        text: link,
        width: 200,
        height: 180
    });

    // Add download button **outside** QR canvas
    setTimeout(() => {
        let downloadBtn = document.getElementById("downloadQrBtn");
        if (!downloadBtn) {
            downloadBtn = document.createElement("button");
            downloadBtn.id = "downloadQrBtn";
            downloadBtn.innerText = "Download QR";
            downloadBtn.style.marginTop = "10px";
            downloadBtn.onclick = () => {
                const canvas = qrContainer.querySelector("canvas");
                if (canvas) {
                    const url = canvas.toDataURL("image/png");
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "text_link_qr.png";
                    a.click();
                }
            };
            qrContainer.parentNode.appendChild(downloadBtn); // outside canvas
        }
    }, 100);
}

function copyLink() {
    let input = document.getElementById("generatedLink");
    input.select();
    document.execCommand("copy");
    alert("Link copied!");
}

window.onload = function () {
    let params = new URLSearchParams(window.location.search);
    let text = params.get("text");
    if (text) {
        alert("Text from link:\n\n" + decodeURIComponent(text));
    }
};
function openTextToLink(){
    document.getElementById("tool_textToLink").style.display = "block";
    window.scrollTo({
        top: document.getElementById("tool_textToLink").offsetTop - 20,
        behavior: "smooth"
    });

}
</script>-->

<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>-->

<script>
function generateTextLink() {
    let text = document.getElementById("textInput").value;
    if (!text) {
        alert("Text likho!");
        return;
    }

    let encoded = encodeURIComponent(text);
    let link = window.location.origin + window.location.pathname + "?text=" + encoded;

    document.getElementById("generatedLink").value = link;

    document.getElementById("textQr").innerHTML = "";
    new QRCode(document.getElementById("textQr"), {
        text: link,
        width: 200,
        height: 200
    });
}

function copyLink() {
    let input = document.getElementById("generatedLink");
    input.select();
    document.execCommand("copy");
    alert("Link copied!");
}

window.onload = function () {
    let params = new URLSearchParams(window.location.search);
    let text = params.get("text");
    if (text) {
        alert("Text from link:\n\n" + decodeURIComponent(text));
    }
};
function openTextToLink(){
    document.getElementById("tool_textToLink").style.display = "block";
    window.scrollTo({
        top: document.getElementById("tool_textToLink").offsetTop - 20,
        behavior: "smooth"
    });

}
</script>

<script>// Tool ko open karne ke liye (common function)
function openTool(toolName) {
    let tools = document.querySelectorAll(".toolBox");
    tools.forEach(t => t.style.display = "none");

    let el = document.getElementById("tool_" + toolName);
    if(el) el.style.display = "block";

    window.scrollTo({
        top: el.offsetTop - 20,
        behavior: "smooth"
    });
}
</script>

<script>
document.getElementById("imgQRInput").addEventListener("change", function () {

    const file = this.files[0];
    if (!file) {
        alert("Image select karo");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {

        const imageData = e.target.result;

        // Show preview
        const preview = document.getElementById("imgPreview");
        preview.src = imageData;
        preview.style.display = "block";

        // Generate QR
        const qrContainer = document.getElementById("imgQR");
        qrContainer.innerHTML = "";

        new QRCode(qrContainer, {
            text: imageData,
            width: 200,
            height: 200
        });
    };

    reader.readAsDataURL(file);
});
</script>

<!--// Edit PDF function-->

<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"></script>-->
<script>
async function editPdf() {
    const fileInput = document.getElementById('editPdfInput');
    const textInput = document.getElementById('editPdfText').value.trim();

    if (!fileInput.files.length) { 
        alert("PDF select karo!"); 
        return; 
    }

    if (!textInput) {
        alert("Text likho!");
        return;
    }

    const file = fileInput.files[0];
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF with pdf-lib
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Get first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Add text
    firstPage.drawText(textInput, {
        x: 50,
        y: firstPage.getHeight() - 50,
        size: 14,
        color: rgb(0, 0.53, 0.8), // blue-ish color
    });

    // Save edited PDF
    const pdfBytes = await pdfDoc.save();

    // Download
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'edited.pdf';
    link.click();

    document.getElementById('editPdfPreview').innerText = "Text added and PDF downloaded!";
}
</script>
