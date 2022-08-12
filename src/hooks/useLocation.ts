import axios from 'axios';
import { useEffect, useState } from 'react';

interface OptionsParam {
    api?: string;
    country?: string;
}

const LanguageDefault: any = {
    'VN': 'vi',
    'TH': 'th',
    'ID': 'id',
    'EN': 'en'
}

const useLocation = (options: OptionsParam) => {
  const [country, setCountry] = useState(options.country);
  const [language, setLanguage] = useState<string>();
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const api = options.api || "https://api.country.is";

  useEffect(() => {
    let isCancelled = false;

    if (country) return;
    async function fetchAPI() {
      setIsLoading(true);
      axios.get(api)
        .then(res => {
          if (res && res.data.country && !isCancelled) {
            setCountry(res.data.country);
            if(res.data.country in LanguageDefault) {
                setLanguage(LanguageDefault[res.data.country])
            } else {
                setLanguage('en')
                setCountry('EN')
            }
          }
        })
        .catch(err => setError(err))
        .finally(() => setIsLoading(false));
    }
    fetchAPI();
    return () => {
      isCancelled = true;
    };
  }, []);
  
  return { country, error, isLoading, language };
} 

export default useLocation;