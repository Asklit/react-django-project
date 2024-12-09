const DateDisplay = ({ dateString }) => {
  const date = new Date(dateString);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  };
  const formattedDate = date.toLocaleString("ru-RU", options); // Используем локаль 'ru-RU' для русского формата

  return <div>{formattedDate}</div>;
};

export default DateDisplay;
