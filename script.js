// --- 1. CONFIGURACIÓN DE IDIOMA ---
const translations = {
    de: {
        videoList: "Videoliste",
        newProject: "+ Neues Projekt",
        colThumb: "Miniaturansicht",
        colVideo: "Video",
        colSentDate: "Gesendet am",
        colLink: "YouTube Link",
        back: "Zurück",
        packagerTitle: "Neues Paket erstellen",
        lblTitle: "Titel des Programms",
        lblDesc: "Kurzbeschreibung",
        lblTele: "Teleprompter (HTML)",
        lblThumb: "Thumbnail (JPG/PNG)",
        lblAssets: "Bilder & Video-Clips",
        btnGenerate: "📦 Paket Erstellen & Speichern",
        statusDone: "✅ Paket heruntergeladen und gespeichert!"
    },
    es: {
        videoList: "Lista de Videos",
        newProject: "+ Nuevo Proyecto",
        colThumb: "Miniatura",
        colVideo: "Video",
        colSentDate: "Enviado el",
        colLink: "Enlace YouTube",
        back: "Volver",
        packagerTitle: "Generar Nuevo Paquete",
        lblTitle: "Título del Programa",
        lblDesc: "Descripción corta",
        lblTele: "Teleprompter (HTML)",
        lblThumb: "Thumbnail (JPG/PNG)",
        lblAssets: "Imágenes y Clips",
        btnGenerate: "📦 Generar Paquete y Guardar",
        statusDone: "✅ ¡Paquete descargado y guardado!"
    },
    en: {
        videoList: "Video List",
        newProject: "+ New Project",
        colThumb: "Thumbnail",
        colVideo: "Video",
        colSentDate: "Sent Date",
        colLink: "YouTube Link",
        back: "Back",
        packagerTitle: "Create New Package",
        lblTitle: "Program Title",
        lblDesc: "Short Description",
        lblTele: "Teleprompter (HTML)",
        lblThumb: "Thumbnail (JPG/PNG)",
        lblAssets: "Images & Clips",
        btnGenerate: "📦 Generate Package & Save",
        statusDone: "✅ Package downloaded and saved!"
    }
};

let currentLang = 'de'; // Idioma por defecto

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    // Actualizar textos
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang][key]) el.innerText = translations[lang][key];
    });
}

// --- 2. GESTIÓN DE DATOS (LocalStorage) ---
let projects = JSON.parse(localStorage.getItem('packyt_projects')) || [];

function saveToLocal() {
    localStorage.setItem('packyt_projects', JSON.stringify(projects));
    renderTable();
}

// --- 3. RENDERIZADO DE TABLA ---
function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    // Ordenar por fecha descendente (más nuevo primero)
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    projects.forEach((p, index) => {
        const row = document.createElement('tr');
        
        // Columna Thumbnail (Usamos un placeholder si no hay URL real, ya que no tenemos servidor)
        // Nota: Como no tenemos servidor, no podemos mostrar la imagen real subida hace dias.
        // Usaremos un icono o una imagen base64 si la guardamos (pero base64 llena la memoria rápido).
        // Usaremos un icono genérico de video.
        
        row.innerHTML = `
            <td class="thumb-col">
                <div style="width:120px; height:68px; background:#eee; display:flex; align-items:center; justify-content:center; color:#aaa;">
                    <i class="fas fa-play fa-2x"></i>
                </div>
            </td>
            <td class="video-info">
                <h4>${p.title}</h4>
                <p>${p.desc}</p>
            </td>
            <td>${new Date(p.date).toLocaleDateString()}</td>
            <td>
                <input type="text" class="input-link" 
                       value="${p.ytLink || ''}" 
                       placeholder="https://youtu.be/..." 
                       onblur="updateLink(${index}, this.value)">
                ${p.ytLink ? `<a href="${p.ytLink}" target="_blank"><i class="fas fa-external-link-alt"></i></a>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateLink(index, value) {
    // Nota: El orden visual puede cambiar por el sort, buscamos por ID o titulo seria mejor, 
    // pero para este ejemplo simple usaremos la referencia del array ordenado.
    projects[index].ytLink = value;
    saveToLocal();
}

// --- 4. NAVEGACIÓN ---
function openPackager() {
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-packager').classList.remove('hidden');
}

function openDashboard() {
    document.getElementById('view-packager').classList.add('hidden');
    document.getElementById('view-dashboard').classList.remove('hidden');
    renderTable();
}

// Previsualizar Thumbnail en el formulario
function previewThumb(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('thumbPreview');
            img.src = e.target.result;
            img.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// --- 5. GENERAR ZIP (CORE) ---
async function generateZip() {
    const title = document.getElementById('pTitle').value || "Project";
    const desc = document.getElementById('pDesc').value || "";
    const zip = new JSZip();

    // Archivos
    const teleFile = document.getElementById('fTele').files[0];
    const thumbFile = document.getElementById('fThumb').files[0];
    const assetsFiles = document.getElementById('fAssets').files;

    if (!teleFile) { alert("Teleprompter HTML fehlt!"); return; }

    // 1. Crear estructura ZIP
    zip.file("01_Teleprompter/" + teleFile.name, teleFile);
    
    if(thumbFile) {
        // Renombramos siempre a thumbnail para consistencia, manteniendo la extensión
        const ext = thumbFile.name.split('.').pop();
        zip.file(`02_Thumbnail/thumbnail.${ext}`, thumbFile);
    }

    const folderAssets = zip.folder("03_Assets");
    for (let i = 0; i < assetsFiles.length; i++) {
        folderAssets.file(assetsFiles[i].name, assetsFiles[i]);
    }

    // 2. Guardar en historial
    const newProject = {
        title: title,
        desc: desc,
        date: new Date().toISOString(),
        ytLink: ""
    };
    projects.push(newProject);
    saveToLocal();

    // 3. Descargar
    const content = await zip.generateAsync({type:"blob"});
    saveAs(content, `${title}_Pack.zip`);
    
    alert(translations[currentLang].statusDone);
    openDashboard();
}

// Inicializar
setLang('de');
renderTable();
