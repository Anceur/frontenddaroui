export type Location = {
  source: "gps" | "ip";
  latitude: number;
  longitude: number;
} | null;

export const getUserLocation = (): Promise<Location> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve({
            source: "gps",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => resolve(null), 
        { timeout: 5000 }
      );
    }
  });
};
