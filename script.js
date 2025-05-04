let stream;
let videoElement = document.getElementById('video');
let canvasElement = document.getElementById('canvas');
let alumnosReconocidos = [];
let alumnosLista = document.getElementById('alumnosLista');
let contexto = canvasElement.getContext('2d');
let currentStream = null;  // Variable para almacenar el flujo actual de la cámara
let currentDeviceId = null; // ID de la cámara actual (delantera o trasera)

// Cargar los modelos de face-api.js
async function cargarModelos() {
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log("Modelos cargados correctamente.");
    } catch (error) {
        console.error("Error al cargar los modelos:", error);
    }
}

// Función para iniciar la cámara
async function iniciarCamara() {
    const constraints = {
        video: {
            facingMode: currentDeviceId ? (currentDeviceId === 'user' ? 'user' : 'environment') : 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
        }
    };

    try {
        // Detener el flujo anterior si existe
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // Obtener el flujo de la cámara
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;

        // Mostrar el canvas encima del video
        canvasElement.width = videoElement.width;
        canvasElement.height = videoElement.height;
    } catch (err) {
        console.error('Error al acceder a la cámara: ', err);
    }
}

// Función para alternar la cámara
function alternarCamara() {
    currentDeviceId = currentDeviceId === 'user' ? 'environment' : 'user';
    iniciarCamara();
}

// Función para tomar una foto
async function tomarFoto() {
    if (!faceapi) {
        console.error('face-api.js no está cargado.');
        return;
    }

    // Asegúrate de que el video esté listo
    if (videoElement.srcObject) {
        // Esperamos a que el video se cargue
        const detecciones = await faceapi.detectAllFaces(videoElement)
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (detecciones.length > 0) {
            console.log(`Rostros detectados: ${detecciones.length}`);
            procesarRostros(detecciones);
        } else {
            console.log("No se detectaron rostros.");
        }
    } else {
        console.error("No se ha iniciado el video.");
    }
}

// Procesar los rostros detectados
function procesarRostros(detecciones) {
    detecciones.forEach(deteccion => {
        const alumno = deteccion.descriptor;
        const nombreAlumno = 'Alumno_' + alumnosReconocidos.length + 1;  // Simulación de nombre
        alumnosReconocidos.push({ nombre: nombreAlumno, descriptor: alumno });

        // Mostrar el nombre en la lista
        const li = document.createElement('li');
        li.textContent = nombreAlumno;
        alumnosLista.appendChild(li);
    });
}

// Asociar los eventos a los botones
document.getElementById('cargarModelos').addEventListener('click', cargarModelos);
document.getElementById('tomarFoto').addEventListener('click', tomarFoto);
document.getElementById('alternarCamara').addEventListener('click', alternarCamara);

// Iniciar la cámara al cargar la página
window.onload = () => {
    cargarModelos().then(iniciarCamara);
};
