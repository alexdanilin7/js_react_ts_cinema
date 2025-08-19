
import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import './HallListPanel.css';
import Modal from '../ui/modals/Modal';
interface Hall {
  id: number;
  hall_name: string;
}

const HallsListPanel: React.FC = () => {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [newHallName, setNewHallName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Загрузка списка залов
  useEffect(() => {
    const fetchHalls = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<{ halls: Hall[] }>('/alldata');
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
// Открытие модального окна
  const handleOpenModal = () => {
    setNewHallName('');
    setIsModalOpen(true);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewHallName('');
  };
  // Создание нового зала
  const handleCreateHall = async () => {
    if (!newHallName.trim()) return;

    const formData = new FormData();
    formData.append('hallName', newHallName);

    try {
      const response = await apiClient.post<{ halls: Hall[] }>('/hall', formData);
      if (response.success) {
        setHalls(response.result.halls);
        setNewHallName('');
        setIsModalOpen(false);
      } else {
        setError(response.error || 'Не удалось создать зал');
      }
    } catch (err) {
      setError('Ошибка сети при создании зала');
    }
  };

  // Удаление зала
  const handleDeleteHall = async (hallId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот зал? Все сеансы будут удалены.')) {
    return;
  }
    try {
      const response = await apiClient.delete<{ halls: Hall[]; seances: any[] }>(
        `/hall/${hallId}`
      );

      if (response.success) {
        setHalls(response.result.halls);
      } else {
        setError(response.error || 'Не удалось удалить зал');
      }
    } catch (err) {
      setError('Ошибка сети при удалении зала');
    }
  };

  return (
    <div className="halls-list-panel panel">
      <h3>Доступные залы:</h3>
      {error && <div className="panel__error">{error}</div>}
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <>
          <ul className="halls-list">
            {halls.length > 0 ? (
              halls.map(hall => (
                <li key={hall.id} className="halls-list__item">
                  <span>{hall.hall_name}</span>
                  <button
                    className="halls-list__delete-btn"
                    onClick={() => handleDeleteHall(hall.id)}
                  >
                    🗑️
                  </button>
                </li>
              ))
            ) : (
              <li>Нет созданных залов</li>
            )}
          </ul>

          <button
            className="halls-list__create-btn"
            onClick={handleOpenModal}
          >
            СОЗДАТЬ ЗАЛ
          </button>

          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title="Добавление зала"
          >
            <div>
              <label>
                Название зала
                <input
                  type="text"
                  value={newHallName}
                  onChange={e => setNewHallName(e.target.value)}
                  placeholder="Например: Зал IMAX"
                  className="modal-input"
                  autoFocus
                />
              </label>
              <div className="modal-actions">
                <button
                  className="modal-btn modal-btn-cancel"
                  onClick={handleCloseModal}
                >
                  Отмена
                </button>
                <button
                  className="modal-btn modal-btn-create"
                  onClick={handleCreateHall}
                >
                  Создать
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default HallsListPanel;

