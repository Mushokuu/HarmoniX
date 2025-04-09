import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Question {
  question: string;
  options: { text: string; isCorrect: boolean }[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

const quizSections: Section[] = [
  {
    id: 'basics',
    title: 'Guitar Basics',
    description: 'Learn the fundamental concepts of guitar',
    questions: [
      {
        question: 'What are the 6 strings of a guitar from thickest to thinnest?',
        options: [
          { text: 'E A D G B E', isCorrect: true },
          { text: 'A D G B E E', isCorrect: false },
          { text: 'E A D G B A', isCorrect: false },
          { text: 'E D A G B E', isCorrect: false }
        ]
      },
      {
        question: 'What is the standard tuning of a guitar?',
        options: [
          { text: 'Drop D', isCorrect: false },
          { text: 'Standard E', isCorrect: true },
          { text: 'Open G', isCorrect: false },
          { text: 'Open D', isCorrect: false }
        ]
      },
      {
        question: 'Which part of the guitar produces sound?',
        options: [
          { text: 'Headstock', isCorrect: false },
          { text: 'Bridge', isCorrect: false },
          { text: 'Soundhole', isCorrect: false },
          { text: 'All of the above', isCorrect: true }
        ]
      },
      {
        question: 'What is a fret?',
        options: [
          { text: 'A type of string', isCorrect: false },
          { text: 'Metal strips on the fretboard', isCorrect: true },
          { text: 'A tuning peg', isCorrect: false },
          { text: 'The body of the guitar', isCorrect: false }
        ]
      },
      {
        question: 'What material are most guitar picks made from?',
        options: [
          { text: 'Metal', isCorrect: false },
          { text: 'Wood', isCorrect: false },
          { text: 'Plastic', isCorrect: true },
          { text: 'Glass', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'theory',
    title: 'Music Theory',
    description: 'Master essential music theory concepts',
    questions: [
      {
        question: 'How many semitones are in an octave?',
        options: [
          { text: '8', isCorrect: false },
          { text: '10', isCorrect: false },
          { text: '12', isCorrect: true },
          { text: '14', isCorrect: false }
        ]
      },
      {
        question: 'What is the interval between the 1st and 5th note of a major scale?',
        options: [
          { text: 'Major Third', isCorrect: false },
          { text: 'Perfect Fourth', isCorrect: false },
          { text: 'Perfect Fifth', isCorrect: true },
          { text: 'Major Sixth', isCorrect: false }
        ]
      },
      {
        question: 'What makes a major chord?',
        options: [
          { text: 'Root, Third, Fifth', isCorrect: true },
          { text: 'Root, Fourth, Sixth', isCorrect: false },
          { text: 'Root, Second, Fifth', isCorrect: false },
          { text: 'Root, Third, Sixth', isCorrect: false }
        ]
      },
      {
        question: 'What is the relative minor of C major?',
        options: [
          { text: 'A minor', isCorrect: true },
          { text: 'E minor', isCorrect: false },
          { text: 'D minor', isCorrect: false },
          { text: 'B minor', isCorrect: false }
        ]
      },
      {
        question: 'What is a time signature?',
        options: [
          { text: 'Tempo of a song', isCorrect: false },
          { text: 'Number of beats per measure', isCorrect: true },
          { text: 'Key of a song', isCorrect: false },
          { text: 'Type of note', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'chords',
    title: 'Chords & Scales',
    description: 'Learn essential chords and scale patterns',
    questions: [
      {
        question: 'What notes make up a C major chord?',
        options: [
          { text: 'C-E-G', isCorrect: true },
          { text: 'C-F-A', isCorrect: false },
          { text: 'C-D-G', isCorrect: false },
          { text: 'C-E-A', isCorrect: false }
        ]
      },
      {
        question: 'How many notes are in a major scale?',
        options: [
          { text: '5', isCorrect: false },
          { text: '6', isCorrect: false },
          { text: '7', isCorrect: true },
          { text: '8', isCorrect: false }
        ]
      },
      {
        question: 'What is a power chord?',
        options: [
          { text: 'Root and Fifth', isCorrect: true },
          { text: 'Root and Third', isCorrect: false },
          { text: 'Root and Fourth', isCorrect: false },
          { text: 'Root and Sixth', isCorrect: false }
        ]
      },
      {
        question: 'Which scale is most commonly used in blues?',
        options: [
          { text: 'Major Scale', isCorrect: false },
          { text: 'Minor Scale', isCorrect: false },
          { text: 'Pentatonic Scale', isCorrect: true },
          { text: 'Chromatic Scale', isCorrect: false }
        ]
      },
      {
        question: 'What interval is between the root and third of a minor chord?',
        options: [
          { text: 'Major Third', isCorrect: false },
          { text: 'Minor Third', isCorrect: true },
          { text: 'Perfect Fourth', isCorrect: false },
          { text: 'Perfect Fifth', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'techniques',
    title: 'Guitar Techniques',
    description: 'Master advanced playing techniques',
    questions: [
      {
        question: 'What is palm muting?',
        options: [
          { text: 'Muting strings with left hand', isCorrect: false },
          { text: 'Muting strings with right palm', isCorrect: true },
          { text: 'Not playing strings', isCorrect: false },
          { text: 'Using a mute pedal', isCorrect: false }
        ]
      },
      {
        question: 'What is a hammer-on?',
        options: [
          { text: 'Hitting the strings hard', isCorrect: false },
          { text: 'Playing a note without picking', isCorrect: true },
          { text: 'Using a slide', isCorrect: false },
          { text: 'Bending strings', isCorrect: false }
        ]
      },
      {
        question: 'What does bending a string do?',
        options: [
          { text: 'Makes it louder', isCorrect: false },
          { text: 'Raises the pitch', isCorrect: true },
          { text: 'Makes it quieter', isCorrect: false },
          { text: 'Changes the tone', isCorrect: false }
        ]
      },
      {
        question: 'What is tapping?',
        options: [
          { text: 'Using both hands on fretboard', isCorrect: true },
          { text: 'Hitting the body', isCorrect: false },
          { text: 'Using a pick', isCorrect: false },
          { text: 'Strumming pattern', isCorrect: false }
        ]
      },
      {
        question: 'What is alternate picking?',
        options: [
          { text: 'Using multiple picks', isCorrect: false },
          { text: 'Down-up picking pattern', isCorrect: true },
          { text: 'Only downstrokes', isCorrect: false },
          { text: 'Only upstrokes', isCorrect: false }
        ]
      }
    ]
  },
  {
    id: 'maintenance',
    title: 'Guitar Maintenance',
    description: 'Learn how to care for your instrument',
    questions: [
      {
        question: 'How often should you change guitar strings?',
        options: [
          { text: 'Every week', isCorrect: false },
          { text: 'Every 2-3 months', isCorrect: true },
          { text: 'Once a year', isCorrect: false },
          { text: 'Never', isCorrect: false }
        ]
      },
      {
        question: 'What can you use to clean guitar strings?',
        options: [
          { text: 'Water', isCorrect: false },
          { text: 'String cleaner', isCorrect: true },
          { text: 'Oil', isCorrect: false },
          { text: 'Soap', isCorrect: false }
        ]
      },
      {
        question: 'What causes fret buzz?',
        options: [
          { text: 'Low action', isCorrect: true },
          { text: 'High action', isCorrect: false },
          { text: 'New strings', isCorrect: false },
          { text: 'Clean frets', isCorrect: false }
        ]
      },
      {
        question: 'How should you store a guitar?',
        options: [
          { text: 'In sunlight', isCorrect: false },
          { text: 'In case/stand', isCorrect: true },
          { text: 'On floor', isCorrect: false },
          { text: 'Against wall', isCorrect: false }
        ]
      },
      {
        question: 'What affects guitar intonation?',
        options: [
          { text: 'String age', isCorrect: false },
          { text: 'Bridge position', isCorrect: false },
          { text: 'Both A and B', isCorrect: true },
          { text: 'Neither', isCorrect: false }
        ]
      }
    ]
  }
];

const LearnScreen = () => {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const handleSectionSelect = (section: Section): void => {
    setSelectedSection(section);
    setCurrentQuestion(0);
    setScore(0);
    setShowResults(false);
  };

  const handleAnswer = (isCorrect: boolean): void => {
    if (isCorrect) {
      setScore(score + 1);
    }
    if (currentQuestion < selectedSection!.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
      if (!completedSections.includes(selectedSection!.id)) {
        setCompletedSections([...completedSections, selectedSection!.id]);
      }
    }
  };

  const handleBack = (): void => {
    if (selectedSection) {
      setSelectedSection(null);
      setShowResults(false);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Learn Guitar</Text>
      </View>

      {showResults ? (
        <View style={styles.resultsContainer}>
          {score === selectedSection?.questions.length ? (
            <>
              <Ionicons name="star" size={80} color="#FFD700" />
              <Text style={styles.congratsText}>Amazing job!</Text>
              <Text style={styles.scoreText}>Perfect Score!</Text>
              <Text style={styles.encouragementText}>Keep up the great work!</Text>
            </>
          ) : (
            <>
              <Text style={styles.scoreText}>
                Score: {score}/{selectedSection?.questions.length}
              </Text>
              <TouchableOpacity 
                onPress={() => handleSectionSelect(selectedSection!)} 
                style={styles.button}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : selectedSection ? (
        <View style={styles.container}>
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${((currentQuestion + 1) / selectedSection.questions.length) * 100}%`,
                },
              ]}
            />
            <Text style={styles.progressText}>
              {currentQuestion + 1}/{selectedSection.questions.length}
            </Text>
          </View>
          
          <Text style={styles.questionText}>
            {selectedSection.questions[currentQuestion].question}
          </Text>
          
          {selectedSection.questions[currentQuestion].options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionButton}
              onPress={() => handleAnswer(option.isCorrect)}
            >
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <ScrollView style={styles.sectionList}>
          {quizSections.map((section, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sectionItem,
                completedSections.includes(section.id) && styles.completedSection
              ]}
              onPress={() => handleSectionSelect(section)}
            >
              <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionDescription}>{section.description}</Text>
                {completedSections.includes(section.id) && (
                  <Ionicons name="checkmark-circle" size={24} color="#00c853" style={styles.completedIcon} />
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#222',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionList: {
    flex: 1,
    padding: 15,
  },
  sectionItem: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionContent: {
    flex: 1,
    marginRight: 10,
  },
  completedSection: {
    borderColor: '#00c853',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  sectionDescription: {
    color: '#999',
    fontSize: 14,
  },
  completedIcon: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#333',
    marginVertical: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00c853',
  },
  progressText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  questionText: {
    fontSize: 20,
    color: 'white',
    padding: 20,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#333',
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
  },
  scoreText: {
    fontSize: 24,
    color: 'white',
    marginVertical: 10,
  },
  encouragementText: {
    fontSize: 18,
    color: '#00c853',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#00c853',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LearnScreen; 