import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import './SeanceGridPanel.css';

// Типы
interface Hall {
  id: number;
  hall_name: string;
}

interface Film {
  id: number;
  film_name: string;
  film_duration: number;
}

interface Seance {
  id: number;
  seance_filmid: number;
  seance_hallid: number;
  seance_time: string;
}

interface ApiAllData {
  halls: Hall[];
  films: Film[];
  seances: Seance[];
}

// Временные слоты (каждые 30 минут)
const TIME_SLOTS = Array.from({ length: 24 }, (_, h) =>
  Array.from({ length: 2 }, (_, m) => `${h.toString().padStart(2, '0')}:${(m * 30).toString().padStart(2, '0')}`)
).flat();

// Ограничение: сеансы до 23:59
const VALID_TIME_SLOTS = TIME_SLOTS.filter(time => time < '23:30');

const SeanceGridPanel: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [draggedFilm, setDraggedFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<ApiAllData>('/alldata');
        if (response.success) {
          setHalls(response.result.halls);
          setFilms(response.result.films);
          setSeances(response.result.seances);
        } else {
          setError(response.error || 'Не удалось загрузить данные');
        }
      } catch (err) {
        setError('Ошибка сети');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Проверка на пересечение сеансов
  const isTimeSlotAvailable = (hallId: number, time: string, duration: number): boolean => {
    const startMinutes = timeToMinutes(time);
    const endMinutes = startMinutes + duration;

    const conflicting = seances.find(s => {
      const existingStart = timeToMinutes(s.seance_time);
      const existingDuration = films.find(f => f.id === s.seance_filmid)?.film_duration || 0;
      const existingEnd = existingStart + existingDuration;

      return (
        s.seance_hallid === hallId &&
        startMinutes < existingEnd &&
        endMinutes > existingStart
      );
    });

    return !conflicting;
  };

  const timeToMinutes = (time: string): number => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

//   const minutesToTime = (minutes: number): string => {
//     const h = Math.floor(minutes / 60);
//     const m = minutes % 60;
//     return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
//   };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, film: Film) => {
    setDraggedFilm(film);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, hallId: number, time: string) => {
    e.preventDefault();
    if (!draggedFilm) return;

    if (!isTimeSlotAvailable(hallId, time, draggedFilm.film_duration)) {
      setError('Сеанс пересекается с другим показом');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const formData = new FormData();
    formData.append('seanceHallid', hallId.toString());
    formData.append('seanceFilmid', draggedFilm.id.toString());
    formData.append('seanceTime', time);

    try {
      const response = await apiClient.post<{ seances: Seance[] }>('/seance', formData);
      if (response.success) {
        setSeances(response.result.seances);
        setError(null);
      } else {
        setError(response.error || 'Не удалось добавить сеанс');
      }
    } catch (err) {
      setError('Ошибка сети при добавлении сеанса');
    }

    setDraggedFilm(null);
  };

  // Удаление сеанса
  const handleRemoveSeance = async (seanceId: number) => {
    try {
      const response = await apiClient.post<{ seances: Seance[] }>(`/seance/${seanceId}`, new FormData());
      if (response.success) {
        setSeances(response.result.seances);
      } else {
        setError(response.error || 'Не удалось удалить сеанс');
      }
    } catch (err) {
      setError('Ошибка сети при удалении сеанса');
    }
  };

  if (loading) return <div className="seance-grid-panel">Загрузка...</div>;

  return (
    <div className="seance-grid-panel panel">
      <h2>Сетка сеансов</h2>
      {error && <div className="panel__error">{error}</div>}

      <div className="seance-grid-panel__controls">
        <button
          onClick={() => {
            alert('Функция добавления фильма временно недоступна. Используйте drag-and-drop.');
          }}
        >
          Добавить фильм
        </button>
      </div>

      <div className="seance-grid-panel__drag-list">
        <h3>Фильмы</h3>
        <div className="seance-grid-panel__films">
          {films.map(film => (
            <div
              key={film.id}
              className="seance-grid-panel__film"
              draggable
              onDragStart={e => handleDragStart(e, film)}
            >
              {film.film_name} ({film.film_duration} мин)
            </div>
          ))}
        </div>
      </div>

      <div className="seance-grid-panel__grid">
        <div className="seance-grid-panel__time-header">
          <div className="seance-grid-panel__time-header-cell"></div>
          {VALID_TIME_SLOTS.map(time => (
            <div key={time} className="seance-grid-panel__time-header-cell">
              {time}
            </div>
          ))}
        </div>

        {halls.map(hall => (
          <div key={hall.id} className="seance-grid-panel__hall-row">
            <div className="seance-grid-panel__hall-label">{hall.hall_name}</div>
            {VALID_TIME_SLOTS.map(time => {
              const activeSeance = seances.find(
                s => s.seance_hallid === hall.id && s.seance_time === time
              );
              const film = films.find(f => f.id === activeSeance?.seance_filmid);

              return (
                <div
                  key={time}
                  className={`seance-grid-panel__cell ${
                    activeSeance ? 'seance-grid-panel__cell--occupied' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, hall.id, time)}
                >
                  {activeSeance ? (
                    <div className="seance-grid-panel__seance">
                      <span>{film?.film_name}</span>
                      <button
                        onClick={() => handleRemoveSeance(activeSeance.id)}
                        className="seance-grid-panel__remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="seance-grid-panel__legend">
        <div className="seance-grid-panel__legend-item">
          <div className="seance-grid-panel__legend-color"></div>
          <span>Доступно для сеанса</span>
        </div>
        <div className="seance-grid-panel__legend-item">
          <div className="seance-grid-panel__legend-color seance-grid-panel__legend-color--occupied"></div>
          <span>Занято</span>
        </div>
      </div>
    </div>
  );
};

export default SeanceGridPanel;