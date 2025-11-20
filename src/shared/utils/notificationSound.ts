/**
 * Utility for playing notification sounds
 */

// Sound file path - place your sound file in public/sounds/notification.mp3
const NOTIFICATION_SOUND_PATH = '/sounds/notification.mp3'

// Fallback: Use Web Audio API to generate a simple beep if audio file fails
const playBeepSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 800 // Frequency in Hz
    oscillator.type = 'sine'
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (err) {
    console.warn('Could not play beep sound:', err)
  }
}

// Preload audio for better performance
let audioElement: HTMLAudioElement | null = null
let audioLoaded = false

const preloadAudio = () => {
  if (audioLoaded || audioElement) return
  
  try {
    audioElement = new Audio(NOTIFICATION_SOUND_PATH)
    audioElement.preload = 'auto'
    audioElement.volume = 0.5 // 50% volume
    
    audioElement.addEventListener('canplaythrough', () => {
      audioLoaded = true
    }, { once: true })
    
    audioElement.addEventListener('error', () => {
      console.warn('Notification sound file not found, will use beep fallback')
      audioElement = null
    }, { once: true })
  } catch (err) {
    console.warn('Could not preload notification sound:', err)
  }
}

/**
 * Play notification sound
 * @param enabled - Whether sound is enabled (default: true)
 */
export const playNotificationSound = (enabled: boolean = true) => {
  if (!enabled) return
  
  // Preload on first call
  if (!audioElement && !audioLoaded) {
    preloadAudio()
  }
  
  // Try to play audio file
  if (audioElement && audioLoaded) {
    try {
      // Reset to beginning if already playing
      audioElement.currentTime = 0
      audioElement.play().catch(err => {
        console.warn('Could not play notification sound file:', err)
        // Fallback to beep
        playBeepSound()
      })
    } catch (err) {
      console.warn('Error playing notification sound:', err)
      playBeepSound()
    }
  } else {
    // Fallback to beep if audio file not loaded
    playBeepSound()
  }
}

/**
 * Preload the notification sound (call this early in app initialization)
 */
export const initNotificationSound = () => {
  preloadAudio()
}

