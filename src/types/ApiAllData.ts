export interface ApiHall {
  id: number;
  hall_name: string;
  hall_rows: number;
  hall_places: number;
  hall_config: string[][];
  hall_price_standart: number;
  hall_price_vip: number;
  hall_open: 0 | 1;
}

export interface ApiFilm {
  id: number;
  film_name: string;
  film_duration: number;
  film_origin: string;
  film_poster: string;
  film_description: string;
}

export interface ApiSeance {
  id: number;
  seance_filmid: number;
  seance_hallid: number;
  seance_time: string; // "10:10"
}

export interface ApiAllData {
  halls: ApiHall[];
  films: ApiFilm[];
  seances: ApiSeance[];
}