const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';

let monitorear = true;

let mic;
let pitch;
let audioContext;

let gestorAmp;
let gestorPitch;

let vol;
let AMP;
let AMP_MIN = 0.005;
let AMP_MAX = 0.9;
let FREC_MIN = 40;
let FREC_MAX = 80;

let umbral_sonido = 0.005;
let antesHabiaSonido;



let marcaInicial;
let duracionSonidosCortos = 1000;

let estado = "inicio";
let marcaEnElTiempo;
let colorDeFondo;
let duracionFondo = 1000;
let cantidadDeCirculos = 0;
let cantidadLimite = 20;

let regresiva;
let pasosRegresiva = 30;
let color1, color2;

let paletaAguda;
let paletaGrave;
let imagenAguda;
let imagenGrave;

let altura;

let imagenes;


let tiempoUltimoDibujo = 100;
let intervaloDibujo = 500; // Intervalo de tiempo entre dibujos en milisegundos
/*
 // Global variable to store the classifier
 let classifier;

 // Label
 let label;
 
 // Teachable Machine model URL:
 let soundModel = 'https://teachablemachine.withgoogle.com/models/mh21BfcTu/';
 */
function preload() {
  imagenAguda = loadImage("data/otraPaleta.jpg");
  imagenGrave = loadImage("data/noche.jpg");
  imagenes = new circulos();
  // Load the model
  //classifier = ml5.soundClassifier(soundModel + 'model.json');
}

function setup() {
 createCanvas(800, 500);
 ellipseMode(CORNER);
  paletaAguda = new Paleta(imagenAguda);
  paletaGrave = new Paleta(imagenGrave);

  audioContext = getAudioContext();
  mic = new p5.AudioIn();
  mic.start(startPitch);

  userStartAudio();

  background(255);
  //classifier.classify(gotResult);
  gestorAmp = new GestorSenial(AMP_MIN , AMP_MAX);
  gestorPitch = new GestorSenial(FREC_MIN , FREC_MAX);

  

 
  background(255);
  colorDeFondo = color(0);
  color1 = color(0);
  color2 = color(0);
}

function draw() {
  gestorAmp.actualizar(mic.getLevel());
  vol = mic.getLevel();
  
/*
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(label, width / 2, height / 2);
*/
  let haySonido = gestorAmp.filtrada > AMP_MIN;
  let empezoElSonido = haySonido && !antesHabiaSonido;
  AMP=gestorAmp.filtrada;
  altura = gestorPitch.filtrada;

  if (estado === "inicio") {
    if (empezoElSonido) {
      estado = "fondo";
      imagenes.diam=100;
      marcaEnElTiempo = millis();
    }
  } else if (estado === "fondo") {
    background(255);
    
    if (haySonido) {
      push();
      colorMode(HSB, 360, 100, 100, 100);
      colorDeFondo = color(255);
      pop();
    }

    if (millis() > marcaEnElTiempo + duracionFondo) {
      estado = "dibujar";
    }

  } else if (estado === "dibujar") {    
    if (empezoElSonido && millis() - tiempoUltimoDibujo > intervaloDibujo) {
      tiempoUltimoDibujo = millis();
      if (cantidadDeCirculos < cantidadLimite) {
        imagenes.numero();
        imagenes.seleccionar();
        imagenes.definirP();
        //diam = diamMin; 

        cantidadDeCirculos++;

        color1 = elegirColor();
        color2 = elegirColor();
        regresiva = pasosRegresiva;
        imagenes.capaDelMedio.image(imagenes.capaFrente, 0, 0);
        
        
       /* if(cantidadDeCirculos>=10){//al llegar a 10 se agranda el tamaño
          diam+= random(diamMin,diamMax);
        }*/
        
        
        /*if(label == "aplauso"){
          tamanios();
          label = "";
        }*/
       
      } else {
        estado = "fin";
      }
    }

    if (haySonido) {
      background(255);
      imagenes.capaFrente.clear();
      imagenes.dibujar();
      imagenes.setDiam ();
      /*if (aumentando) {
        diam += diamMax;
      } else {
        diam -= diamMin;
      }
  
      if (diam >= diamMax || diam <= diamMin) {
        aumentando = !aumentando;
      }*/
      regresiva--;

      if (regresiva >= 0) {
        let valor = map(regresiva, pasosRegresiva, 0, 0, 1);
        color1 = lerpColor(color1, color2, valor);
      } else {
        color1 = color2;
        color2 = elegirColor();
        regresiva = pasosRegresiva;
      }
    }

    image(imagenes.capaDelMedio, 0, 0);
    image(imagenes.capaFrente, 0, 0);

  } else if (estado === "fin") {
    reiniciar();
  }

  /*if (monitorear) {
    gestorAmp.dibujar(10, 10);
    gestorPitch.dibujar(10, 100);
  }*/

  antesHabiaSonido = haySonido;
  
    console.log(imagenes.limiteDiamActual);
    console.log(imagenes.diam);
}
/*
function tamanios(){
  if (!haySonido) {
    // Aumentar el tamaño cuando no haya sonido
    diam += 10; 
    if (diam > diamMax) {
      diam = diamMax;
    }
  }

  if (haySonido) {
    if (aumentando) {
      diam += velocidadLatido;
    } else {
      diam -= velocidadLatido;
    }

    if (diam >= diamMax || diam <= diamMin) {
      aumentando = !aumentando;
    }
  }
}
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }
  // The results are in an array ordered by confidence.
  // console.log(results[0]);
  label = results[0].label;
}*/


function reiniciar() {
  estado = "inicio";
  cantidadDeCirculos = 0;
  background(255);
  colorDeFondo = color(0);
  color1 = color(0);
  color2 = color(0);
  imagenes.borrar();
}
function elegirColor() {
  let elegido = color(0);
  if (altura > 0.5) {
    elegido = paletaAguda.darUnColor(150);
    //diam+=50;
  } else {
    elegido = paletaGrave.darUnColor(150);
    //diam=500;
  }
  return elegido;
}

function windowResized() {
  resizeCanvas(800, 500);
}

function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext, mic.stream, modelLoaded);
}

function modelLoaded() {
  getPitch();
}

function getPitch() {
  pitch.getPitch(function(err, frequency) {
    if (frequency) {
      let midiNum = freqToMidi(frequency);
      gestorPitch.actualizar(midiNum);
    }
    getPitch();
  });
}