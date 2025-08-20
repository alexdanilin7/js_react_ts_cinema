import React from 'react';
import './MovieCard.css';
import HallSessionList from './HallSessionList';
import type { Movie } from '../../types/Movie';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
  keyIndex: number;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, keyIndex }) => {
   const navigate = useNavigate();
   const handleSessionClick = (seanceId: number, selectedDate:string) => {
    navigate(`/session/${seanceId}?date=${selectedDate}`);
  };
  return (
    <div className="movie-card" key={keyIndex}>
      <div className="movie-content">
           <img src={movie.posterUrl || '/default-poster.jpg'} alt={movie.title} className="movie-poster" />
           <div className="movie-info">
            <h3 className="movie-title">{movie.title}</h3>
            <p>{movie.description}</p>
            <p>{movie.duration} мин</p>
            <p>{movie.genre}, {movie.releaseYear}</p>
          </div>
      </div>
   
      <div className="hall-sessions">
          {movie.sessions.time.length > 0 ? (
            <HallSessionList sessionsByHall={movie.sessions} onSelectSession={handleSessionClick}/>
          ) : (
            <p>Нет сеансов</p>
          )}
      </div>
      
    </div>
  );
};

export default MovieCard;