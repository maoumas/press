/* --- CONFIGURACIÓN --- */
// Pon tu API KEY aquí si quieres visualizaciones reales. 
// Si está vacía, no mostrará errores, solo no mostrará contadores.
const YOUTUBE_API_KEY = ""; 

const translations = {
    de: {
        btnCreateHeader: "NEU",
        packagerTitle: "Neues Paket erstellen",
        lblTitle: "PROGRAMM TITEL",
        lblDesc: "BESCHREIBUNG",
        lblTele: "TELEPROMPTER (HTML)",
        lblThumb: "THUMBNAIL (BILD)",
        lblAssets: "MEDIEN",
        btnGenerate: "PAKET ERSTELLEN",
        modalTitle: "YouTube Link speichern",
        menuOpen: "Auf YouTube ansehen",
        menuEdit: "Link bearbeiten",
        menuDelete: "Löschen",
        statusSent: "Gesendet",
        back: "Zurück"
    },
    es: {
        btnCreateHeader: "NUEVO",
        packagerTitle: "Crear Nuevo Paquete",
        lblTitle: "TÍTULO DEL PROGRAMA",
        lblDesc: "DESCRIPCIÓN",
        lblTele: "TELEPROMPTER (HTML)",
        lblThumb: "PORTADA (THUMBNAIL)",
        lblAssets: "MEDIOS",
        btnGenerate: "GENERAR PAQUETE",
        modalTitle: "Guardar enlace YouTube",
        menuOpen: "Ver en YouTube",
        menuEdit: "Editar Enlace",
        menuDelete: "Eliminar",
        statusSent: "Enviado",
        back: "Volver"
    },
    en: {
        btnCreateHeader: "NEW",
        packagerTitle: "Create New Package",
        lblTitle: "PROGRAM TITLE",
        lblDesc: "DESCRIPTION",
        lblTele: "TELEPROMPTER (HTML)",
        lblThumb: "THUMBNAIL IMAGE",
        lblAssets: "ASSETS",
        btnGenerate: "GENERATE PACK",
        modalTitle: "Save YouTube Link",
        menuOpen: "Watch on YouTube",
        menuEdit: "Edit Link",
        menuDelete: "Delete",
        statusSent: "Sent",
        back: "Back"
    }
};

let currentLang = 'de';
let projects = JSON.parse(localStorage.getItem('packyt_projects')) || [];
let activeEditIndex = -1;

/* --- UI Y RENDERIZADO --- */
function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-switch button').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${lang}`).classList.add('active');
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang][key]) el.innerText = translations[lang][key];
    });
    renderList();
}

async function renderList() {
    const container = document.getElementById('videoListContainer');
    container.innerHTML = '';
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (projects.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#555;">No hay proyectos.<br>Usa el botón "NUEVO" arriba.</div>`;
        return;
    }

    // Renderizamos primero, luego cargamos estadísticas asíncronamente
    for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        const t = translations[currentLang];
        const dateStr = new Date(p.date).toLocaleDateString();
        
        // Determinar ID y Thumbnail
        let thumbUrl = null;
        let vidId = null;
        if (p.ytLink) {
            vidId = extractVideoID(p.ytLink);
            if (vidId) thumbUrl = `https://img.youtube.com/vi/${vidId}/mqdefault.jpg`;
        }

        const thumbHTML = thumbUrl 
            ? `<img src="${thumbUrl}" alt="Thumb">` 
            : `<i class="fas fa-play" style="color:#555; font-size:20px;"></i>`;

        // Crear elemento
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="card-thumb" onclick="openLinkIfCheck(${i})">
                ${thumbHTML}
            </div>
            <div class="card-info">
                <div class="card-title">${p.title}</div>
                <div class="card-meta">
                    <span>${t.statusSent}: ${dateStr}</span>
                    
                    ${p.ytLink ? `<span class="meta-separator">•</span> <i class="fab fa-youtube" style="color:#aaa"></i>` : ''}
                    
                    <span class="meta-separator">•</span>
                    <span class="view-count" id="views-${i}">
                        <i class="fas fa-eye" style="font-size:10px;"></i> 
                        <span>--</span>
                    </span>
                </div>
            </div>
            <button class="btn-more" onclick="toggleMenu(event, ${i})">
                <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="action-menu" id="menu-${i}">
                ${p.ytLink ? `<div class="action-item" onclick="window.open('${p.ytLink}')"><i class="fas fa-external-link-alt"></i> ${t.menuOpen}</div>` : ''}
                <div class="action-item" onclick="openLinkModal(${i})"><i class="fas fa-pen"></i> ${t.menuEdit}</div>
                <div class="action-item" onclick="deleteProject(${i})" style="color:#ff5555"><i class="fas fa-trash"></i> ${t.menuDelete}</div>
            </div>
        `;
        container.appendChild(card);

        // Si hay API KEY y Video ID, buscar visualizaciones
        if (vidId && YOUTUBE_API_KEY) {
            fetchYouTubeStats(vidId, i);
        }
    }
}

/* --- API YOUTUBE (Visualizaciones) --- */
async function fetchYouTubeStats(videoId, index) {
    try {
        const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const views = data.items[0].statistics.viewCount;
            // Formatear número (ej: 1200 -> 1.2K)
            const formattedViews = Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(views);
            
            const viewEl = document.getElementById(`views-${index}`);
            if(viewEl) {
                viewEl.innerHTML = `<i class="fas fa-eye" style="font-size:10px;"></i> ${formattedViews}`;
                viewEl.classList.add('has-views');
            }
        }
    } catch (error) {
        console.log("Error fetching stats", error);
    }
}

/* --- UTILIDADES --- */
function extractVideoID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function openLinkIfCheck(index) {
    if(projects[index].ytLink) window.open(projects[index].ytLink, '_blank');
}

function toggleMenu(e, index) {
    e.stopPropagation();
    document.querySelectorAll('.action-menu').forEach(m => m.classList.remove('show'));
    document.getElementById(`menu-${index}`).classList.toggle('show');
}
document.addEventListener('click', () => {
    document.querySelectorAll('.action-menu').forEach(m => m.classList.remove('show'));
});

/* --- GESTIÓN DE PROYECTOS --- */
function openLinkModal(index) {
    activeEditIndex = index;
    document.getElementById('modalLinkInput').value = projects[index].ytLink || '';
    document.getElementById('linkModal').style.display = 'flex';
}
function closeModal() { document.getElementById('linkModal').style.display = 'none'; activeEditIndex = -1; }

function saveLink() {
    if (activeEditIndex > -1) {
        projects[activeEditIndex].ytLink = document.getElementById('modalLinkInput').value;
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

/* --- EMPAQUETADOR --- */
function openPackager() {
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-packager').classList.remove('hidden');
    // Reset inputs
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
            document.getElementById('thumbPreview').src = e.target.result;
            document.getElementById('thumbPreview').style.display = 'block';
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

    if (!title || !teleFile) { alert("Title & Teleprompter required"); return; }

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

    projects.push({ title: title, desc: desc, date: new Date().toISOString(), ytLink: "" });
    localStorage.setItem('packyt_projects', JSON.stringify(projects));

    const content = await zip.generateAsync({type:"blob"});
    saveAs(content, `${title.replace(/\s+/g, '_')}_Pack.zip`);
    openDashboard();
}

// Init
setLang('de');
renderList();
