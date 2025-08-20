export interface Movie {
  id: number;      
  title: string;
  description?: string; 
  duration: number;
  genre: string;
  releaseYear: number;
  posterUrl?: string | undefined;
  sessions: {
    hallName: string;
    seanceTimes: {
        seanceId: number;
        seance_time: string;
    }[];
  }[];
}