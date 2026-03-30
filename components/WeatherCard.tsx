'use client';

import { useEffect, useState } from 'react';
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

interface DailyForecast {
    date: string;
    maxTemp: number;
    minTemp: number;
    code: number;
}

interface WeatherData {
    temp: number;
    code: number;
    wind: number;
    daily: DailyForecast[];
}

export default function WeatherCard({ lang }: { lang: string }) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchWeather() {
            try {
                // Majdal Shams coordinates, fetching current weather + 4 days daily forecast (today + 3 days)
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=33.273921&longitude=35.771221&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4', {
                    cache: 'force-cache',
                    next: { revalidate: 3600 }
                });

                const data = await res.json();

                if (data && data.current_weather && data.daily) {
                    const dailyData: DailyForecast[] = [];
                    // Start from index 1 to skip today and get the next 3 days
                    for (let i = 1; i < Math.min(4, data.daily.time.length); i++) {
                        dailyData.push({
                            date: data.daily.time[i],
                            maxTemp: Math.round(data.daily.temperature_2m_max[i]),
                            minTemp: Math.round(data.daily.temperature_2m_min[i]),
                            code: data.daily.weathercode[i]
                        });
                    }

                    setWeather({
                        temp: Math.round(data.current_weather.temperature),
                        code: data.current_weather.weathercode,
                        wind: data.current_weather.windspeed,
                        daily: dailyData
                    });
                }
            } catch (error) {
                console.error("Failed to fetch weather", error);
            } finally {
                setLoading(false);
            }
        }

        fetchWeather();
    }, []);

    function getWeatherText(code: number, lang: string) {
        if (code === 0) {
            if (lang === 'ar') return 'سماء صافية';
            if (lang === 'he') return 'שמיים בהירים';
            return 'Clear Sky';
        }
        if (code === 1 || code === 2 || code === 3) {
            if (lang === 'ar') return 'غائم جزئياً';
            if (lang === 'he') return 'מעונן חלקית';
            return 'Partly Cloudy';
        }
        if (code >= 50 && code <= 69) {
            if (lang === 'ar') return 'ممطر';
            if (lang === 'he') return 'גשום';
            return 'Rainy';
        }
        if (code >= 70 && code <= 79) {
            if (lang === 'ar') return 'مثلج';
            if (lang === 'he') return 'שלג';
            return 'Snowy';
        }
        if (code >= 90) {
            if (lang === 'ar') return 'عاصف';
            if (lang === 'he') return 'סוער';
            return 'Thunderstorms';
        }

        if (lang === 'ar') return 'غائم';
        if (lang === 'he') return 'מעונן';
        return 'Cloudy';
    }

    function getWeatherIcon(code: number) {
        if (code === 0) return Sun;
        if (code >= 50 && code <= 69) return CloudRain;
        if (code >= 70 && code <= 79) return CloudSnow;
        if (code >= 90) return CloudLightning;
        return Cloud;
    }

    function getDayName(dateString: string, locale: string) {
        const date = new Date(dateString);
        return date.toLocaleDateString(locale, { weekday: 'short' });
    }

    if (loading) {
        return (
            <div className="mt-3 gap-2 px-4 py-3 min-h-[150px] justify-center flex flex-col min-w-[250px] md:w-[350px] bg-white/10 backdrop-blur-sm rounded-3xl shadow-lg border border-white/10 animate-pulse">
                <div className="w-6 h-6 bg-white/30 rounded-full mb-2 mx-auto"></div>
                <div className="w-16 h-8 bg-white/30 rounded mb-2 mx-auto"></div>
                <div className="w-32 h-4 bg-white/30 rounded mx-auto"></div>
            </div>
        );
    }

    if (!weather) {
        return null;
    }

    const Icon = getWeatherIcon(weather.code);
    const descriptionText = getWeatherText(weather.code, lang);
    const windText = lang === 'ar' ? `الرياح: ${weather.wind} كم/س` : lang === 'he' ? `רוח: ${weather.wind} קמ"ש` : `Wind: ${weather.wind} km/h`;

    return (
        <div className="mt-3 gap-2 px-4 py-4 min-h-[150px] items-center justify-center flex flex-col gap-y-3 min-w-[250px] md:w-[350px] bg-white/10 backdrop-blur-sm rounded-3xl shadow-lg border border-white/10 transition-all hover:bg-white/20">

            <div className="flex flex-col items-center gap-1">
                <Icon className="text-white w-8 h-8 drop-shadow-md" />
                <p className="text-white text-3xl font-bold mt-1 shadow-black">{`${weather.temp}°C`}</p>
                <p className="text-white/90 text-sm md:text-base font-medium">{`${descriptionText} • ${windText}`}</p>
            </div>

            {/* 3-Day Forecast Section */}
            <div className="flex w-full justify-between items-center mt-2 pt-3 border-t border-white/20 px-4">
                {weather.daily.map((day, idx) => {
                    const DayIcon = getWeatherIcon(day.code);
                    return (
                        <div key={idx} className="flex flex-col items-center gap-1 text-white">
                            <span className="text-[0.65rem] text-white/80 font-bold uppercase tracking-wider">{getDayName(day.date, lang)}</span>
                            <DayIcon className="w-5 h-5 drop-shadow-sm my-1" />
                            <span className="text-sm font-bold">{day.maxTemp}° <span className="text-white/60 font-normal">{day.minTemp}°</span></span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
