
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
  console.log("selectedDate", selectedDate);
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await apiClient.get<ApiAllData>('/alldata');

        if (!response.success) {
          console.error('Ошибка API:', response.error);
          return;
        }
        const { halls, films, seances } = response.result;
       
        //todo определить дату и вывести сеансы по дате
        const seancesWithHalls = (filmId: number) => {
              const seancesList = seances
                .filter(seance => seance.seance_filmid === filmId)
                .filter(seance => {
                  const hall = halls.find(h => h.id === seance.seance_hallid);
                  return hall?.hall_open === 1;
                });

              const map = new Map<number, { hallName: string; seanceTimes: { seanceId: number; seance_time: string }[] }>();

              seancesList.forEach(seance => {
                const hall = halls.find(h => h.id === seance.seance_hallid);
                if (!hall) return;

                const key = hall.id;
                const timeObj = { seanceId: seance.id, seance_time: seance.seance_time };

                if (map.has(key)) {
                  map.get(key)!.seanceTimes.push(timeObj);
                } else {
                  map.set(key, {
                    hallName: hall.hall_name,
                    seanceTimes: [timeObj],
                  });
                }
              });

              return Array.from(map.values());
            };
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
        {movies.map(film => <div key={film.id}><MovieCard movie={film} keyIndex={film.id}/></div>)}
      </div>
    </div>
  );
};

export default Home;