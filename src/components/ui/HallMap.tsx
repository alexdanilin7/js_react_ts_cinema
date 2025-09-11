import React, { useState } from 'react';
import './HallMap.css';

interface HallMapProps {
  price:{vip: number; standart: number};
  hallConfig: string[][]; // Конфигурация зала
  onSeatSelect: (row: number, seat: number) => void;
}

const HallMap: React.FC<HallMapProps> = ({ price, hallConfig, onSeatSelect }) => {
  const [selectedSeats, setSelectedSeats] = useState<{ row: number; seat: number }[]>([]);

  const handleSeatClick = (row: number, seat: number) => {
    const seatKey = `${row}-${seat}`;
    const isAlreadySelected = selectedSeats.some(s => `${s.row}-${s.seat}` === seatKey);

    if (isAlreadySelected) {
      // Если место уже выбрано, убираем его из списка
      setSelectedSeats(prev => prev.filter(s => `${s.row}-${s.seat}` !== seatKey));
    } else {
      // Добавляем выбранное место
      setSelectedSeats(prev => [...prev, { row, seat }]);
    }

    // Обновляем состояние через props
    onSeatSelect(row, seat);
  };

  return (
    <div className="hall-map">
      <div className="hall-map__grid">
        <img src='./assets/img/screen.png' className='hall-map__title' alt="Зал"/>
        {hallConfig.map((row, rowIndex) => (
          <div key={rowIndex} className="hall-map__row">
            {row.map((seatType, seatIndex) => (
              <button
                key={seatIndex}
                onClick={() => handleSeatClick(rowIndex, seatIndex)}
                className={`hall-map__seat hall-map__seat--${seatType} ${
                  selectedSeats.some(
                    s => s.row === rowIndex && s.seat === seatIndex
                  )
                    ? 'hall-map__seat--selected'
                    : ''
                }`}
              >
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="hall-map__legend">
        <div className="hall-map__legend-item">
          <span className="hall-map__legend-seat hall-map__legend-seat--standart"></span>
          <span>Свободно ({price.standart} руб)</span>
        </div>
        <div className="hall-map__legend-item">
          <span className="hall-map__legend-seat hall-map__legend-seat--taken"></span>
          <span>Занято</span>
        </div>
        <div className="hall-map__legend-item">
          <span className="hall-map__legend-seat hall-map__legend-seat--vip"></span>
          <span>Свободно VIP ({price.vip} руб)</span>
        </div>
        <div className="hall-map__legend-item">
          <span className="hall-map__legend-seat hall-map__legend-seat--selected"></span>
          <span>Выбрано</span>
        </div>
      </div>
    </div>
  );
};

export default HallMap;