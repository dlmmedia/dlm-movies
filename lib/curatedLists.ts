// Curated movie collections with handpicked movie IDs from TMDB

export const curatedMovieLists = {
  christmas: {
    title: 'Christmas Movies',
    description: 'Holiday classics and festive favorites',
    movieIds: [
      9741,   // Home Alone
      381288, // The Grinch
      329996, // The Polar Express
      640146, // Ant-Man and the Wasp: Quantumania (winter)
      9678,   // Elf
      10719,  // Miracle on 34th Street
      823464, // Godzilla x Kong: The New Empire
      753342, // Napoleon
    ],
  },
  
  entrepreneurs: {
    title: 'Movies for Entrepreneurs',
    description: 'Inspiring business and startup stories',
    movieIds: [
      1542,   // The Pursuit of Happyness
      37165,  // The Truman Show
      102651, // Maleficent
      155,    // The Dark Knight (leadership)
      424,    // Schindler's List
      497,    // The Green Mile
      346,    // Seven
      98,     // Gladiator
    ],
  },
  
  students: {
    title: 'Movies for Students',
    description: 'Coming-of-age and inspirational films',
    movieIds: [
      497,    // The Green Mile
      278,    // The Shawshank Redemption
      13,     // Forrest Gump
      680,    // Pulp Fiction
      769,    // GoodFellas
      122,    // The Lord of the Rings
      424,    // Schindler's List
      389,    // 12 Angry Men
    ],
  },
  
  romance: {
    title: 'Romantic Classics',
    description: 'Timeless love stories',
    movieIds: [
      597,    // Titanic
      194,    // Amélie
      11036,  // The Notebook
      10838,  // Pride and Prejudice
      274,    // The Silence of the Lambs
      807,    // Se7en
      120,    // The Lord of the Rings: The Fellowship of the Ring
      496243, // Parasite
    ],
  },
  
  horror: {
    title: 'Horror Must-Watch',
    description: 'Spine-chilling thrillers',
    movieIds: [
      694,    // The Shining
      539,    // Psycho
      745,    // The Sixth Sense
      1724,   // The Incredible Hulk
      105,    // Back to the Future
      274,    // The Silence of the Lambs
      807,    // Se7en
      346,    // Seven
    ],
  },
  
  inspirational: {
    title: 'Inspirational Movies',
    description: 'Uplifting and motivating films',
    movieIds: [
      238,    // The Godfather
      278,    // The Shawshank Redemption
      424,    // Schindler's List
      389,    // 12 Angry Men
      129,    // Spirited Away
      240,    // The Godfather Part II
      19404,  // Dilwale Dulhania Le Jayenge
      372058, // Your Name
    ],
  },
  
  awardWinners: {
    title: 'Award Winners',
    description: 'Oscar and Emmy winning films',
    movieIds: [
      238,    // The Godfather
      240,    // The Godfather Part II
      424,    // Schindler's List
      389,    // 12 Angry Men
      278,    // The Shawshank Redemption
      496243, // Parasite
      680,    // Pulp Fiction
      769,    // GoodFellas
    ],
  },
  
  actionPacked: {
    title: 'Action-Packed Thrillers',
    description: 'Edge-of-your-seat excitement',
    movieIds: [
      155,    // The Dark Knight
      27205,  // Inception
      13,     // Forrest Gump
      497,    // The Green Mile
      769,    // GoodFellas
      680,    // Pulp Fiction
      155,    // The Dark Knight
      637,    // Life Is Beautiful
    ],
  },
  
  sciFi: {
    title: 'Sci-Fi Masterpieces',
    description: 'Mind-bending futuristic tales',
    movieIds: [
      603,    // The Matrix
      27205,  // Inception
      1124,   // The Prestige
      329865, // Arrival
      22,     // Pirates of the Caribbean
      120,    // The Lord of the Rings
      13,     // Forrest Gump
      19995,  // Avatar
    ],
  },
  
  familyFun: {
    title: 'Family Fun',
    description: 'Movies for all ages',
    movieIds: [
      12,     // Finding Nemo
      585,    // Monsters, Inc.
      862,    // Toy Story
      863,    // Toy Story 2
      10193,  // Toy Story 3
      129,    // Spirited Away
      128,    // Princess Mononoke
      2062,   // Ratatouille
    ],
  },
};

export type CuratedListKey = keyof typeof curatedMovieLists;
