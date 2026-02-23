import Skeleton from 'react-loading-skeleton';

const SKELETON_FORECAST_CARDS = [1, 2, 3, 4, 5] as const;
const SKELETON_STAT_SLOTS = [1, 2, 3, 4] as const;

const SKELETON_BASE_COLOR = '#1a4a6e';
const SKELETON_HIGHLIGHT_COLOR = '#2a6a9e';

const skeletonProps = {
  baseColor: SKELETON_BASE_COLOR,
  highlightColor: SKELETON_HIGHLIGHT_COLOR,
};

export const WeatherPanelSkeleton = () => {
  return (
    <div className="weather-skeleton" aria-hidden="true">
      <section className="current-weather weather-skeleton-current">
        <div className="current-main">
          <div>
            <p className="current-kicker">
              <Skeleton width={170} {...skeletonProps} />
            </p>
            <div className="skeleton-city-placeholder">
              <Skeleton width={220} height="1em" {...skeletonProps} />
            </div>
            <p className="current-description">
              <Skeleton width={180} {...skeletonProps} />
            </p>
          </div>
          <div className="current-temperature">
            <span className="current-icon weather-skeleton-icon">
              <Skeleton circle width={80} height={80} {...skeletonProps} />
            </span>
            <div className="skeleton-temp-placeholder">
              <Skeleton width={130} height="1em" {...skeletonProps} />
            </div>
          </div>
        </div>
        <dl className="current-stats">
          {SKELETON_STAT_SLOTS.map((slot) => (
            <div className="current-stat" key={slot}>
              <dt>
                <Skeleton width={60} {...skeletonProps} />
              </dt>
              <dd>
                <Skeleton width={80} {...skeletonProps} />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="forecast-section">
        <div className="forecast-header">
          <div className="skeleton-title-placeholder">
            <Skeleton width={240} height="1em" {...skeletonProps} />
          </div>
          <Skeleton width={90} height={36} borderRadius={999} {...skeletonProps} />
        </div>
        <div className="forecast-grid">
          {SKELETON_FORECAST_CARDS.map((day) => (
            <article className="forecast-card weather-skeleton-card" key={day}>
              <div className="forecast-label">
                <Skeleton width={86} {...skeletonProps} />
              </div>
              <span className="forecast-icon weather-skeleton-icon-sm">
                <Skeleton circle width={44} height={44} {...skeletonProps} />
              </span>
              <div className="forecast-description">
                <Skeleton width="70%" {...skeletonProps} />
              </div>
              <div className="forecast-minmax-grid">
                <div className="forecast-minmax">
                  <Skeleton {...skeletonProps} />
                </div>
                <div className="forecast-minmax">
                  <Skeleton {...skeletonProps} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
