
const singletons = {}
const getSingleton = (id, callback) => {
  if (!singletons[id]) {
    singletons[id] = callback();
  }
  return singletons[id];
};

// ADSR envelope parameters
const ADSR = {
  attack: 0.1,  // Attack time in seconds
  decay: 0.2,   // Decay time in seconds
  sustain: 0.7, // Sustain level (0-1)
  release: 0.5  // Release time in seconds
};

function createEnvelope(audioContext, gainNode, startTime) {
  const gain = gainNode.gain;

  // Starting from zero
  gain.setValueAtTime(0, startTime);

  // Attack phase - ramp up to full volume
  gain.linearRampToValueAtTime(1, startTime + ADSR.attack);

  // Decay phase - ramp down to sustain level
  gain.linearRampToValueAtTime(ADSR.sustain, startTime + ADSR.attack + ADSR.decay);

  return startTime + ADSR.attack + ADSR.decay; // Return the time when decay phase ends
}

function releaseEnvelope(audioContext, gainNode, startTime) {
  const gain = gainNode.gain;
  gain.cancelScheduledValues(startTime);
  gain.setValueAtTime(ADSR.sustain, startTime);
  gain.linearRampToValueAtTime(0, startTime + ADSR.release);
  return startTime + ADSR.release;
}
function playNote(frequency) {
  const audioContext = getSingleton('audioContext', () => new (window.AudioContext || window.webkitAudioContext)());
  const masterGain = getSingleton('masterGain', () => {
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(1, audioContext.currentTime);
    gain.connect(audioContext.destination);
    return gain;
  });

  console.log("playing", frequency);
  const noteGain = audioContext.createGain();
  const oscillators = [];
  
  // Calculate total number of harmonics for normalization
  const harmonics = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,15,16];
  const totalHarmonics = harmonics.length;
  
  // Create harmonics with proper gain scaling
  for (let i of harmonics) {
    const harmonicGainNode = audioContext.createGain();
    const oscillator = audioContext.createOscillator();

    oscillator.type = 'sine';
    const randomizer = 1 + (0.5 - Math.random()) * 0.01;
    oscillator.frequency.setValueAtTime(i * frequency * randomizer, audioContext.currentTime);
    
    // Reduce harmonic gain based on:
    // 1. Harmonic number (higher harmonics are quieter)
    // 2. Total number of harmonics (prevent summing to >1)
    // 3. Additional scaling factor for safety
    const maxSimultaneousNotes = 5
    const harmonicGain = (1 / (2 ** (i - 1))) * (1 / totalHarmonics) * (1/maxSimultaneousNotes);
    harmonicGainNode.gain.setValueAtTime(harmonicGain, audioContext.currentTime);
    
    oscillator.connect(harmonicGainNode);
    harmonicGainNode.connect(noteGain);
    oscillators.push(oscillator);
  }
  noteGain.connect(masterGain);

  // Apply ADSR envelope
  const startTime = audioContext.currentTime;
  const decayEndTime = createEnvelope(audioContext, noteGain, startTime);

  // Start oscillators
  oscillators.forEach(osc => osc.start(startTime));

  // Schedule release and cleanup
  const noteLength = 1
  const stopTime = startTime + noteLength; // Total note duration
  const releaseStartTime = Math.max(stopTime, decayEndTime)-ADSR.release;

  // Apply release envelope
  releaseEnvelope(audioContext, noteGain, releaseStartTime);

  // Stop oscillators
  oscillators.forEach(osc => osc.stop(stopTime));
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
  const keyboardAsPiano = 'zxcvbnmasdfghjqwertyu1234567890-='.split('')
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
