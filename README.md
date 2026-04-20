<div align="center">
  <img src=".sunsign/public/sunsign-logo.svg" width="120" alt="SunSign Logo" />
  <h1>SunSign ☀️</h1>
  <p><i>"Light that speaks with every hand"</i></p>
</div>

Hi! This is **SunSign**. It's a simple website we made to help translate Arabic Sign Language into words using AI. 

### What does it do?
- **Webcam Translation**: It watches your hands and guesses which Arabic letter or word you are making.
- **3D Avatar**: You can type something in Arabic, and a 3D character (we call him XBot) will show you how to sign it.
- **Auto-Translate**: If you type in English, it uses Google to turn it into Arabic first so the character can sign it.

### How to use it
1. Use `npm install` to get the dependencies.
2. Run `npm run dev` to start the app.
3. Open your browser and show your hands to the camera!

### The Techy Bits (Simply put)
- **React**: For the website structure.
- **MediaPipe**: This is the "brain" that finds where your fingers are.
- **Three.js**: This is what lets us show the 3D character on the screen.
- **AI Models**: We trained models (TCN and CNN) to recognize the signs.

---
*Created as a project to make sign language translation more accessible for everyone.*
