# Notification Sounds

## Where to Place Sound Files

Place your notification sound file(s) in this directory (`frontend/public/sounds/`).

## Recommended File

- **File name**: `notification.mp3` (or `.wav`, `.ogg`)
- **Format**: MP3, WAV, or OGG (MP3 has best browser support)
- **Duration**: 0.5-2 seconds recommended
- **Volume**: Normalized to avoid being too loud

## Example Sound Files

You can use:
- A simple "ding" or "ping" sound
- A short notification chime
- A subtle alert tone

## Free Sound Resources

- [Freesound.org](https://freesound.org) - Search for "notification" or "alert"
- [Zapsplat](https://www.zapsplat.com) - Free sound effects
- [Mixkit](https://mixkit.co/free-sound-effects/alert/) - Free alert sounds

## File Size

Keep sound files small (< 100KB) for fast loading.

## Current Implementation

The app will:
1. Try to play `/sounds/notification.mp3` if available
2. Fall back to a generated beep sound if the file is not found
3. Respect browser autoplay policies (may require user interaction first)

## Testing

After adding a sound file:
1. Restart your dev server
2. Trigger a notification
3. You should hear the sound play

