import * as admin from 'firebase-admin';

export async function fetchPageData(path: string, query: any) {
  const db = admin.firestore();

  try {
    switch (path) {
      case '/quiz-games':
        // Fetch public games for SSR
        const gamesSnapshot = await db.collection('games')
          .where('isPublic', '==', true)
          .where('status', '==', 'active')
          .orderBy('createdAt', 'desc')
          .limit(20)
          .get();

        const publicGames = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return { publicGames };

      case '/game':
        // Fetch specific game data for SSR if ID is provided
        const gameId = query.id;
        if (gameId && typeof gameId === 'string') {
          const gameDoc = await db.collection('games').doc(gameId).get();
          if (gameDoc.exists) {
            const gameData = gameDoc.data();
            return {
              game: {
                id: gameDoc.id,
                title: gameData?.title || 'Untitled Game',
                description: gameData?.description || 'No description available',
                isPublic: gameData?.isPublic || false
              }
            };
          }
        }
        return {};

      default:
        return {};
    }
  } catch (error) {
    console.error('Firestore SSR Error:', error);
    return {};
  }
}
