Harmoni-X 🎸🎶
Harmoni-X is a React Native-based mobile app built to assist guitarists with real-time tuning, chord recognition, and interactive learning. It combines modern UI/UX design with advanced audio signal processing and gamified education techniques to create a powerful tool for both beginner and intermediate musicians.

🔧 Features
🎵 Real-time Guitar Tuner
Tune your guitar accurately using precise pitch detection from live audio input.

🎼 Chord Recognition
Detect chords from uploaded audio files (.mp3) or live microphone input using deep learning.

🎤 Karaoke Mode
Sync lyrics and chord overlays to practice your favorite songs in an immersive sing-along experience.

📚 Learning Mode
Engage with structured chord theory lessons, challenges, and quizzes to level up your skills.

🏆 Gamified Learning
Unlock levels, take quizzes, and test your music theory knowledge interactively.

🧱 Tech Stack
Frontend: React Native

Backend: Flask (Python)

Deployment Tooling: Expo Go

📱 Requirements
Hardware
Android 9 (Pie) or higher

3 GB RAM minimum

Functional microphone

Headphones (optional but recommended)

Software
React Native-compatible environment

Internet connection for online features

Firebase setup for user login & cloud sync

🚀 Getting Started
Clone this repository

bash
Copy
Edit
git clone https://github.com/your-username/harmoni-x.git
cd harmoni-x
Install dependencies

bash
Copy
Edit
npm install
Run the frontend

bash
Copy
Edit
npx expo start
Run the backend (Flask)

bash
Copy
Edit
uvicorn backend.main:app --reload
Connect your mobile device
Use Expo Go to scan the QR code and test the app on your phone.

🧠 Key Concepts
Music Information Retrieval (MIR)
Real-time chord and beat extraction using deep learning techniques.

Gamification in Education
Enhances user engagement and learning outcomes through interactive elements.

Cross-platform Development
Built with React Native to ensure performance across Android devices.

🧪 Future Enhancements
🎸 Add support for other instruments

☁️ Cloud-based song sharing and practice sessions

📈 Advanced AI-powered feedback for performance improvement

🧠 Expand music theory modules

📚 References
McVicar et al. (2014) – Automatic Chord Estimation

Böck et al. (2016) – madmom Library

Su & Cheng (2015) – Gamification in Music Learning

Bogdanov et al. (2013) – Essentia

McFee et al. (2015) – librosa
