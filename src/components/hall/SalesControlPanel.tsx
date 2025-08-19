import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import './SalesControlPanel.css';

// Типы
interface Hall {
  id: number;
  hall_name: string;
  hall_open: 0 | 1;
}

interface ApiAllData {
  halls: Hall[];
  films: any[];
  seances: any[];
}

const SalesControlPanel: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<number | ''>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка залов
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<ApiAllData>('/alldata');
        if (response.success) {
          setHalls(response.result.halls);
        } else {
          setError(response.error || 'Не удалось загрузить залы');
        }
      } catch (err) {
        setError('Ошибка сети при загрузке залов');
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  // Получаем выбранный зал
  const selectedHall = halls.find(h => h.id === selectedHallId);

  // Открытие или закрытие продаж
  const toggleSalesStatus = async () => {
    if (!selectedHallId) return;

    const isOpen = selectedHall?.hall_open === 1;
    const newStatus = isOpen ? 0 : 1; // инвертируем

    const formData = new FormData();
    formData.append('hallOpen', newStatus.toString());

    try {
      const response = await apiClient.post<Hall>(
        `/open/${selectedHallId}`,
        formData
      );

      if (response.success) {
        // Обновляем состояние
        setHalls(prev => prev.map(h => h.id === selectedHallId ? response.result : h));
        setError(null);
      } else {
        setError(response.error || 'Не удалось изменить статус продаж');
      }
    } catch (err) {
      setError('Ошибка сети при изменении статуса продаж');
    }
  };

  return (
    <div className="sales-control-panel panel">
      <h2>Открыть продажи</h2>
      {error && <div className="panel__error">{error}</div>}

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <>
          <div className="sales-control-panel__controls">
            <select
              value={selectedHallId}
              onChange={e => setSelectedHallId(Number(e.target.value) || '')}
              className="sales-control-panel__select"
            >
              <option value="">Выберите зал</option>
              {halls.map(hall => (
                <option key={hall.id} value={hall.id}>
                  {hall.hall_name}
                </option>
              ))}
            </select>
          </div>

          {selectedHall && (
            <div className="sales-control-panel__status">
              <p>
                <strong>Текущий статус:</strong>{' '}
                <span className={`sales-control-panel__status-text ${
                  selectedHall.hall_open ? 'sales-control-panel__status-text--open' : 'sales-control-panel__status-text--closed'
                }`}>
                  {selectedHall.hall_open ? 'Продажи открыты' : 'Продажи закрыты'}
                </span>
              </p>

              <button
                className={`sales-control-panel__btn ${
                  selectedHall.hall_open
                    ? 'sales-control-panel__btn--close'
                    : 'sales-control-panel__btn--open'
                }`}
                onClick={toggleSalesStatus}
              >
                {selectedHall.hall_open ? 'Закрыть продажи' : 'Открыть продажи'}
              </button>
            </div>
          )}

          <div className="sales-control-panel__info">
            <p>Управление продажами:</p>
            <ul>
              <li><strong>Открытые залы:</strong> {halls.filter(h => h.hall_open).length}</li>
              <li><strong>Закрытые залы:</strong> {halls.filter(h => !h.hall_open).length}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesControlPanel;