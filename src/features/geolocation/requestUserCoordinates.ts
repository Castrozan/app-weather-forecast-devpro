type PermissionStateLike = 'granted' | 'prompt' | 'denied';

type GeolocationPermission = {
  state: PermissionStateLike;
};

type GeolocationPermissionApi = {
  query: (descriptor: PermissionDescriptor) => Promise<GeolocationPermission>;
};

type GeolocationApi = {
  getCurrentPosition: (
    onSuccess: (position: GeolocationPosition) => void,
    onError?: (error: GeolocationPositionError) => void,
    options?: PositionOptions,
  ) => void;
};

type GeolocationRuntime = {
  permissions?: GeolocationPermissionApi;
  geolocation?: GeolocationApi;
};

export type UserCoordinates = {
  lat: number;
  lon: number;
};

const GEOLOCATION_TIMEOUT_MS = 10_000;
const GEOLOCATION_MAX_AGE_MS = 300_000;

const getDefaultRuntime = (): GeolocationRuntime => {
  if (typeof navigator === 'undefined') {
    return {};
  }

  return {
    permissions: navigator.permissions as GeolocationPermissionApi | undefined,
    geolocation: navigator.geolocation,
  };
};

const getPermissionState = async (
  permissions?: GeolocationPermissionApi,
): Promise<PermissionStateLike | null> => {
  if (!permissions) {
    return null;
  }

  try {
    const permission = await permissions.query({
      name: 'geolocation',
    } as PermissionDescriptor);
    return permission.state;
  } catch {
    return null;
  }
};

export const queryGeolocationPermission = async (): Promise<PermissionStateLike | null> => {
  const runtime = getDefaultRuntime();
  return getPermissionState(runtime.permissions);
};

export const requestUserCoordinates = async (
  runtime: GeolocationRuntime = getDefaultRuntime(),
): Promise<UserCoordinates | null> => {
  const permissionState = await getPermissionState(runtime.permissions);

  if (permissionState === 'denied') {
    return null;
  }

  if (!runtime.geolocation) {
    return null;
  }

  return new Promise((resolve) => {
    runtime.geolocation?.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      },
      {
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAX_AGE_MS,
      },
    );
  });
};
