export interface Movie {
  id: number;      
  title: string;
  description?: string; 
  duration: number;
  genre: string;
  releaseYear: number;
  posterUrl?: string | undefined;
  sessions: {
    time:  {
            timeSeance: string,
            seanceId: number
          }[];
    hallName: string | undefined;
  };
}