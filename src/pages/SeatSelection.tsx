import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import HallMap from '../components/ui/HallMap';
import { QRCodeSVG } from 'qrcode.react';
import './SeatSelection.css';

interface Ticket {
  row: number;
  seat: number;
  price: number;
}

const SeatSelection: React.FC = () => {
  const { seanceId } = useParams<{ seanceId: string }>();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [hallConfig, setHallConfig] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSeats, setSelectedSeats] = useState<Ticket[]>([]);
  const [movieTitle, setMovieTitle] = useState('');
  const [hallName, setHallName] = useState('');
  const [seanceTime, setSeanceTime] = useState('');
  const [priceStandart, setPriceStandart] = useState<number>(250);
  const [priceVip, setPriceVip] = useState<number>(350);

  // Состояние для подтверждения
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  //const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  // Загрузка данных о сеансе, фильме и зале
  useEffect(() => {
    const fetchSeanceDetails = async () => {
      try {
        const response = await apiClient.get<{
          films: any[];
          halls: any[];
          seances: any[];
        }>('/alldata');
        if (response.success) {
          const { films, halls, seances } = response.result;
          const seance = seances.find((s: any) => s.id === Number(seanceId));

          if (seance) {
            const film = films.find((f: any) => f.id === seance.seance_filmid);
            const hall = halls.find((h: any) => h.id === seance.seance_hallid);

            setMovieTitle(film?.film_name || 'Неизвестный фильм');
            setHallName(hall?.hall_name || 'Неизвестный зал');
            setSeanceTime(seance.seance_time);
            setPriceStandart(hall?.hall_price_standart || 250);
            setPriceVip(hall?.hall_price_vip || 350);
          } else {
            setBookingError('Сеанс не найден');
          }
        } else {
          setBookingError('Ошибка загрузки данных о сеансе');
        }
      } catch (err) {
        setBookingError('Ошибка сети при загрузке данных');
      }
    };

    const fetchHallConfig = async () => {
      try {
        const response = await apiClient.get<string[][]>(
          `/hallconfig?seanceId=${seanceId}&date=${date}`
        );
        if (response.success) {
          setHallConfig(response.result);
        } else {
          setBookingError('Ошибка загрузки схемы зала: ' + response.error);
        }
      } catch (error) {
        setBookingError('Ошибка сети при загрузке схемы зала');
      } finally {
        setLoading(false);
      }
    };

    if (seanceId) {
      fetchSeanceDetails();
      fetchHallConfig();
    }
  }, [seanceId, date]);

  // Обработка выбора места
  const handleSeatSelect = (row: number, seat: number) => {
    const seatKey = `${row}-${seat}`;
    const isAlreadySelected = selectedSeats.some(s => `${s.row}-${s.seat}` === seatKey);

    if (isAlreadySelected) {
      setSelectedSeats(prev => prev.filter(s => `${s.row}-${s.seat}` !== seatKey));
    } else {
      const seatType = hallConfig?.[row]?.[seat];
      const price = seatType === 'vip' ? priceVip : priceStandart;

      setSelectedSeats(prev => [...prev, { row, seat, price }]);
    }
  };

  // Обработка бронирования
  const handleBookTickets = async () => {
    if (selectedSeats.length === 0) return;

    const formData = new FormData();
    formData.append('seanceId', seanceId || '');
    formData.append('ticketDate', date);
    formData.append('tickets', JSON.stringify(
      selectedSeats.map(s => ({ row: s.row, place: s.seat, coast: s.price }))
    ));

    try {
      const response = await apiClient.post<any[]>('/ticket', formData);
      console.log(response);
      if (response.success && response.result.length > 0) {
        const firstTicket = response.result[0];
        //setBookingCode(firstTicket.id.toString());
        setIsBookingConfirmed(true);
        setBookingError(null);

        // Генерация QR-кода
        const qrData = [
          `Дата и время: ${firstTicket.ticket_date} ${firstTicket.ticket_time}`,
          `Фильм: ${firstTicket.ticket_filmname}`,
          `Зал: ${firstTicket.ticket_hallname}`,
          `Ряд/Место: ${selectedSeats.map(s => `Ряд ${s.row + 1}, место ${s.seat + 1}`).join('; ')}`,
          `Стоимость: ${totalCost} ₽`,
          'Билет действителен строго на свой сеанс',
        ].join('\n');

        setQrCodeData(qrData);
      } else {
        setBookingError(response.error || 'Не удалось забронировать билеты');
      }
    } catch (error) {
      setBookingError('Ошибка сети: не удалось отправить запрос');
    }
  };

  const totalCost = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  if (loading) {
    return <div className="seat-selection">Загрузка данных...</div>;
  }

  if (!hallConfig || bookingError) {
    return (
      <div className="seat-selection">
        <p className="error-message">{bookingError || 'Не удалось загрузить схему зала.'}</p>
      </div>
    );
  }

  return (
    <div className="seat-selection">
      {!isBookingConfirmed ? (
        <>
          <div className="seat-selection__header">
            <h2>{movieTitle}</h2>
            <div className="seat-selection__info">
              <p><strong>Начало сеанса:</strong> {seanceTime}</p>
              <p><strong>Зал:</strong> {hallName}</p>
            </div>
          </div>
          <div className="seat-selection__hall-map">
               <HallMap price={{"vip": priceVip, "standart":priceStandart}} hallConfig={hallConfig} onSeatSelect={handleSeatSelect} />
          </div>
          <div className="seat-selection__summary">
            <p><strong>Выбрано мест:</strong> {selectedSeats.length}</p>
            <p><strong>Стоимость:</strong> {totalCost} ₽</p>
          </div>

          <button
            className="seat-selection__confirm"
            disabled={selectedSeats.length === 0}
            onClick={handleBookTickets}
          >
            Забронировать выбранные места
          </button>
        </>
      ) : (
        <div className="seat-selection__confirmation">
          <h2>ВЫ ВЫБРАЛИ БИЛЕТЫ:</h2>
          <hr />
          <p><strong>На фильм:</strong> {movieTitle}</p>
          <p><strong>Места:</strong> {selectedSeats.map(s => `Ряд ${s.row + 1}, место ${s.seat + 1}`).join(', ')}</p>
          <p><strong>В зале:</strong> {hallName}</p>
          <p><strong>Начало сеанса:</strong> {seanceTime}</p>
          <p><strong>Стоимость:</strong> {totalCost} ₽</p>
          {showQrCode ? (
            <div className="seat-selection__qr-code">
              <QRCodeSVG value={qrCodeData || ''} size={150} level="H" />
            </div>
          ) : (
            <button
              className="seat-selection__confirm"
              onClick={() => setShowQrCode(true)}
            >
              Получить код бронирования
            </button>
          )}
          <p>
            После оплаты билет будет доступен в этом окне и придёт на почту.
            Покажите QR-код контролёру у входа в зал.
          </p>
          <p>Приятного просмотра!</p>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;