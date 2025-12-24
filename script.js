async function generatePack() {
    const status = document.getElementById('statusMsg');
    const projectName = document.getElementById('projectName').value || "Proyecto_Sin_Nombre";
    
    // Inicializar JSZip
    const zip = new JSZip();
    
    // Obtener archivos de los inputs
    const teleprompter = document.getElementById('teleprompterFile').files[0];
    const thumbnail = document.getElementById('thumbnailFile').files[0];
    const assets = document.getElementById('assetsFiles').files;
    const instructions = document.getElementById('instructions').value;

    // Validación básica
    if (!teleprompter) {
        alert("⚠️ ¡Falta el archivo del Teleprompter!");
        return;
    }

    status.innerText = "⏳ Procesando archivos... por favor espera.";

    // 1. Crear carpeta y archivo de Instrucciones
    // Agregamos la fecha y las instrucciones que escribiste en el area de texto
    const date = new Date().toLocaleDateString();
    const readmeContent = `PROYECTO: ${projectName}\nFECHA: ${date}\n\nINSTRUCCIONES DE EDICIÓN:\n-------------------------\n${instructions}`;
    zip.file("LEEME_Instrucciones.txt", readmeContent);

    // 2. Agregar Teleprompter (Carpeta 01)
    const folderTele = zip.folder("01_Teleprompter");
    folderTele.file(teleprompter.name, teleprompter);

    // 3. Agregar Thumbnail (Carpeta 02)
    const folderThumb = zip.folder("02_Thumbnail");
    if (thumbnail) {
        folderThumb.file(thumbnail.name, thumbnail);
    }

    // 4. Agregar Assets (Carpeta 03)
    const folderAssets = zip.folder("03_Assets_Media");
    if (assets.length > 0) {
        for (let i = 0; i < assets.length; i++) {
            folderAssets.file(assets[i].name, assets[i]);
        }
    }

    // 5. Generar el ZIP y descargar
    status.innerText = "📦 Comprimiendo paquete...";
    
    try {
        const content = await zip.generateAsync({type:"blob"});
        const zipName = `${projectName}_Pack_Completo.zip`;
        saveAs(content, zipName); // Función de FileSaver.js
        status.innerText = "✅ ¡Listo! El archivo se ha descargado.";
    } catch (e) {
        status.innerText = "❌ Error al generar el zip: " + e.message;
        console.error(e);
    }
}
