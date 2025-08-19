
import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import DateSelector from '../components/ui/DateSelector';
import type { Movie } from '../types/Movie';
import type { ApiAllData } from '@/types/ApiAllData';

import './Home.css';
import MovieCard from '../components/ui/MovieCard';


const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await apiClient.get<ApiAllData>('/alldata');

        if (!response.success) {
          console.error('Ошибка API:', response.error);
          return;
        }

        const { halls, films, seances } = response.result;
        console.log("seances", seances);
        console.log("films", films);
        console.log("halls", halls);
        //todo определить дату и вывести сеансы по дате
        const seancesWithHalls = (filmId:number) => {
          const seancesList = seances.filter(seance => seance.seance_filmid===filmId);
          console.log("secances", seancesList);
          const listSeances = seancesList.map(seance => {return {timeSeance:seance.seance_time, seanceId:seance.id}});
          console.log("list",listSeances)
          if (seancesList.length === 0) {
            return {
              time: [],
              hallName: '',
            };
          }
          const hallName = halls.find(h => h.id === seancesList[0].seance_hallid)?.hall_name;
          return {
            time: listSeances,
            hallName,
                   }
        }
        // Преобразуем данные
        const filmWithSessions: Movie[] = films.map(film => ({
            id: film.id,
            title: film.film_name,
            duration: film.film_duration,
            genre: 'Боевик', // или добавь в API
            releaseYear: 2023, // или добавь в API
            description: film.film_description || 'Описание недоступно', // ← Добавь description
            posterUrl: film.film_poster?.trim(),
            sessions: seancesWithHalls(film.id)
          }));

        setMovies(filmWithSessions);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <div className="home-page">
      <DateSelector onChange={setSelectedDate} />
      <div className="movie-list">
        {movies.map(film => <MovieCard movie={film} keyIndex={film.id}/>)}
      </div>
    </div>
  );
};

export default Home;