const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioContext.createGain();
masterGain.connect(audioContext.destination)
function playNote(frequency) {
  console.log("playing", frequency);
  const gainNode = audioContext.createGain();
  const oscillators = []
  for (i of [1, 2, 3, 4, 5, 6,7,8,9,10,11,12,13,14]) {
    const harmonicGainNode = audioContext.createGain();
    const oscillator = audioContext.createOscillator();

    oscillator.type = 'sine'; // Sound wave type
    const randmoizer = 1 +(0.5-Math.random())*.01
    // const randmoizer = 1
    oscillator.frequency.setValueAtTime(i * frequency * randmoizer, audioContext.currentTime);
    harmonicGainNode.gain.setValueAtTime(0.2 / (2 ** (i-1)), audioContext.currentTime)
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
    oscillator.stop(audioContext.currentTime +time); // Stop after 0.5 seconds}
  }
}

function createPiano(containerId) {
  const container = document.getElementById(containerId);

  const scales = {
    aeolian: [0, 4, 6, 10, 14, 16, 20], // 1 = 50 cents
    shoor: [0, 3, 6, 10, 14, 16, 20],
    nava: [0, 4, 6, 10, 14, 17, 20],
  }
  // run def
  const baseFrequency = 164.814 
  const baseNote = 'E3' // todo: this should be calculated from frequency
  const octaves = 4
  const scale = 'nava'
  // end run def
  const notes = []
  for (o = 0; o < octaves; o++) {
    scales[scale].forEach(d => notes.push({ name: `${d}|${o}`, frequency: baseFrequency * 2 ** (o + d / 24) }))
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
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase(); // Ensure the key is lowercase
    console.log(key)
    const noteIndex = keyboardAsPiano.indexOf(key);
    if (noteIndex >= 0 && noteIndex < notes.length-1) {
      playNote(notes[noteIndex].frequency);
      // Get the corresponding key element
      console.log(pianoDiv.children[noteIndex])
      const keyElement = pianoDiv.children[noteIndex];

      // Add a 'pressed' class to trigger the CSS effect
      keyElement.classList.add('pressed');

      // Remove the 'pressed' class after 200ms
      setTimeout(() => {
        keyElement.classList.remove('pressed');
      }, 200);
    }
  });

  // Function to calculate the cents between two frequencies
  function calculateCents(f1, f2) {
    return 1200 * Math.log2(f2 / f1);
  }
  const title = document.createElement('h1');
  title.innerHTML = `${baseNote} in ${scale}`;
  container.appendChild(title);
  container.appendChild(pianoDiv);
}



window.onload = () => createPiano('piano-container');
