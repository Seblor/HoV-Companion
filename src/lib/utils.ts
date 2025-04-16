export function humanFileSize(bytes: number, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${String(bytes)} B`;
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;
  let adjustedBytes = bytes;

  do {
    adjustedBytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(adjustedBytes) * r) / r >= thresh && u < units.length - 1);

  return `${adjustedBytes.toFixed(dp)} ${units[u]}`;
}