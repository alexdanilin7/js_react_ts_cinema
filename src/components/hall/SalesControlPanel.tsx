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
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
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
  const newStatus = isOpen ? 0 : 1;
  
  const formData = new FormData();
  formData.append('hallOpen', newStatus.toString());

  try {
    const response = await apiClient.post<{halls:[]}>(
      `/open/${selectedHallId}`,
      formData
    );
    console.log("response", response.result.halls);
    if (response.success) {
      // Обновляем состояние залов
      //setHalls(prev => prev.map(h => Number(h.id) === Number(selectedHallId) ? response.result : h));
      setHalls(response.result.halls);
      console.log("hall", halls)
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
      {error && <div className="panel__error">{error}</div>}

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <>
          <div className="sales-control-panel__controls">
            <h6>Выберите зал для управления продажами:</h6>
            <div className="sales-control-panel__hall-buttons">
              {halls.length === 0 ? (
                <span>Нет доступных залов</span>
              ) : (
                halls.map(hall => (
                  <button
                    key={hall.id}
                    className={`sales-control-panel__hall-btn ${
                      Number(selectedHallId) === hall.id ? 'sales-control-panel__hall-btn--active' : ''
                    }`}
                    onClick={() => setSelectedHallId(hall.id)}
                  >
                    {hall.hall_name}
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedHall && (
            <div className="sales-control-panel__status">
              <p>
                <strong>Текущий статус:</strong>{' '}
                <span
                  className={`sales-control-panel__status-text ${
                    selectedHall.hall_open
                      ? 'sales-control-panel__status-text--open'
                      : 'sales-control-panel__status-text--closed'
                  }`}
                >
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
              <li><strong>Открытые залы:</strong> {halls.filter(h => h.hall_open === 1).length}</li>
              <li><strong>Закрытые залы:</strong> {halls.filter(h => h.hall_open === 0).length}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesControlPanel;