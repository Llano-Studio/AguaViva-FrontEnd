import React, { useEffect, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import "../../styles/css/components/common/datePickerWithLabel.css";

interface DatePickerWithLabelProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DatePickerWithLabel: React.FC<DatePickerWithLabelProps> = ({
  value,
  onChange,
  className,
}) => {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(formatDate(value));
  }, [value]);

  return (
    <div className={`${className}-form-date-wrapper date-wrapper`} style={{ position: "relative" }}>
      <img
        src="/assets/icons/calendar.svg"
        alt="Calendar Icon"
        className="date-calendar-img"
      />
      <div className={`${className}-form-date-display date-display`}>
        {formattedDate}
      </div>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${className}-form-date-selector date-selector`}
        style={{ width: 20, height: 20, position: "relative", zIndex: 2 }}
      />
      <img
        src="/assets/icons/arrow-down-blue.svg"
        alt="Arrow Down Icon"
        className="date-arrow-down-img"
      />
    </div>
  );
};