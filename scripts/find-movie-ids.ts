// Script to find TMDB IDs for movies
// Run with: npx tsx scripts/find-movie-ids.ts

const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

interface SearchResult {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
}

async function searchMovie(title: string, year?: number): Promise<number | null> {
  try {
    const query = encodeURIComponent(title);
    const yearParam = year ? `&year=${year}` : '';
    const url = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${query}${yearParam}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const movie = data.results[0] as SearchResult;
      console.log(`✓ ${title} (${year || 'N/A'}) -> ID: ${movie.id} (${movie.title})`);
      return movie.id;
    } else {
      console.log(`✗ ${title} (${year || 'N/A'}) -> NOT FOUND`);
      return null;
    }
  } catch (error) {
    console.error(`Error searching for ${title}:`, error);
    return null;
  }
}

async function main() {
  console.log('=== ENTREPRENEURS ===\n');
  const entrepreneurs = [
    { title: 'The Founder', year: 2016 },
    { title: 'The Social Network', year: 2010 },
    { title: 'Joy', year: 2015 },
    { title: 'The Pursuit of Happyness', year: 2006 },
    { title: 'Steve Jobs', year: 2015 },
    { title: 'Moneyball', year: 2011 },
    { title: 'The Wolf of Wall Street', year: 2013 },
    { title: 'Pirates of Silicon Valley', year: 1999 },
    { title: 'Tucker: The Man and His Dream', year: 1988 },
    { title: 'Glengarry Glen Ross', year: 1992 },
    { title: 'The Aviator', year: 2004 },
    { title: 'The Devil Wears Prada', year: 2006 },
    { title: 'Chef', year: 2014 },
    { title: 'Catch Me If You Can', year: 2002 },
    { title: 'A Beautiful Mind', year: 2001 },
    { title: 'The Circle', year: 2017 },
    { title: 'Jobs', year: 2013 },
    { title: 'Office Space', year: 1999 },
    { title: 'Boiler Room', year: 2000 },
    { title: 'The Great Hack', year: 2019 },
  ];
  
  const entrepreneurIds = [];
  for (const movie of entrepreneurs) {
    const id = await searchMovie(movie.title, movie.year);
    if (id) entrepreneurIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 250)); // Rate limiting
  }
  console.log('\nentrepreneurs: [' + entrepreneurIds.join(', ') + ']\n\n');

  console.log('=== CHRISTMAS ===\n');
  const christmas = [
    { title: "It's a Wonderful Life", year: 1946 },
    { title: 'Miracle on 34th Street', year: 1947 },
    { title: 'White Christmas', year: 1954 },
    { title: 'A Christmas Carol', year: 2009 },
    { title: 'Rudolph the Red-Nosed Reindeer', year: 1964 },
    { title: 'A Charlie Brown Christmas', year: 1965 },
    { title: 'Gremlins', year: 1984 },
    { title: 'Scrooged', year: 1988 },
    { title: 'Die Hard', year: 1988 },
    { title: "National Lampoon's Christmas Vacation", year: 1989 },
    { title: 'Home Alone', year: 1990 },
    { title: 'The Muppet Christmas Carol', year: 1992 },
    { title: 'The Nightmare Before Christmas', year: 1993 },
    { title: 'The Santa Clause', year: 1994 },
    { title: 'The Polar Express', year: 2004 },
    { title: 'Elf', year: 2003 },
    { title: 'Love Actually', year: 2003 },
    { title: 'The Grinch', year: 2018 },
    { title: 'Klaus', year: 2019 },
    { title: 'A Christmas Story', year: 1983 },
    { title: 'How the Grinch Stole Christmas', year: 2000 },
    { title: 'The Holiday', year: 2006 },
    { title: 'Fred Claus', year: 2007 },
    { title: 'Jack Frost', year: 1998 },
    { title: 'The Best Man Holiday', year: 2013 },
    { title: 'Planes, Trains and Automobiles', year: 1987 },
    { title: 'Home for the Holidays', year: 1995 },
    { title: 'The Man Who Invented Christmas', year: 2017 },
    { title: 'Last Christmas', year: 2019 },
    { title: 'A Boy Called Christmas', year: 2021 },
  ];
  
  const christmasIds = [];
  for (const movie of christmas) {
    const id = await searchMovie(movie.title, movie.year);
    if (id) christmasIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  console.log('\nchristmas: [' + christmasIds.join(', ') + ']\n\n');

  console.log('=== STUDENTS ===\n');
  const students = [
    { title: 'Dead Poets Society', year: 1989 },
    { title: 'Good Will Hunting', year: 1997 },
    { title: 'The Pursuit of Happyness', year: 2006 },
    { title: 'Freedom Writers', year: 2007 },
    { title: 'The Social Network', year: 2010 },
    { title: "The Emperor's Club", year: 2002 },
    { title: 'The Class', year: 2008 },
    { title: 'Hoop Dreams', year: 1994 },
    { title: 'Taare Zameen Par', year: 2007 },
    { title: 'Remember the Titans', year: 2000 },
    { title: 'Invictus', year: 2009 },
    { title: 'Moneyball', year: 2011 },
    { title: "The King's Speech", year: 2010 },
    { title: "Schindler's List", year: 1993 },
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'Akeelah and the Bee', year: 2006 },
    { title: 'Stand and Deliver', year: 1988 },
    { title: 'Lean on Me', year: 1989 },
    { title: 'The Great Debaters', year: 2007 },
    { title: 'Coach Carter', year: 2005 },
  ];
  
  const studentIds = [];
  for (const movie of students) {
    const id = await searchMovie(movie.title, movie.year);
    if (id) studentIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  console.log('\nstudents: [' + studentIds.join(', ') + ']\n\n');

  console.log('=== ROMANCE ===\n');
  const romance = [
    { title: 'Casablanca', year: 1942 },
    { title: 'Gone with the Wind', year: 1939 },
    { title: 'An Affair to Remember', year: 1957 },
    { title: 'Roman Holiday', year: 1953 },
    { title: "Breakfast at Tiffany's", year: 1961 },
    { title: 'The Graduate', year: 1967 },
    { title: 'Charade', year: 1963 },
    { title: 'The Sound of Music', year: 1965 },
    { title: 'Sabrina', year: 1954 },
    { title: 'West Side Story', year: 1961 },
    { title: 'Doctor Zhivago', year: 1965 },
    { title: 'The Way We Were', year: 1973 },
    { title: 'Love Story', year: 1970 },
    { title: 'Annie Hall', year: 1977 },
    { title: 'Out of Africa', year: 1985 },
    { title: 'The Princess Bride', year: 1987 },
    { title: 'When Harry Met Sally', year: 1989 },
    { title: 'Pretty Woman', year: 1990 },
    { title: 'Before Sunrise', year: 1995 },
    { title: 'Titanic', year: 1997 },
    { title: 'Notting Hill', year: 1999 },
    { title: 'The Notebook', year: 2004 },
    { title: 'Pride & Prejudice', year: 2005 },
    { title: 'La La Land', year: 2016 },
    { title: 'Sense & Sensibility', year: 1995 },
    { title: 'My Fair Lady', year: 1964 },
    { title: 'Romeo + Juliet', year: 1996 },
    { title: 'Sleepless in Seattle', year: 1993 },
    { title: 'A Walk to Remember', year: 2002 },
    { title: 'Jerry Maguire', year: 1996 },
  ];
  
  const romanceIds = [];
  for (const movie of romance) {
    const id = await searchMovie(movie.title, movie.year);
    if (id) romanceIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  console.log('\nromance: [' + romanceIds.join(', ') + ']\n\n');

  console.log('=== HORROR ===\n');
  const horror = [
    { title: 'The Exorcist', year: 1973 },
    { title: 'Psycho', year: 1960 },
    { title: 'The Texas Chain Saw Massacre', year: 1974 },
    { title: 'Halloween', year: 1978 },
    { title: 'A Nightmare on Elm Street', year: 1984 },
    { title: 'The Shining', year: 1980 },
    { title: 'Alien', year: 1979 },
    { title: 'The Silence of the Lambs', year: 1991 },
    { title: 'The Ring', year: 2002 },
    { title: 'The Blair Witch Project', year: 1999 },
    { title: 'Get Out', year: 2017 },
    { title: 'It', year: 2017 },
    { title: 'The Conjuring', year: 2013 },
    { title: 'Poltergeist', year: 1982 },
    { title: "Rosemary's Baby", year: 1968 },
    { title: 'An American Werewolf in London', year: 1981 },
    { title: 'Carrie', year: 1976 },
    { title: 'The Thing', year: 1982 },
    { title: 'Hereditary', year: 2018 },
    { title: 'It Follows', year: 2014 },
    { title: 'The Others', year: 2001 },
    { title: 'Jaws', year: 1975 },
    { title: 'Suspiria', year: 1977 },
    { title: 'The Babadook', year: 2014 },
    { title: 'Sinister', year: 2012 },
    { title: 'The Witch', year: 2015 },
    { title: 'Scream', year: 1996 },
    { title: 'The Wicker Man', year: 1973 },
    { title: '28 Days Later', year: 2002 },
    { title: 'The Omen', year: 1976 },
  ];
  
  const horrorIds = [];
  for (const movie of horror) {
    const id = await searchMovie(movie.title, movie.year);
    if (id) horrorIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  console.log('\nhorror: [' + horrorIds.join(', ') + ']\n\n');

  console.log('=== INSPIRATIONAL ===\n');
  const inspirational = [
    { title: "It's a Wonderful Life", year: 1946 },
    { title: 'Rocky', year: 1976 },
    { title: 'The Pursuit of Happyness', year: 2006 },
    { title: 'Good Will Hunting', year: 1997 },
    { title: 'The Shawshank Redemption', year: 1994 },
    { title: 'The Color Purple', year: 1985 },
    { title: 'To Kill a Mockingbird', year: 1962 },
    { title: 'Slumdog Millionaire', year: 2008 },
    { title: 'Hidden Figures', year: 2016 },
    { title: 'The Imitation Game', year: 2014 },
    { title: 'Erin Brockovich', year: 2000 },
    { title: 'The Green Mile', year: 1999 },
    { title: 'Chariots of Fire', year: 1981 },
    { title: 'Legally Blonde', year: 2001 },
    { title: 'The Secret Life of Walter Mitty', year: 2013 },
    { title: 'Lion', year: 2016 },
    { title: 'Selma', year: 2014 },
    { title: 'I Can Only Imagine', year: 2018 },
    { title: 'Soul Surfer', year: 2011 },
    { title: 'The Greatest Showman', year: 2017 },
    { title: 'Forrest Gump', year: 1994 },
    { title: 'Rudy', year: 1993 },
    { title: 'The Blind Side', year: 2009 },
    { title: 'Remember the Titans', year: 2000 },
    { title: 'The Pianist', year: 2002 },
    { title: "One Flew Over the Cuckoo's Nest", year: 1975 },
    { title: 'The Miracle Worker', year: 1962 },
    { title: 'Whiplash', year: 2014 },
    { title: 'Groundhog Day', year: 1993 },
    { title: 'The Intouchables', year: 2011 },
  ];
  
  const inspirationalIds = [];
  for (const movie of inspirational) {
    const id = await searchMovie(movie.title, movie.year);
    if (id) inspirationalIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  console.log('\ninspirational: [' + inspirationalIds.join(', ') + ']\n\n');

  console.log('=== FAMILY FUN ===\n');
  const family = [
    { title: 'The Lion King', year: 1994 },
    { title: 'Toy Story', year: 1995 },
    { title: 'Finding Nemo', year: 2003 },
    { title: 'The Incredibles', year: 2004 },
    { title: 'Up', year: 2009 },
    { title: 'Coco', year: 2017 },
    { title: 'The Wizard of Oz', year: 1939 },
    { title: 'Mary Poppins', year: 1964 },
    { title: 'E.T. the Extra-Terrestrial', year: 1982 },
    { title: 'Aladdin', year: 1992 },
    { title: 'Beauty and the Beast', year: 1991 },
    { title: 'Paddington', year: 2014 },
    { title: 'The Princess Bride', year: 1987 },
    { title: 'Shrek', year: 2001 },
    { title: 'The Chronicles of Narnia: The Lion, the Witch and the Wardrobe', year: 2005 },
    { title: 'WALL-E', year: 2008 },
    { title: 'Despicable Me', year: 2010 },
    { title: 'Moana', year: 2016 },
    { title: 'The Sandlot', year: 1993 },
    { title: 'The Goonies', year: 1985 },
    { title: 'School of Rock', year: 2003 },
    { title: "Harry Potter and the Sorcerer's Stone", year: 2001 },
    { title: 'The Parent Trap', year: 1998 },
    { title: 'The Jungle Book', year: 2016 },
    { title: 'Zootopia', year: 2016 },
    { title: 'A League of Their Own', year: 1992 },
    { title: "Charlotte's Web", year: 2006 },
    { title: 'The Secret Life of Pets', year: 2016 },
    { title: 'How to Train Your Dragon', year: 2010 },
    { title: 'Home Alone', year: 1990 },
  ];
  
  const familyIds = [];
  for (const movie of family) {
    const id = await searchMovie(movie.title, movie.year);
    if (id) familyIds.push(id);
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  console.log('\nfamilyFun: [' + familyIds.join(', ') + ']\n\n');
}

main().catch(console.error);
