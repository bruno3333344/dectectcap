// Inicialización de la cámara
async function startVideo() {
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({
        video: {}
    });
    video.srcObject = stream;
}

// Cargar los modelos de face-api.js
async function cargarModelos() {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
}

// Función para tomar una foto
async function tomarFoto() {
    const video = document.getElementById('video');
    const detecciones = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

    if (detecciones.length > 0) {
        // Lista de alumnos detectados
        const listaAlumnos = document.getElementById('alumnos-lista');
        detecciones.forEach(deteccion => {
            const alumno = {
                descriptor: deteccion.descriptor,
                nombre: 'Alumno Detectado' // Aquí puedes asignar un nombre o ID si lo deseas
            };

            // Aquí se puede almacenar el descriptor facial en una base de datos o localStorage
            // Ejemplo en localStorage:
            localStorage.setItem(alumno.nombre, JSON.stringify(alumno));

            // Agregar a la lista de alumnos en la interfaz
            const nuevoAlumno = document.createElement('li');
            nuevoAlumno.textContent = alumno.nombre;
            listaAlumnos.appendChild(nuevoAlumno);
        });
    }
}

// Función para reconocer alumnos al escanear de nuevo
async function reconocerAlumnos() {
    const video = document.getElementById('video');
    const detecciones = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();

    // Recuperar los descriptores de los alumnos guardados
    const alumnosGuardados = Object.keys(localStorage).map(key => {
        return JSON.parse(localStorage.getItem(key));
    });

    // Comparar los descriptores de los rostros detectados con los almacenados
    detecciones.forEach(deteccion => {
        const resultado = faceapi.similarity(deteccion.descriptor, alumnosGuardados[0].descriptor);
        if (resultado > 0.6) { // Umbral de confianza para considerar que es el mismo rostro
            console.log('Alumno presente:', alumnosGuardados[0].nombre);
        } else {
            console.log('Rostro no reconocido');
        }
    });
}

// Iniciar la cámara y cargar modelos
startVideo();
cargarModelos();
