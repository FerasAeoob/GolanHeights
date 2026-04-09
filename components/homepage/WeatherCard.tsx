import { Sun, Moon, Cloud, CloudRain, CloudSnow, CloudLightning } from 'lucide-react';

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
    isDay: number;
    daily: DailyForecast[];
}

async function getWeather(): Promise<WeatherData | null> {
    try {
        const res = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=33.273921&longitude=35.771221&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4',
            {
                next: { revalidate: 3600 }
            }
        );

        if (!res.ok) {
            return null;
        }

        const data = await res.json();

        if (!data || !data.current_weather || !data.daily) {
            return null;
        }

        const dailyData: DailyForecast[] = [];

        for (let i = 1; i < Math.min(4, data.daily.time.length); i++) {
            dailyData.push({
                date: data.daily.time[i],
                maxTemp: Math.round(data.daily.temperature_2m_max[i]),
                minTemp: Math.round(data.daily.temperature_2m_min[i]),
                code: data.daily.weathercode[i]
            });
        }

        return {
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
            wind: Math.round(data.current_weather.windspeed),
            isDay: data.current_weather.is_day,
            daily: dailyData
        };
    } catch (error) {
        console.error('Failed to fetch weather:', error);
        return null;
    }
}

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

function getWeatherIcon(code: number, isDay: number = 1) {
    if (code === 0) return isDay === 0 ? Moon : Sun;
    if (code >= 50 && code <= 69) return CloudRain;
    if (code >= 70 && code <= 79) return CloudSnow;
    if (code >= 90) return CloudLightning;
    return Cloud;
}

function getDayName(dateString: string, lang: string) {
    const date = new Date(dateString);

    const locale =
        lang === 'ar' ? 'ar' :
            lang === 'he' ? 'he-IL' :
                'en-US';

    return date.toLocaleDateString(locale, { weekday: 'short' });
}

export default async function WeatherCard({ lang }: { lang: string }) {
    const weather = await getWeather();

    if (!weather) {
        return (
            /* Changed: Removed md:w-[350px], added w-full flex-1 */
            <div className="flex-1 w-full mt-3 px-4 py-4 min-h-[180px] bg-white/10 backdrop-blur-sm rounded-3xl shadow-lg border border-white/10 flex items-center justify-center">
                <p className="text-white/80 text-sm">
                    {lang === 'ar' ? 'تعذر تحميل الطقس' : lang === 'he' ? 'לא ניתן לטעון את מזג האוויר' : 'Unable to load weather'}
                </p>
            </div>
        );
    }

    const Icon = getWeatherIcon(weather.code, weather.isDay);
    const descriptionText = getWeatherText(weather.code, lang);
    const windText = lang === 'ar' ? `الرياح: ${weather.wind} كم/س` : lang === 'he' ? `רוח: ${weather.wind} קמ"ש` : `Wind: ${weather.wind} km/h`;

    return (
        /* Key Changes:
           1. Removed md:w-[350px]
           2. Added flex-1 and w-full
           3. Changed min-h to 180px to better match HeroInfoCard height
        */
        <div className="flex-1 w-full mt-3 px-6 py-5 min-h-[180px] flex flex-col justify-between bg-white/6 backdrop-blur-[4px] rounded-3xl shadow-lg border border-white/10 transition-all hover:bg-white/20">

            {/* Current Weather Section */}
            <div className="flex flex-col items-center gap-1">
                <Icon className="text-white w-10 h-10 drop-shadow-md" />
                <p className="text-white text-4xl font-bold mt-1">
                    {weather.temp}°C
                </p>
                <p className="text-white/90 text-sm md:text-base font-medium text-center">
                    {descriptionText} • {windText}
                </p>
            </div>

            {/* Daily Forecast Section */}
            <div className="flex w-full justify-between items-center mt-4 pt-4 border-t border-white/20">
                {weather.daily.map((day, idx) => {
                    const DayIcon = getWeatherIcon(day.code, 1);
                    return (
                        <div key={idx} className="flex flex-col items-center gap-1 text-white">
                            <span className="text-[0.65rem] text-white/70 font-bold uppercase tracking-wider">
                                {getDayName(day.date, lang)}
                            </span>
                            <DayIcon className="w-5 h-5 my-1" />
                            <span className="text-sm font-bold">
                                {day.maxTemp}°
                                <span className="text-white/40 font-normal ml-1"> {day.minTemp}°</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}