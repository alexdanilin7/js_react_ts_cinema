
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
       console.log("halls", halls, "films", films, "seances", seances);
       localStorage.setItem("seances", JSON.stringify(seances));
       localStorage.setItem("films", JSON.stringify(films));
       localStorage.setItem("halls", JSON.stringify(halls));
        //todo определить дату и вывести сеансы по дате
        const seancesWithHalls = (filmId: number) => {
              const now = new Date();
              const seancesList = seances
                .filter(seance => seance.seance_filmid === filmId)
                .filter(seance => {
                  const hall = halls.find(h => h.id === seance.seance_hallid);
                  return hall?.hall_open === 1;
                })
                .filter(seance => {
                    const [hours, minutes] = seance.seance_time.split(':').map(Number);
                    const seanceDate = new Date(selectedDate);
                    seanceDate.setHours(hours, minutes, 0, 0); 
                return seanceDate >= now; 
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
        const filmWithSessions: Movie[] = films.filter(film => seancesWithHalls(film.id).length > 0).map(film => ( {
            id: film.id,
            title: film.film_name,
            duration: film.film_duration,
            genre: film.film_origin, 
            releaseYear: 2023, 
            description: film.film_description || 'Описание недоступно', 
            posterUrl: film.film_poster?.trim(),
            sessions: seancesWithHalls(film.id)
          }));

        setMovies(filmWithSessions);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchSchedule();
  }, [selectedDate]);

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