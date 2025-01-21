function playNote(frequency) {
  console.log("playing", frequency);
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = 'sine'; // Sound wave type
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(1
                           , audioContext.currentTime); // Volume control
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.5); // Stop after 0.5 seconds
}


    function playPianoNote(freq) {
      console.log("second", freq)
      // Create an AudioContext
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create an oscillator
      const oscillator = audioContext.createOscillator();

      // Set the oscillator type and frequency
      oscillator.type = "sine"; // Other options: 'square', 'sawtooth', 'triangle'
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);

      // Create a gain node for volume control
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Adjust volume

      // Connect the oscillator to the gain node and the gain node to the destination
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start and stop the oscillator
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 1000); // Play the note for 1 second
    }
