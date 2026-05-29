import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export function useQuantumMusic(systemStatus: 'nominal' | 'alert' | 'lockdown') {
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize Tone.js only once upon user interaction or mount
    if (!initialized.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 2,
          decay: 0.1,
          sustain: 0.8,
          release: 4,
        },
      }).toDestination();
      
      // Auto-start ambient drone
      Tone.start().then(() => {
        if (synthRef.current) {
          synthRef.current.volume.value = -20; // Very soft background
        }
      });
      initialized.current = true;
    }

    // Adjust auditory landscape based on status
    if (synthRef.current) {
      if (systemStatus === 'nominal') {
        synthRef.current.triggerAttackRelease(['C2', 'G2'], '8n');
      } else if (systemStatus === 'alert') {
        synthRef.current.triggerAttackRelease(['C2', 'D#2', 'F#2'], '4n');
      } else if (systemStatus === 'lockdown') {
        synthRef.current.triggerAttackRelease(['C1', 'C2'], '2n');
      }
    }

    return () => {
      // Cleanup if needed
    };
  }, [systemStatus]);
}
