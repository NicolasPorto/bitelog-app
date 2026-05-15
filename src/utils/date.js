export const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getStartOfLocalDay = (
  date = new Date()
) => {
  const local = new Date(date);

  local.setHours(0, 0, 0, 0);

  return local;
};

export const getEndOfLocalDay = (
  date = new Date()
) => {
  const local = new Date(date);

  local.setHours(23, 59, 59, 999);

  return local;
};

export const formatTime = (
  date,
  lang = "pt"
) => {
  return new Date(date).toLocaleTimeString(
    lang === "pt"
      ? "pt-BR"
      : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export const formatDate = (
  date,
  lang = "pt"
) => {
  return new Date(date).toLocaleDateString(
    lang === "pt"
      ? "pt-BR"
      : "en-US"
  );
};