const SKELETON_FORECAST_CARDS = [1, 2, 3, 4, 5] as const;

export const WeatherPanelSkeleton = () => {
  return (
    <div className="weather-skeleton" aria-hidden="true">
      <section className="current-weather weather-skeleton-current">
        <div className="current-main">
          <div className="weather-skeleton-copy">
            <span className="skeleton-line skeleton-line-kicker" />
            <span className="skeleton-line skeleton-line-city" />
            <span className="skeleton-line skeleton-line-text" />
          </div>
          <div className="current-temperature">
            <span className="current-icon weather-skeleton-icon" />
            <span className="skeleton-line skeleton-line-temp" />
          </div>
        </div>
        <div className="current-stats">
          <span className="weather-skeleton-stat" />
          <span className="weather-skeleton-stat" />
          <span className="weather-skeleton-stat" />
          <span className="weather-skeleton-stat" />
        </div>
      </section>

      <section className="forecast-section weather-skeleton-forecast">
        <div className="forecast-header">
          <span className="skeleton-line skeleton-line-title" />
          <span className="skeleton-line skeleton-toggle-pill" />
        </div>
        <div className="forecast-grid">
          {SKELETON_FORECAST_CARDS.map((day) => (
            <article className="forecast-card weather-skeleton-card" key={day}>
              <span className="skeleton-line skeleton-line-label" />
              <span className="forecast-icon weather-skeleton-icon-sm" />
              <span className="skeleton-line skeleton-line-description" />
              <div className="forecast-minmax-grid weather-skeleton-minmax-grid">
                <span className="skeleton-line weather-skeleton-minmax" />
                <span className="skeleton-line weather-skeleton-minmax" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
