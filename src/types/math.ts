export function toRad(degree: number) {
  const degreeToRad = Math.PI / 180;
  return degree * degreeToRad;
}

export function toDegree(rad: number) {
  const radToDegree = 180 / Math.PI;
  return rad * radToDegree;
}
