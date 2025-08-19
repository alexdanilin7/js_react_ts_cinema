import React from 'react';
import './HallSessionList.css';
import capitalizeFirstLetter from '../../services/utils';

interface HallSessionListProps {
  sessionsByHall: {time: {
                          timeSeance: string,
                          seanceId: number
                        }[], 
                  hallName: string | undefined};
  onSelectSession: (sessionId: number, date:string) => void;
}

const HallSessionList: React.FC<HallSessionListProps> = ({ sessionsByHall, onSelectSession }) => {
  return (
    <div className='hall-session'>
      <div className='hall-session__title'>
        <b>{capitalizeFirstLetter(sessionsByHall.hallName)}</b>
      </div>
      <ul className='session-time'>
        {sessionsByHall.time.map((time: {
                          timeSeance: string,
                          seanceId: number
                        }) => (<li key={time.seanceId} onClick={()=>onSelectSession(time.seanceId, "2023-12-01")}>{time.timeSeance}</li>))}
      </ul>
    </div>
  );
};

export default HallSessionList;