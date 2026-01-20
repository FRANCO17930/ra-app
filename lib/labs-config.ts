export const LABORATORIES = [
  "Laboratorio de presión",
  "Laboratorio de Fuerza y Torque",
  "Laboratorio de Masa",
  "Laboratorio de Química y Volúmen",
  "Laboratorio de Electricidad",
  "Laboratorio de humedad",
  "Laboratorio de temperatura",
  "Laboratorio de Longitud y Ángulo"
] as const;

export type Laboratory = typeof LABORATORIES[number];

export interface ARAsset {
  id: string;
  lab: Laboratory;
  imageName: string;
  imageUrl: string;
  videoUrl: string;
  title: string;
}
