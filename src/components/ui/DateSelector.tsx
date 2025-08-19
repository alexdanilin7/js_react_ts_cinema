import React, { useState } from 'react';
import './DateSelector.css';
import capitalizeFirstLetter from '../../services/utils';
interface DateSelectorProps {
  onChange: (date: string) => void;
}
// const capitalizeFirstLetter = (string: string): string => {
//   return string.charAt(0).toUpperCase() + string.slice(1);
// };

const DateSelector: React.FC<DateSelectorProps> = ({ onChange }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);


  const generateWeekDates = (): { date: string; label: React.ReactNode }[] => {
    const dates: { date: string; label: React.ReactNode }[] = [];
    const baseDate = new Date(currentDate);

    for (let i = 0; i < 6; i++) {
      const currentDateObj = new Date(baseDate);
      currentDateObj.setDate(baseDate.getDate() + i);

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
      };

      const formatted = currentDateObj.toLocaleDateString('ru-RU', options);
      const [_weekday, day] = formatted.split(' ');
      const weekday = capitalizeFirstLetter(_weekday);
      const dateString = currentDateObj.toISOString().split('T')[0];
      const isToday = dateString === new Date().toISOString().split('T')[0];

      const label = isToday ? (
        <span className="date-label">
          <span className="date-label__today">Сегодня</span><br/>
          <span className="date-label__weekday">{`${weekday} ${day}`}</span>
        </span>
      ) : (
        <span className="date-label__weekday">{`${weekday}`} <br/> {`${day}`}</span>
      );

      dates.push({
        date: dateString,
        label,
      });
    }

    return dates;
  };

  const weekDates = generateWeekDates();

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onChange(date);
  };
  const goToNextWeek = () => {
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(currentDate.getDate() + 6);
    setCurrentDate(nextWeek);
    setSelectedDate(nextWeek.toISOString().split('T')[0]);
    onChange(nextWeek.toISOString().split('T')[0]);
  };
  return (
  <div className="date-selector">
      <div className="date-selector__header">
        {weekDates.map((dateItem, index) => (
          <button
            key={index}
            onClick={() => handleDateChange(dateItem.date)}
            className={`date-selector__button ${
              selectedDate === dateItem.date ? 'date-selector__button--active' : ''
            }`}
          >
            <span>{dateItem.label}</span>
          </button>
        ))}
        <button className="date-selector__next-week" onClick={goToNextWeek}>  
          &gt;
        </button>
      </div>
    </div>
  );
};

export default DateSelector;