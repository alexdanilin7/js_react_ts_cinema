import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import './PriceConfigPanel.css';

// Типы
interface Hall {
  id: number;
  hall_name: string;
  hall_price_standart: number;
  hall_price_vip: number;
}

interface ApiAllData {
  halls: Hall[];
  films: any[];
  seances: any[];
}

const PriceConfigPanel: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [selectedHallId, setSelectedHallId] = useState<number | null>(null);
  const [priceStandard, setPriceStandard] = useState<number>(0);
  const [priceVip, setPriceVip] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка залов с ценами
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

  // При выборе зала — подставляем текущие цены
  useEffect(() => {
    if (!selectedHallId) {
      setPriceStandard(0);
      setPriceVip(0);
      return;
    }

    const hall = halls.find(h => h.id === selectedHallId);
    if (hall) {
      setPriceStandard(hall.hall_price_standart);
      setPriceVip(hall.hall_price_vip);
    }
  }, [selectedHallId, halls]);

  // Сохранение цен
  const handleSave = async () => {
    if (!selectedHallId || priceStandard <= 0 || priceVip <= 0) {
      setError('Цены должны быть больше 0');
      return;
    }

    const formData = new FormData();
    formData.append('priceStandart', priceStandard.toString());
    formData.append('priceVip', priceVip.toString());

    try {
      const response = await apiClient.post<Hall>(
        `/price/${selectedHallId}`,
        formData
      );

      if (response.success) {
        // Обновляем список залов
        setHalls(prev => prev.map(h => (h.id === selectedHallId ? response.result : h)));
        setError(null);
        alert('Цены успешно обновлены!');
      } else {
        setError(response.error || 'Не удалось сохранить цены');
      }
    } catch (err) {
      setError('Ошибка сети при сохранении цен');
    }
  };

  // Отмена — сбросить цены до текущих
  const handleCancel = () => {
    const hall = halls.find(h => h.id === selectedHallId);
    if (hall) {
      setPriceStandard(hall.hall_price_standart);
      setPriceVip(hall.hall_price_vip);
    }
  };

  return (
    <div className="price-config-panel panel">
      <h2>Конфигурация цен</h2>
      {error && <div className="panel__error">{error}</div>}

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <>
          <div className="price-config-panel__controls">
            <h6>Выберите зал для настройки цен:</h6>
            <div className="price-config-panel__hall-buttons">
              {halls.length === 0 ? (
                <span>Нет доступных залов</span>
              ) : (
                halls.map(hall => (
                  <button
                    key={hall.id}
                    className={`price-config-panel__hall-btn ${
                      selectedHallId === hall.id ? 'price-config-panel__hall-btn--active' : ''
                    }`}
                    onClick={() => setSelectedHallId(hall.id)}
                  >
                    {hall.hall_name}
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedHallId && (
            <div className="price-config-panel__inputs">
              <div className="price-config-panel__input-group">
                <label>Обычное место</label>
                <input
                  type="number"
                  placeholder="Цена"
                  value={priceStandard || ''}
                  onChange={e => setPriceStandard(Number(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div className="price-config-panel__input-group">
                <label>VIP место</label>
                <input
                  type="number"
                  placeholder="Цена"
                  value={priceVip || ''}
                  onChange={e => setPriceVip(Number(e.target.value) || 0)}
                  min="1"
                />
              </div>
            </div>
          )}

          <div className="price-config-panel__actions">
            <button
              className="price-config-panel__btn price-config-panel__btn--cancel"
              onClick={handleCancel}
            >
              Отмена
            </button>
            <button
              className="price-config-panel__btn price-config-panel__btn--save"
              onClick={handleSave}
              disabled={!selectedHallId || priceStandard <= 0 || priceVip <= 0}
            >
              Сохранить
            </button>
          </div>

          <div className="price-config-panel__info">
            <p>Текущие цены:</p>
            {halls
              .filter(h => h.id === selectedHallId)
              .map(h => (
                <ul key={h.id}>
                  <li>Обычное: <strong>{h.hall_price_standart} ₽</strong></li>
                  <li>VIP: <strong>{h.hall_price_vip} ₽</strong></li>
                </ul>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PriceConfigPanel;