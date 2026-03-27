export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem("deviceID");

  if (!deviceId) {
    // Rastgele ve benzersiz bir karakter dizisi üret (Örn: SHZ-9821)
    // Her cihazın kendine özel bir ID'si olması için bu şarttır.
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    deviceId = `SHZ-${randomSuffix}`;
    localStorage.setItem("deviceID", deviceId);
  }

  return deviceId;
};
