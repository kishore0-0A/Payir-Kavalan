import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CloudSun, CloudRain, Droplets, Thermometer, AlertTriangle, CalendarClock, BellRing } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import base44 from '@/api/apiClient';
import { fetchWeather } from '@/lib/weather';

// DEMO_FORECAST removed as we now fetch real data

export default function Alerts() {
  const [reminders, setReminders] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const { user } = useOutletContext();

  useEffect(() => {
    base44.entities.Reminder.filter({ status: 'pending' }, 'reminder_date', 10).then(setReminders).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      const location = user.village || 'New Delhi, IN';
      fetchWeather(location).then((data) => {
        setWeather(data);
        setWeatherLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Weather & Risk Alerts</h1>
        <p className="mt-1 text-muted-foreground">Weather information, advisories and reminders.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weather */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><CloudSun className="h-5 w-5 text-primary" /> Current weather</h2>
              {weatherLoading ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">Loading</span>
              ) : (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-success">Live</span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-muted p-4"><Thermometer className="h-5 w-5 text-primary" /><p className="mt-2 text-2xl font-bold">{weather ? weather.temp : '--'}°C</p><p className="text-xs text-muted-foreground">Temperature</p></div>
              <div className="rounded-xl bg-muted p-4"><Droplets className="h-5 w-5 text-primary" /><p className="mt-2 text-2xl font-bold">{weather ? weather.humidity : '--'}%</p><p className="text-xs text-muted-foreground">Humidity</p></div>
              <div className="rounded-xl bg-muted p-4"><CloudRain className="h-5 w-5 text-primary" /><p className="mt-2 text-2xl font-bold">{weather ? weather.rain : '--'}%</p><p className="text-xs text-muted-foreground">Rain prob.</p></div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="mb-4 text-lg font-semibold">4-day forecast</h2>
            {weatherLoading ? (
              <div className="h-32 animate-pulse rounded-xl bg-muted" />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {weather?.forecast?.map((f) => {
                  const Icon = (f.condMain === 'Rain' || f.condMain === 'Drizzle') ? CloudRain : CloudSun;
                  return (
                    <div key={f.day} className="rounded-xl border border-border p-4 text-center">
                      <p className="text-sm font-medium text-muted-foreground">{f.day}</p>
                      <Icon className="mx-auto my-2 h-7 w-7 text-primary" />
                      <p className="text-lg font-bold">{f.temp}°C</p>
                      <p className="text-xs text-muted-foreground">{f.cond}</p>
                      <p className="mt-1 text-xs text-primary">{f.rain}% rain</p>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-4 text-xs text-muted-foreground">Forecast data powered by OpenWeather API.</p>
          </div>

          <div className={`rounded-2xl border ${weather && weather.humidity > 70 ? 'border-warning/40 bg-warning/10' : 'border-success/40 bg-success/10'} p-6`}>
            <h2 className={`flex items-center gap-2 text-lg font-semibold ${weather && weather.humidity > 70 ? 'text-warning-foreground' : 'text-success'}`}><AlertTriangle className="h-5 w-5" /> Crop-related weather warnings</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {weather && weather.humidity > 70 && (
                <li className="flex gap-2"><span className="text-warning-foreground">•</span> High humidity ({weather.humidity}%) may increase the likelihood of some fungal disease conditions.</li>
              )}
              {weather && weather.rain > 30 && (
                <li className="flex gap-2"><span className="text-warning-foreground">•</span> Rain expected ({weather.rain}%) — consider delaying any pesticide application.</li>
              )}
              {weather && weather.temp > 25 && weather.humidity > 70 && (
                <li className="flex gap-2"><span className="text-warning-foreground">•</span> Warm temperatures with moisture favour blight development in susceptible crops.</li>
              )}
              {weather && weather.humidity <= 70 && weather.rain <= 30 && (
                <li className="flex gap-2"><span className="text-success">•</span> Current conditions are generally favorable. No severe weather warnings for crops.</li>
              )}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">Advisory only. Weather information is separate from AI disease prediction and risk advisories.</p>
          </div>
        </div>

        {/* Reminders + risk */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-destructive bg-destructive/10 p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle className="h-5 w-5" /> Active Disease Alerts</h2>
            <ul className="mt-4 space-y-3">
              <li className="rounded-xl bg-card p-3 shadow-sm border border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">Late Blight Outbreak</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Reported in your region</p>
                  </div>
                  <span className="bg-destructive/20 text-destructive text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">High</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Multiple local farmers have reported Late Blight on Tomato crops. Inspect your plants immediately.</p>
              </li>
              <li className="rounded-xl bg-card p-3 shadow-sm border border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">Pest Advisory</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Based on weather trend</p>
                  </div>
                  <span className="bg-warning/20 text-warning-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Medium</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Recent humidity spikes indicate favorable conditions for Aphids.</p>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="flex items-center gap-2 font-semibold"><BellRing className="h-5 w-5 text-primary" /> Potential environmental risk</h2>
            <div className={`mt-3 rounded-xl ${weather && weather.humidity > 70 ? 'bg-warning/10' : 'bg-success/10'} p-4`}>
              <p className={`font-semibold ${weather && weather.humidity > 70 ? 'text-warning-foreground' : 'text-success'}`}>{weather && weather.humidity > 70 ? 'Moderate risk' : 'Low risk'}</p>
              <p className="mt-1 text-sm text-muted-foreground">Based on current humidity ({weather ? weather.humidity : '--'}%) and temperature. Monitor crops closely.</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">This is an advisory value, not a validated disease-risk prediction.</p>
          </div>
        </div>
      </div>
    </div>
  );
}