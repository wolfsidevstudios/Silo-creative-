
export const getApiKey = (): string => {
  const storedKey = localStorage.getItem('gemini-api-key');
  // Fallback to environment variable if no key is in local storage
  return storedKey || (process.env.API_KEY as string);
};

export const setApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('gemini-api-key', key);
  } else {
    localStorage.removeItem('gemini-api-key');
  }
};
