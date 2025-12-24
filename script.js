/* --- CONFIGURACIÓN DE IDIOMA --- */
const translations = {
    de: {
        packagerTitle: "Neues Paket erstellen",
        lblTitle: "PROGRAMM TITEL",
        lblDesc: "BESCHREIBUNG",
        lblTele: "TELEPROMPTER (HTML)",
        lblThumb: "THUMBNAIL (BILD)",
        lblAssets: "MEDIEN (VIDEOS/BILDER)",
        btnGenerate: "PAKET ERSTELLEN",
        modalTitle: "YouTube Link speichern",
        menuOpen: "Auf YouTube öffnen",
        menuEdit: "Link bearbeiten",
        menuDelete: "Löschen",
        statusSent: "Gesendet am"
    },
    es: {
        packagerTitle: "Crear Nuevo Paquete",
        lblTitle: "TÍTULO DEL PROGRAMA",
        lblDesc: "DESCRIPCIÓN",
        lblTele: "TELEPROMPTER (HTML)",
        lblThumb: "PORTADA (THUMBNAIL)",
        lblAssets: "MEDIOS (VIDEOS/IMÁGENES)",
        btnGenerate: "GENERAR PAQUETE",
        modalTitle: "Guardar enlace YouTube",
        menuOpen: "Ver en YouTube",
        menuEdit: "Editar Enlace",
        menuDelete: "Eliminar",
        statusSent: "Enviado el"
    },
    en: {
        packagerTitle: "Create New Package",
        lblTitle: "PROGRAM TITLE",
        lblDesc: "DESCRIPTION",
        lblTele: "TELEPROMPTER (HTML)",
        lblThumb: "THUMBNAIL IMAGE",
        lblAssets: "ASSETS (CLIPS/PICS)",
        btnGenerate: "GENERATE PACK",
        modalTitle: "Save YouTube Link",
        menuOpen: "Open on YouTube",
        menuEdit: "Edit Link",
        menuDelete: "Delete",
        statusSent: "Sent on"
    }
};

let currentLang = 'de';
let projects = JSON.parse(localStorage.getItem('packyt_projects')) || [];
let activeEditIndex = -1; // Para saber qué proyecto estamos editando en el modal

/* --- FUNCIONES UI PRINCIPALES --- */

function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    // Traducir textos estáticos
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang][key]) el.innerText = translations[lang][key];
    });
    
    renderList(); // Re-renderizar lista para traducir fechas/textos dinámicos
}

