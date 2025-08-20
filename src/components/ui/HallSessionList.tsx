import React from 'react';
import './HallSessionList.css';
import capitalizeFirstLetter from '../../services/utils';

interface HallSessionListProps {
  sessionsByHall: {
    hallName: string;
    seanceTimes: {
        seanceId: number;
        seance_time: string;
    }[];
  }[];
  onSelectSession: (sessionId: number, date:string) => void;
}

const HallSessionList: React.FC<HallSessionListProps> = ({ sessionsByHall, onSelectSession }) => {
  return (  
    <div className='hall-session'>
      {sessionsByHall.map((session)=>(
                            <>
                              <div className='hall-session__title'>{capitalizeFirstLetter(session.hallName)}</div>
                              <ul className='session-time'>
                                {session.seanceTimes.map((time)=>(
                                  <li key={time.seanceId} onClick={()=>onSelectSession(time.seanceId, "2023-12-01")}>{time.seance_time}</li>
                                  ))}
                              </ul>
                            </>
                          ))}
                                                       
    </div>


  );
};

export default HallSessionList;