const singletons = {}
const getSingleton = (id, callback) => {
  if (!singletons[id]) {
    singletons[id] = callback();
  }
  return singletons[id];
};
function playNote(frequency) {
  const audioContext = getSingleton('audioContext', () => new (window.AudioContext || window.webkitAudioContext)());
  const masterGain = getSingleton('masterGain', () => {
    const gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    return gain;
  });

  console.log("playing", frequency);
  const gainNode = audioContext.createGain();
  const oscillators = []
  for (i of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]) {
    const harmonicGainNode = audioContext.createGain();
    const oscillator = audioContext.createOscillator();

    oscillator.type = 'sine'; // Sound wave type
    const randmoizer = 1 + (0.5 - Math.random()) * .01
    // const randmoizer = 1
    oscillator.frequency.setValueAtTime(i * frequency * randmoizer, audioContext.currentTime);
    harmonicGainNode.gain.setValueAtTime(0.2 / (2 ** (i - 1)), audioContext.currentTime)
    oscillator.connect(harmonicGainNode)
    oscillators.push(oscillator)
    harmonicGainNode.connect(gainNode);
  }
  gainNode.connect(masterGain);

  gainNode.gain.setValueAtTime(0.9, audioContext.currentTime); // Volume control
  for (const oscillator of oscillators) {
    oscillator.start();
    const time = 1.5;
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + time); // Fade out in 3 seconds
    oscillator.stop(audioContext.currentTime + time); // Stop after 0.5 seconds}
  }
}

function createPiano(containerId, scaleIntervalsStr, baseFrequency, octaves) {
  scaleIntervals = scaleIntervalsStr.split(',')
  console.log(scaleIntervals, baseFrequency, octaves)
  const container = document.getElementById(containerId);
  container.innerHTML = ''

  const notes = []
  for (o = 0; o < octaves; o++) {
    scaleIntervals.forEach(d => notes.push({ name: `${d}|${o}`, frequency: baseFrequency * 2 ** (o + d / 24) }))
  }
  notes.push({ name: `0|${octaves}`, frequency: baseFrequency * 2 ** octaves })// boundary

  const pianoDiv = document.createElement('div');
  pianoDiv.classList.add('piano');

  for (let i = 0; i < notes.length - 1; i++) {
    const key = notes[i];
    const keyDiv = document.createElement('div');
    keyDiv.classList.add('key');
    keyDiv.innerHTML = key.name;
    keyDiv.onclick = () => playNote(key.frequency);

    const centsDiff = calculateCents(notes[i].frequency, notes[i + 1].frequency);
    keyDiv.style.width = `${centsDiff * 0.3}px`;  // Scaling factor to adjust the size

    pianoDiv.appendChild(keyDiv);
  };

  // keyboard integration
  const keyboardAsPiano = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']']
  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase(); // Ensure the key is lowercase
    const noteIndex = keyboardAsPiano.indexOf(key);
    if (noteIndex >= 0 && noteIndex < notes.length - 1) {
      // playNote(notes[noteIndex].frequency);
      // Get the corresponding key element
      const keyElement = pianoDiv.children[noteIndex];

      // Add a 'pressed' class to trigger the CSS effect
      keyElement.classList.add('pressed');
      keyElement.removeAttribute
      console.log(keyElement)
      keyElement.isConnected && keyElement.click();

      // Remove the 'pressed' class after 200ms
      setTimeout(() => {
        keyElement.classList.remove('pressed');
      }, 200);
    }
  };
  window.removeEventListener('keydown', handleKeyDown);
  window.addEventListener('keydown', handleKeyDown);

  // Function to calculate the cents between two frequencies
  function calculateCents(f1, f2) {
    return 1200 * Math.log2(f2 / f1);
  }

  container.appendChild(pianoDiv);
}

function createSelector(containerId, options, currentval, callback) {
  const selector = document.getElementById(containerId)
  selector.innerHTML = Object.keys(options)
    .map(name => {
      return `<option ${options[name] == currentval ? 'selected ' : ''}value="${options[name]}">${name}</option>`
    })
    .join("");
  selector.addEventListener("change", (event) => {
    console.log(event.target.value);
    callback(event.target.value);
  });
}

function rerender() {
  createPiano('piano-container', scale, baseFrequency, octave);
}
const scales = {
  aeolian: [0, 4, 6, 10, 14, 16, 20], // 1 = 50 cents
  shoor: [0, 3, 6, 10, 14, 16, 20],
  nava: [0, 4, 6, 10, 14, 17, 20],
  homayoon: [0, 3, 8, 10, 14, 16, 20]
}
const baseNotesFrequencies = {
  C2: 65.41,  // C2 frequency
  D2: 73.42,  // D2 frequency
  E2: 82.41,  // E2 frequency
  F2: 87.31,  // F2 frequency
  G2: 98.00,  // G2 frequency
  A2: 110.00, // A2 frequency
  B2: 123.47, // B2 frequency
};
const octaves = { 1: 1, 2: 2, 3: 3, 4: 4 }

let scale = scales['shoor'].join(',');
let baseFrequency = baseNotesFrequencies['C2']
let octave = octaves[4]

window.onload = () => {
  createSelector('base-note-selector', baseNotesFrequencies, baseFrequency, freq => {
    baseFrequency = freq;
    rerender();
  })
  createSelector('scale-selector', scales, scale, s => {
    scale = s;
    rerender();
  })
  createSelector('octave-selector', octaves, octave, o => {
    octave = o;
    rerender();
  })
  rerender();
}
