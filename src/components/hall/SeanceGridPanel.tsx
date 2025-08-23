// src/components/admin/SeanceGridPanel/SeanceGridPanel.tsx
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
  film_poster: string;
  film_description?: string;
  film_country?: string;
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

const SeanceGridPanel: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [films, setFilms] = useState<Film[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [draggedFilm, setDraggedFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Модальное окно для сеансов
  const [isSeanceModalOpen, setIsSeanceModalOpen] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('00:00');

  // Модальное окно для фильмов
  const [isFilmModalOpen, setIsFilmModalOpen] = useState(false);
  const [newFilm, setNewFilm] = useState({
    film_name: '',
    film_duration: '',
    film_description: '',
    film_country: '',
    film_poster: null as File | null
  });

  // Загрузка данных
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

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, film: Film) => {
    setDraggedFilm(film);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, hallId: number, time: string) => {
    e.preventDefault();
    if (!draggedFilm) return;

    setSelectedHallId(hallId);
    setSelectedTime(time);
    setIsSeanceModalOpen(true);
  };

  // Добавление сеанса из модального окна
  const handleAddSeance = async () => {
    if (!selectedHallId || !draggedFilm || !selectedTime) return;

    if (!isTimeSlotAvailable(selectedHallId, selectedTime, draggedFilm.film_duration)) {
      setError('Сеанс пересекается с другим показом');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const formData = new FormData();
    formData.append('seanceHallid', selectedHallId.toString());
    formData.append('seanceFilmid', draggedFilm.id.toString());
    formData.append('seanceTime', selectedTime);

    try {
      const response = await apiClient.post<{ seances: Seance[] }>('/seance', formData);
      if (response.success) {
        setSeances(response.result.seances);
        setIsSeanceModalOpen(false);
        setError(null);
        setSuccessMessage('Сеанс успешно добавлен');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Не удалось добавить сеанс');
      }
    } catch (err) {
      setError('Ошибка сети при добавлении сеанса');
    }
  };

  // Добавление фильма
  const handleAddFilm = async () => {
    if (!newFilm.film_name || !newFilm.film_duration) {
      setError('Заполните обязательные поля: название и продолжительность');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const formData = new FormData();
    formData.append('filmName', newFilm.film_name);
    formData.append('filmDuration', newFilm.film_duration);
    formData.append('filmDescription', newFilm.film_description);
    formData.append('filmOrigin', newFilm.film_country);
    
    if (newFilm.film_poster) {
      formData.append('filePoster', newFilm.film_poster);
    }

    try {
      const response = await apiClient.post<{ films: Film[] }>('/film', formData);
      console.log("Response:", response);
      if (response.success) {
        setFilms(response.result.films);
        setIsFilmModalOpen(false);
        setNewFilm({
          film_name: '',
          film_duration: '',
          film_description: '',
          film_country: '',
          film_poster: null
        });
        setError(null);
        setSuccessMessage('Фильм успешно добавлен');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Не удалось добавить фильм');
      }
    } catch (err) {
      setError('Ошибка сети при добавлении фильма');
    }
  };
// Удаление фильма
  const handleRemoveFilm = async (filmId: number, filmName: string) => {
    // Проверить, есть ли сеансы с этим фильмом
    const filmSeances = seances.filter(s => s.seance_filmid === filmId);
    
    if (filmSeances.length > 0) {
      setError(`Нельзя удалить фильм "${filmName}" - есть активные сеансы`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!window.confirm(`Вы уверены, что хотите удалить фильм "${filmName}"?`)) {
      return;
    }

    try {
      const response = await apiClient.delete<{ films: Film[] }>(`/film/${filmId}`);
      
      if (response.success) {
        setFilms(response.result.films);
        setSuccessMessage(`Фильм "${filmName}" успешно удален`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Не удалось удалить фильм');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Ошибка сети при удалении фильма');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Обработчик загрузки постера
  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFilm(prev => ({ ...prev, film_poster: file }));
    }
  };

  // Удаление сеанса
  const handleRemoveSeance = async (seanceId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот сеанс?')) {
      return;
    }

    try {
      const response = await apiClient.delete<{ seances: Seance[] }>(`/seance/${seanceId}`);
      
      if (response.success) {
        setSeances(response.result.seances);
        setSuccessMessage('Сеанс успешно удален');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.error || 'Не удалось удалить сеанс');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Ошибка сети при удалении сеанса');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Временные отметки (каждые 2 часа от 00:00 до 24:00)
  const TIME_MARKS = Array.from({ length: 13 }, (_, i) => {
    const hour = i * 2;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Ширина одного часа в пикселях
  const HOUR_WIDTH = 20;
  // Общая ширина временной шкалы (24 часа)
  const TIMELINE_WIDTH = 24 * HOUR_WIDTH;

  if (loading) return <div className="seance-grid-panel">Загрузка...</div>;

  return (
    <div className="seance-grid-panel panel">
      {error && <div className="panel__error">{error}</div>}
      {successMessage && <div className="panel__success">{successMessage}</div>}

      <div className="seance-grid-panel__controls">
        <button 
          onClick={() => setIsFilmModalOpen(true)} 
          className="seance-grid-panel__add-film-btn"
        >
          ДОБАВИТЬ ФИЛЬМ
        </button>
      </div>

      {/* Карточки фильмов */}
      <div className="seance-grid-panel__films-list">
        {films.map(film => (
          <div
            key={film.id}
            className="seance-grid-panel__film-card"
            draggable
            onDragStart={e => handleDragStart(e, film)}
          >
            <img src={film.film_poster} alt={film.film_name} className="seance-grid-panel__film-poster" />
            <div className="seance-grid-panel__film-info">
              <div className="seance-grid-panel__film-title">{film.film_name}</div>
              <div className="seance-grid-panel__film-duration">{film.film_duration} минут</div>
            </div>
            <button className="seance-grid-panel__film-delete-btn" 
            onClick={(e) => {
                e.stopPropagation();
                handleRemoveFilm(film.id, film.film_name);
              }}
              title="Удалить фильм">×</button>
          </div>
        ))}
      </div>

      {/* Сетка сеансов */}
      <div className="seance-grid-panel__grid-container">
        <div className="seance-grid-panel__grid">
          {/* Временная шкала */}
          <div className="seance-grid-panel__timeline-header">
            <div className="seance-grid-panel__hall-label-spacer"></div>
            <div 
              className="seance-grid-panel__timeline-scale"
              style={{ width: `${TIMELINE_WIDTH}px` }}
            >
              {TIME_MARKS.map(time => (
                <div key={time} className="seance-grid-panel__time-mark">
                  <div className="seance-grid-panel__time-marker"></div>
                  <span className="seance-grid-panel__time-label">{time}</span>
                </div>
              ))}
            </div>
          </div>

          {halls.map(hall => {
            const hallSeances = seances.filter(s => s.seance_hallid === hall.id);
            
            return (
              <div key={hall.id} className="seance-grid-panel__hall-section">
                <div className="seance-grid-panel__hall-header">
                  <h3 className="seance-grid-panel__hall-title">{hall.hall_name.toUpperCase()}</h3>
                </div>
                
                <div 
                  className="seance-grid-panel__hall-timeline"
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, hall.id, '12:00')}
                  style={{ width: `${TIMELINE_WIDTH}px` }}
                >
                  {/* Линия времени */}
                  <div className="seance-grid-panel__timeline-line"></div>
                  
                  {/* Временные отметки */}
                  <div className="seance-grid-panel__time-marks">
                    {TIME_MARKS.map(time => (
                      <div key={time} className="seance-grid-panel__time-indicator">
                        <div className="seance-grid-panel__time-dot"></div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Сеансы */}
                  {hallSeances.map(seance => {
                    const film = films.find(f => f.id === seance.seance_filmid);
                    if (!film) return null;
                    
                    const startMinutes = timeToMinutes(seance.seance_time);
                    const startPosition = (startMinutes / 60) * HOUR_WIDTH;
                    const width = Math.max((film.film_duration / 60) * HOUR_WIDTH, 40);
                    
                    return (
                      <div
                        key={seance.id}
                        className="seance-grid-panel__seance-container"
                        style={{
                          left: `${startPosition}px`,
                          width: `${width}px`
                        }}
                      >
                        <div className="seance-grid-panel__seance-block">
                          <span className="seance-grid-panel__seance-title">{film.film_name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveSeance(seance.id);
                            }}
                            className="seance-grid-panel__remove-btn"
                            title="Удалить сеанс"
                          >
                            ×
                          </button>
                        </div>
                        <div className="seance-grid-panel__seance-time">
                          {seance.seance_time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Модальное окно для добавления сеанса */}
      {isSeanceModalOpen && (
        <div className="seance-grid-panel__modal-overlay">
          <div className="seance-grid-panel__modal">
            <div className="seance-grid-panel__modal-header">
              <h3>ДОБАВЛЕНИЕ СЕАНСА</h3>
              <button
                className="seance-grid-panel__modal-close"
                onClick={() => setIsSeanceModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="seance-grid-panel__modal-body">
              <div className="seance-grid-panel__modal-field">
                <label>Название зала</label>
                <select
                  value={selectedHallId || ''}
                  onChange={e => setSelectedHallId(Number(e.target.value))}
                >
                  <option value="">Выберите зал</option>
                  {halls.map(hall => (
                    <option key={hall.id} value={hall.id}>
                      {hall.hall_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="seance-grid-panel__modal-field">
                <label>Название фильма</label>
                <select
                  value={draggedFilm?.id || ''}
                  onChange={e => {
                    const film = films.find(f => f.id === Number(e.target.value));
                    if (film) setDraggedFilm(film);
                  }}
                >
                  <option value="">Выберите фильм</option>
                  {films.map(film => (
                    <option key={film.id} value={film.id}>
                      {film.film_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="seance-grid-panel__modal-field">
                <label>Время начала</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  min="00:00"
                  max="23:59"
                  step="1800"
                />
              </div>
            </div>
            <div className="seance-grid-panel__modal-actions">
              <button
                className="seance-grid-panel__modal-btn-cancel"
                onClick={() => setIsSeanceModalOpen(false)}
              >
                ОТМЕНИТЬ
              </button>
              <button
                className="seance-grid-panel__modal-btn-save"
                onClick={handleAddSeance}
                disabled={!selectedHallId || !draggedFilm || !selectedTime}
              >
                ДОБАВИТЬ СЕАНС
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для добавления фильма */}
      {isFilmModalOpen && (
        <div className="seance-grid-panel__modal-overlay">
          <div className="seance-grid-panel__modal seance-grid-panel__modal--film">
            <div className="seance-grid-panel__modal-header">
              <h3>ДОБАВЛЕНИЕ ФИЛЬМА</h3>
              <button
                className="seance-grid-panel__modal-close"
                onClick={() => setIsFilmModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="seance-grid-panel__modal-body">
              <div className="seance-grid-panel__modal-field">
                <label>Название фильма</label>
                <input
                  type="text"
                  placeholder='Например, «Гражданин Кейн»'
                  value={newFilm.film_name}
                  onChange={e => setNewFilm(prev => ({ ...prev, film_name: e.target.value }))}
                />
              </div>
              <div className="seance-grid-panel__modal-field">
                <label>Продолжительность фильма (мин.)</label>
                <input
                  type="number"
                  placeholder="120"
                  value={newFilm.film_duration}
                  onChange={e => setNewFilm(prev => ({ ...prev, film_duration: e.target.value }))}
                  min="1"
                />
              </div>
              <div className="seance-grid-panel__modal-field">
                <label>Описание фильма</label>
                <textarea
                  placeholder="Описание фильма"
                  value={newFilm.film_description}
                  onChange={e => setNewFilm(prev => ({ ...prev, film_description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="seance-grid-panel__modal-field">
                <label>Страна</label>
                <input
                  type="text"
                  placeholder="Страна производства"
                  value={newFilm.film_country}
                  onChange={e => setNewFilm(prev => ({ ...prev, film_country: e.target.value }))}
                />
              </div>
              <div className="seance-grid-panel__modal-field">
                <label>Постер фильма</label>
                <div className="seance-grid-panel__file-upload">
                  <input
                    type="file"
                    id="poster-upload"
                    accept="image/*"
                    onChange={handlePosterUpload}
                    className="seance-grid-panel__file-input"
                  />
                  <label htmlFor="poster-upload" className="seance-grid-panel__file-label">
                    ЗАГРУЗИТЬ ПОСТЕР
                  </label>
                  {newFilm.film_poster && (
                    <span className="seance-grid-panel__file-name">
                      {newFilm.film_poster.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="seance-grid-panel__modal-actions">
              <button
                className="seance-grid-panel__modal-btn-cancel"
                onClick={() => setIsFilmModalOpen(false)}
              >
                ОТМЕНИТЬ
              </button>
              <button
                className="seance-grid-panel__modal-btn-save"
                onClick={handleAddFilm}
                disabled={!newFilm.film_name || !newFilm.film_duration}
              >
                ДОБАВИТЬ ФИЛЬМ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeanceGridPanel;