import React, { useState } from "react";
import HallsListPanel from "../../components/hall/HallListPanel";
import HallConfigPanel from "../../components/hall/HallConfigPanel";
import PriceConfigPanel from "../../components/hall/PriceConfigPanel";
import SeanceGridPanel from "../../components/hall/SeanceGridPanel";
import SalesControlPanel from "../../components/hall/SalesControlPanel";
import "./HallManager.css";

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  isOpen,
  onToggle,
  children,
  isFirst = false,
  isLast = false
}) => {
    const showTimeline = true;
  return (
     <div className="accordion-section">
      <div className="accordion-header" onClick={onToggle}>
        {showTimeline && (
          <div className="header-timeline">
           {!isFirst && isOpen && <div className="timeline-vertical-line__up"></div>}
            <div className="timeline-dot"></div>
            {(!isLast || isFirst) && isOpen && <div className="timeline-vertical-line__down"></div>}
          </div>
        )}
        <div className="header-content">
          <h3>{title}</h3>
          <span className={`accordion-icon ${isOpen ? "open" : ""}`}>
            {isOpen ? "▼" : "►"}
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="accordion-content">
          {!isLast && <div className="content-timeline-line"></div>}
          <div className="content-inner">
            {children}
          </div>
        </div>
      )}
    </div>
   
  );
};

const HallManager: React.FC = () => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    hallsList: true,
    hallConfig: false,
    priceConfig: false,
    seanceGrid: false,
    salesControl: false
  });

  const sections = [
    { key: "hallsList", title: "Управление залами", component: <HallsListPanel /> },
    { key: "hallConfig", title: "Конфигурация залов", component: <HallConfigPanel /> },
    { key: "priceConfig", title: "Конфигурация цен", component: <PriceConfigPanel /> },
    { key: "seanceGrid", title: "Сетка сеансов", component: <SeanceGridPanel /> },
    { key: "salesControl", title: "Открыть продажи", component: <SalesControlPanel /> }
  ];

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const collapseAllSections = () => {
    setOpenSections({
      hallsList: true, 
      hallConfig: false,
      priceConfig: false,
      seanceGrid: false,
      salesControl: false
    });
  };
  return (
    <div className="hall-manager"> 
      <div className="timeline-container">

        {sections.map((section, index) => (
          <AccordionSection
            key={section.key}
            title={section.title}
            isOpen={openSections[section.key]}
            onToggle={() => toggleSection(section.key)}
            isFirst={index === 0}
            isLast={index === sections.length - 1}
          >
          {section.key==='hallsList' ? <HallsListPanel onHallDeleted={collapseAllSections}/> : section.component}
          </AccordionSection>
        ))}
      </div>
    </div>
  );
};

export default HallManager;