// Renderizar la lista estilo YouTube
function renderList() {
    const container = document.getElementById('videoListContainer');
    container.innerHTML = '';

    // Ordenar: más reciente primero
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (projects.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#555;">No projects yet.<br>Click + to start.</div>`;
        return;
    }

    projects.forEach((p, index) => {
        // Intentar sacar imagen de YouTube si hay link, si no, placeholder
        let thumbUrl = null;
        if (p.ytLink) {
            const vidId = extractVideoID(p.ytLink);
            if (vidId) thumbUrl = `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`;
        }

        const thumbHTML = thumbUrl 
            ? `<img src="${thumbUrl}" alt="Thumb">` 
            : `<i class="fas fa-play"></i>`; // Icono genérico si no hay link aún

        const dateStr = new Date(p.date).toLocaleDateString();
        const t = translations[currentLang];

        const html = `
        <div class="video-card">
            <div class="card-thumb">
                ${thumbHTML}
            </div>
            <div class="card-info">
                <div class="card-title">${p.title}</div>
                <div class="card-meta">
                    ${p.desc}<br>
                    ${t.statusSent}: ${dateStr}
                    ${p.ytLink ? ' • <i class="fab fa-youtube" style="color:red"></i>' : ''}
                </div>
            </div>
            <button class="btn-more" onclick="toggleMenu(event, ${index})">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            
            <div class="action-menu" id="menu-${index}">
                ${p.ytLink ? `<div class="action-item" onclick="window.open('${p.ytLink}')"><i class="fas fa-external-link-alt"></i> ${t.menuOpen}</div>` : ''}
                <div class="action-item" onclick="openLinkModal(${index})"><i class="fas fa-pen"></i> ${t.menuEdit}</div>
                <div class="action-item" onclick="deleteProject(${index})" style="color:#ff4444"><i class="fas fa-trash"></i> ${t.menuDelete}</div>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
}

/* --- LÓGICA DEL MENÚ DE 3 PUNTOS --- */
function toggleMenu(e, index) {
    e.stopPropagation(); // Evitar clicks fantasma
    // Cerrar todos primero
    document.querySelectorAll('.action-menu').forEach(m => m.classList.remove('show'));
    // Abrir el seleccionado
    document.getElementById(`menu-${index}`).classList.toggle('show');
}

// Cerrar menús al hacer click fuera
document.addEventListener('click', () => {
    document.querySelectorAll('.action-menu').forEach(m => m.classList.remove('show'));
});

/* --- LÓGICA DE MODAL Y EDICIÓN --- */
function openLinkModal(index) {
    activeEditIndex = index; // Guardamos el índice real (basado en el array ordenado, cuidado aquí)
    // Nota: Como ordenamos el array al renderizar, buscar por referencia original sería mejor, 
    // pero para este prototipo usaremos el índice renderizado mapeado al array ordenado global 'projects'.
    document.getElementById('modalLinkInput').value = projects[index].ytLink || '';
    document.getElementById('linkModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('linkModal').style.display = 'none';
    activeEditIndex = -1;
}

function saveLink() {
    if (activeEditIndex > -1) {
        const newVal = document.getElementById('modalLinkInput').value;
        projects[activeEditIndex].ytLink = newVal;
        localStorage.setItem('packyt_projects', JSON.stringify(projects));
        closeModal();
        renderList();
    }
}

function deleteProject(index) {
    if(confirm("Delete this project?")) {
        projects.splice(index, 1);
        localStorage.setItem('packyt_projects', JSON.stringify(projects));
        renderList();
    }
}

/* --- UTILIDADES --- */
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/* --- LÓGICA DE EMPAQUETADO (ZIP) --- */
function openPackager() {
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-packager').classList.remove('hidden');
    // Limpiar campos
    document.getElementById('pTitle').value = '';
    document.getElementById('pDesc').value = '';
    document.getElementById('fTele').value = '';
    document.getElementById('fThumb').value = '';
    document.getElementById('fAssets').value = '';
    document.getElementById('thumbPreview').style.display = 'none';
}

function openDashboard() {
    document.getElementById('view-packager').classList.add('hidden');
    document.getElementById('view-dashboard').classList.remove('hidden');
    renderList();
}

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

async function generateZip() {
    const title = document.getElementById('pTitle').value;
    const desc = document.getElementById('pDesc').value;
    const teleFile = document.getElementById('fTele').files[0];
    const thumbFile = document.getElementById('fThumb').files[0];
    const assetsFiles = document.getElementById('fAssets').files;

    if (!title || !teleFile) {
        alert("Title and Teleprompter file are required!");
        return;
    }

    const zip = new JSZip();
    zip.file("01_Teleprompter/" + teleFile.name, teleFile);
    
    if(thumbFile) {
        const ext = thumbFile.name.split('.').pop();
        zip.file(`02_Thumbnail/thumbnail.${ext}`, thumbFile);
    }

    const folderAssets = zip.folder("03_Assets");
    for (let i = 0; i < assetsFiles.length; i++) {
        folderAssets.file(assetsFiles[i].name, assetsFiles[i]);
    }

    // Guardar proyecto
    projects.push({
        title: title,
        desc: desc,
        date: new Date().toISOString(),
        ytLink: ""
    });
    localStorage.setItem('packyt_projects', JSON.stringify(projects));

    // Descargar
    const content = await zip.generateAsync({type:"blob"});
    saveAs(content, `${title.replace(/\s+/g, '_')}_Pack.zip`);
    
    openDashboard();
}

// INICIO
setLang('de');
renderList();
