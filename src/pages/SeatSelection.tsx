import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import HallMap from '../components/ui/HallMap';
import './SeatSelection.css';


import { QRCodeSVG } from 'qrcode.react';

interface Ticket {
  row: number;
  seat: number;
  price: number;
}



const SeatSelection: React.FC = () => {
  const { seanceId} = useParams<{ seanceId: string }>();
  const [searchParams] = useSearchParams();
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const [hallConfig, setHallConfig] = useState<string[][] | null>(null);
  const [loading, setLoading] = useState(true);
  


  const [selectedSeats, setSelectedSeats] = useState<Ticket[]>([]);
  const [movieTitle, setMovieTitle] = useState('');
  const [hallName, setHallName] = useState('');
  const [seanceTime, setSeanceTime] = useState('');

  // Состояние для подтверждения
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

// Добавляем состояние для QR-кода
  const [qrCodeData, setQrCodeData] = useState<string | null>(null); // Данные для QR-кода
  const [showQrCode, setShowQrCode] = useState(false); // Флаг показа QR-кода

  useEffect(() => {
    const fetchHallConfig = async () => {
      try {
          const response = await apiClient.get<string[][]>(
            `/hallconfig?seanceId=${seanceId}&date=${date}`
          );

          if (response.success) {
            setHallConfig(response.result);
          } else {
            console.error('Ошибка загрузки схемы зала:', response.error);
          }
        } catch (error) {
          console.error('Ошибка сети:', error);
        } finally {
          setLoading(false);
        }
      };

    if (seanceId) {
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
      const price = hallConfig?.[row]?.[seat] === 'vip'
        ? 350
        : 250;

      setSelectedSeats(prev => [...prev, { row, seat, price }]);
    }
  };

  // Обработка бронирования
  const handleBookTickets = async () => {
    if (selectedSeats.length === 0) return;

    try {
      const formData = new FormData();
      formData.append('seanceId', seanceId || '');
      formData.append('ticketDate', date);
      formData.append('tickets', JSON.stringify(
        selectedSeats.map(s => ({ row: s.row, place: s.seat, coast: s.price }))
      ));

      const response = await apiClient.post<any[]>(
        '/ticket',
        formData
      );
      console.log("response", response);
      if (response.success && response.result.length > 0) {
        const firstTicket = response.result[0];
        console.log("firstTicket, response.result", firstTicket);
        setBookingCode(firstTicket.id.toString());
        setIsBookingConfirmed(true);
        setBookingError(null);

        setMovieTitle(firstTicket.ticket_filmname || 'Неизвестный фильм');
        setHallName(firstTicket.ticket_hallname || 'Неизвестный зал');
        setSeanceTime(firstTicket.ticket_date+' '+firstTicket.ticket_time);


        // Генерируем данные для QR-кода
        console.log("QR", seanceTime, movieTitle, hallName, selectedSeats);
        
        const qrData = [
          `Дата Время: ${firstTicket.ticket_date+' '+firstTicket.ticket_time}`,
          `Название фильма: 11 ${firstTicket.ticket_filmname }`,
          `Зал: ${firstTicket.ticket_hallname}`,
          ...selectedSeats.map((s, index) => `Место ${index + 1}: Ряд ${s.row + 1}, Место ${s.seat + 1}`),
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

  if (loading) {
    return <div className="seat-selection">Загрузка схемы зала...</div>;
  }

  if (!hallConfig) {
    return <div className="seat-selection">Не удалось загрузить схему зала.</div>;
  }

  const totalCost = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
     <div className="seat-selection">
      <h2>Выберите место</h2>
      <p>Сеанс ID: {seanceId}, Дата: {date}</p>

      {!isBookingConfirmed ? (
        <>
          <HallMap hallConfig={hallConfig} onSeatSelect={handleSeatSelect} />

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

          {bookingError && (
            <div className="seat-selection__error">
              {bookingError}
            </div>
          )}
        </>
      ) : (

        <div className="seat-selection__confirmation">
          <h2>ВЫ ВЫБРАЛИ БИЛЕТЫ:</h2>
          <hr />
          <p><strong>На фильм:</strong> {movieTitle}</p>
          <p>
            <strong>Места:</strong>{' '}
            {selectedSeats.map(s => `Ряд ${s.row + 1}, место ${s.seat + 1}`).join(', ')}
          </p>
          <p><strong>В зале:</strong> {hallName}</p>
          <p><strong>Начало сеанса:</strong> {seanceTime}</p>
          <p><strong>Стоимость:</strong> {totalCost} рублей</p>

          <p><strong>Код бронирования:</strong> <code>{bookingCode}</code></p>
          <p>Нажминте на кнопку чтобы сгенерировать QR-код. </p>
          
          {showQrCode && (
            <div className="seat-selection__qr-code">
              <QRCodeSVG value={qrCodeData || ''} size={200} level="H" />
            </div>
          )}

          
          {!showQrCode && (
            <button
              className="seat-selection__confirm"
              onClick={() => setShowQrCode(true)}
            >
              Получить код бронирования
            </button>
          )}
          <p>
            После оплаты билет будет доступен в этом окне, а также придёт вам на почту.
            Покажите QR-код нашему контролёру у входа в зал.
          </p>
          <p>Приятного просмотра!</p>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;