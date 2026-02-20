export class WeatherProviderConfigurationError extends Error {
  provider: string;

  constructor(provider: string, message = 'Weather provider is not configured') {
    super(message);
    this.name = 'WeatherProviderConfigurationError';
    this.provider = provider;
  }
}

export class WeatherProviderUpstreamError extends Error {
  provider: string;
  statusCode: number;

  constructor(provider: string, statusCode: number) {
    super(`Weather provider "${provider}" request failed with status ${statusCode}`);
    this.name = 'WeatherProviderUpstreamError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

export const isWeatherProviderConfigurationError = (
  error: unknown,
): error is WeatherProviderConfigurationError => error instanceof WeatherProviderConfigurationError;

export const isWeatherProviderUpstreamError = (
  error: unknown,
): error is WeatherProviderUpstreamError => error instanceof WeatherProviderUpstreamError;
