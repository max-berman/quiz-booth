// Mock API responses for development
export const mockApiResponses = {
  playCount: {
    '1e92e4c5-c4dc-4f1c-a8dd-7c6c1420740c': { count: 0 },
    '8bbb098a-4a4d-4205-8045-3ae0f430e6c2': { count: 2 },
    '353cf779-f5cc-4901-970e-ea0613944fe4': { count: 1 }
  } as Record<string, { count: number }>,
  questions: {
    '1e92e4c5-c4dc-4f1c-a8dd-7c6c1420740c': [
      {
        "id": "577c9227-3534-4c27-8827-9c3abcaa82b2",
        "gameId": "1e92e4c5-c4dc-4f1c-a8dd-7c6c1420740c",
        "questionText": "Nike's iconic 'Just Do It' slogan was inspired by what unusual source?",
        "options": [
          "A fortune cookie message",
          "A Beatles song lyric",
          "A motivational speech by a high school coach",
          "The last words of a convicted murderer"
        ],
        "correctAnswer": 3,
        "explanation": "The 'Just Do It' slogan was reportedly inspired by the last words of convicted murderer Gary Gilmore, who said 'Let's do it' before his execution in 1977.",
        "order": 1
      },
      {
        "id": "5ab55982-52f1-486b-bbf7-deb83e5a3de0",
        "gameId": "1e92e4c5-c4dc-4f1c-a8dd-7c6c1420740c",
        "questionText": "What was the original purpose of the 'Air' technology that became famous in Air Jordan sneakers?",
        "options": [
          "To provide cushioning in running shoes",
          "To reduce manufacturing costs",
          "As a fashion statement",
          "To make basketball shoes lighter"
        ],
        "correctAnswer": 0,
        "explanation": "Nike Air technology was originally developed by NASA engineer Marion Franklin Rudy for running shoes in 1979, using pressurized gas in a durable membrane for cushioning.",
        "order": 5
      },
      {
        "id": "5d9ced99-d5d4-4c9c-bbd3-e4c2c62b144f",
        "gameId": "1e92e4c5-c4dc-4f1c-a8dd-7c6c1420740c",
        "questionText": "Which of these Nike innovations was originally created using a waffle iron?",
        "options": [
          "The original swoosh logo",
          "The first waffle sole",
          "The first moisture-wicking fabric",
          "The first synthetic running shorts"
        ],
        "correctAnswer": 1,
        "explanation": "Nike co-founder Bill Bowerman created the first waffle sole by pouring rubber into his wife's waffle iron, revolutionizing running shoe traction.",
        "order": 4
      },
      {
        "id": "dc69aec8-830d-401c-b668-ae8cb503af44",
        "gameId": "1e92e4c5-c4dc-4f1c-a8dd-7c6c1420740c",
        "questionText": "What was Nike's original name before rebranding in 1971?🏃‍♂️",
        "options": [
          "Blue Ribbon Sports",
          "Runner's World",
          "Track Star Athletics",
          "Velocity Footwear"
        ],
        "correctAnswer": 0,
        "explanation": "Nike was originally founded as Blue Ribbon Sports in 1964 by Bill Bowerman and Phil Knight before being renamed Nike in 1971.",
        "order": 2
      },
      {
        "id": "eb31d1de-ea55-4352-82af-14dd2a1ba8e6",
        "gameId": "1e92e4c5-c4dc-4f1c-a8dd-7c6c1420740c",
        "questionText": "Nike's famous 'swoosh' logo was designed by a graphic design student for how much?",
        "options": [
          "$500",
          "She did it for free",
          "$35",
          "$100"
        ],
        "correctAnswer": 2,
        "explanation": "Portland State University student Carolyn Davidson designed the iconic swoosh logo in 1971 for just $35, though she later received Nike stock worth much more.",
        "order": 3
      }
    ],
    '8bbb098a-4a4d-4205-8045-3ae0f430e6c2': [
      // Add mock questions for other games as needed
    ],
    '353cf779-f5cc-4901-970e-ea0613944fe4': [
      // Add mock questions for other games as needed
    ]
  } as Record<string, any[]>
};

// Mock API handler for development
export const mockApiHandler = async (path: string): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const pathParts = path.split('/');
  const gameId = pathParts[pathParts.length - 2];
  const endpoint = pathParts[pathParts.length - 1];

  if (endpoint === 'play-count') {
    return mockApiResponses.playCount[gameId] || { count: 0 };
  } else if (endpoint === 'questions') {
    return mockApiResponses.questions[gameId] || [];
  }

  throw new Error(`Unknown endpoint: ${path}`);
};
