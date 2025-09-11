import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import './HallConfigPanel.css';

// Типы
interface Hall {
  id: number;
  hall_name: string;
  hall_rows?: number;
  hall_places?: number;
  hall_config?: {};
}

type SeatType = 'standart' | 'vip' | 'disabled';

const HallConfigPanel: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
  const [rows, setRows] = useState<number>(0);
  const [places, setPlaces] = useState<number>(0);
  const [config, setConfig] = useState<SeatType[][]>([]);

  const seatTypes: SeatType[] = ['standart', 'vip', 'disabled'];

  // Загрузка списка залов
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await apiClient.get<{ halls: Hall[] }>('/alldata');
        if (response.success) {
          setHalls(response.result.halls);
        }
      } catch (err) {
        console.error('Ошибка загрузки залов:', err);
      }
    };
    fetchHalls();
  }, []);

  // При выборе зала — загружаем его текущие настройки
  useEffect(() => {
    if (!selectedHallId) return;

    const hall = halls.find(h => h.id === selectedHallId);
    if (hall) {
      const currentRows = hall.hall_rows || 1;
      const currentPlaces = hall.hall_places || 1;

      setRows(currentRows);
      setPlaces(currentPlaces);

      // Если есть hall_config — используем его, иначе создаём пустую схему
      const savedConfig = hall.hall_config as SeatType[][] | undefined;
      if (savedConfig && savedConfig.length > 0) {
        setConfig(savedConfig);
      } else {
        setConfig(
          Array(currentRows)
            .fill(null)
            .map(() => Array(currentPlaces).fill('standart'))
        );
      }
    }
  }, [selectedHallId, halls]);

  // Изменение типа места по клику
  const toggleSeatType = (rowIndex: number, seatIndex: number) => {
    setConfig(prev => {
      const newConfig = [...prev];
      const currentType = newConfig[rowIndex][seatIndex];
      const nextType = seatTypes[(seatTypes.indexOf(currentType) + 1) % seatTypes.length];
      newConfig[rowIndex][seatIndex] = nextType;
      return newConfig;
    });
  };

  // Применение новых размеров сетки
  const applyDimensions = () => {
    if (rows <= 0 || places <= 0) return;

    setConfig(prev => {
      const newConfig = Array(rows)
        .fill(null)
        .map((_, rowIndex) =>
          Array(places)
            .fill(null)
            .map((_, seatIndex) => {
              return prev[rowIndex] && prev[rowIndex][seatIndex]
                ? prev[rowIndex][seatIndex]
                : 'standart';
            })
        );
      return newConfig;
    });
  };
  
  useEffect(() => {
    applyDimensions();
  }, [rows, places]);
  // Отмена изменений
  const handleCancel = () => {
    const hall = halls.find(h => h.id === selectedHallId);
    if (hall) {
      setRows(hall.hall_rows || 1);
      setPlaces(hall.hall_places || 1);
      setConfig(hall.hall_config as SeatType[][] || []);
    }
  };

  // Сохранение конфигурации
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHallId || rows <= 0 || places <= 0) return;

    const formData = new FormData();
    formData.append('rowCount', rows.toString());
    formData.append('placeCount', places.toString());
    formData.append('config', JSON.stringify(config));

    try {
      const response = await apiClient.post<{ halls: Hall[] }>(
        `/hall/${selectedHallId}`,
        formData
      );

      if (response.success) {
        const alldata = await apiClient.get<{ halls: Hall[] }>('/alldata');
        if (alldata.success) {
          setHalls(alldata.result.halls);
          alert('Конфигурация зала сохранена!');
        }
      } else {
        alert('Ошибка: ' + (response.error || 'Неизвестная ошибка'));
      }
    } catch (err) {
      alert('Ошибка сети при сохранении конфигурации');
    }
  };

  return (
    <div className="hall-config-panel panel">
      <div className="hall-config-panel__controls">
        <h6>Выберите зал для конфигурации:</h6>

        {/* Список кнопок-залов */}
        <div className="hall-config-panel__hall-buttons">
          {halls.length === 0 ? (
            <span>Нет доступных залов</span>
          ) : (
            halls.map(hall => (
              <button
                key={hall.id}
                className={`hall-config-panel__hall-btn ${
                  selectedHallId === hall.id ? 'hall-config-panel__hall-btn--active' : ''
                }`}
                onClick={() => setSelectedHallId(hall.id)}
              >
                {hall.hall_name}
              </button>
            ))
          )}
        </div>

        <h6>Укажите количество рядов и максимальное количество кресел в ряду:</h6>
        <div className="hall-config-panel__dimensions">
          <div className="hall-config-panel__field">
            <label htmlFor="hall-rows">Рядов, шт</label>
            <input
              id="hall-rows"
              type="number"
              value={rows || ''}
              onChange={e => setRows(Number(e.target.value) || 10)}
              min="1"
              max="20"
            />
          </div>
          <span >X</span>
          <div className="hall-config-panel__field">
            <label htmlFor="hall-places">Мест в ряду, шт</label>
            <input
              id="hall-places"
              type="number"
              value={places || ''}
              onChange={e => setPlaces(Number(e.target.value) || 0)}
              min="1"
              max="30"
            />
          </div>
          {/* <button onClick={applyDimensions} className="hall-config-panel__apply-btn">
            Применить
          </button> */}
        </div>
      </div>
      {/* Легенда */}
      <div className='hall-config-panel__legend__title'>
        <h6>Теперь вы можете указать типы кресел на схеме зала:</h6>
      </div>
      <div className="hall-config-panel__legend">
        
        <div className="hall-config-panel__legend-item">
          <span className="hall-config-panel__legend-color hall-config-panel__legend-color--standart"></span>
          <span> - Обычные кресла</span>
        </div>
        <div className="hall-config-panel__legend-item">
          <span className="hall-config-panel__legend-color hall-config-panel__legend-color--vip"></span>
          <span> - VIP кресла</span>
        </div>
        <div className="hall-config-panel__legend-item">
          <span className="hall-config-panel__legend-color hall-config-panel__legend-color--disabled"></span>
          <span> - заблокированные (Нет кресла)</span>
        </div>
      </div>

      {/* Схема зала */}
      {selectedHallId && config.length > 0 && (
        <div className="hall-config-panel__legend__hall">
          <h6>ЭКРАН</h6>
          <div className="hall-config-panel__grid">
            {config.map((row, rowIndex) => (
              <div key={rowIndex} className="hall-config-panel__row">
                {row.map((seatType, seatIndex) => (
                  <button
                    key={seatIndex}
                    className={`hall-config-panel__seat hall-config-panel__seat--${seatType}`}
                    onClick={() => toggleSeatType(rowIndex, seatIndex)}
                  >
                    {seatType === 'vip' ? 'VIP' : ''}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Кнопки Отмена / Сохранить */}
      <div className="hall-config-panel__actions">
        <button
          className="hall-config-panel__btn hall-config-panel__btn--cancel"
          onClick={handleCancel}
        >
          Отмена
        </button>
        <button
          className="hall-config-panel__btn hall-config-panel__btn--save"
          onClick={handleSave}
          disabled={!selectedHallId}
        >
          Сохранить
        </button>
      </div>

      
    </div>
  );
};

export default HallConfigPanel;