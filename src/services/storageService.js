// src/services/storageService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const EXERCISES_KEY   = 'mis_ejercicios';
const ROUTINES_KEY    = 'mis_rutinas';
const PROGRESSES_KEY  = 'mis_progresos';

// — Ejercicios —
export async function getExercises() {
  const json = await AsyncStorage.getItem(EXERCISES_KEY);
  return json ? JSON.parse(json) : [];
}
export async function saveExercise(exercise) {
  const arr = await getExercises();
  arr.push(exercise);
  await AsyncStorage.setItem(EXERCISES_KEY, JSON.stringify(arr));
}

// — Rutinas —
export async function getRoutines() {
  const json = await AsyncStorage.getItem(ROUTINES_KEY);
  return json ? JSON.parse(json) : [];
}
export async function saveRoutine(routine) {
  const arr = await getRoutines();
  arr.push(routine);
  await AsyncStorage.setItem(ROUTINES_KEY, JSON.stringify(arr));
}

// — Progresos (global) —
export async function getProgresses() {
  const json = await AsyncStorage.getItem(PROGRESSES_KEY);
  return json ? JSON.parse(json) : [];
}
export async function saveProgress(progress) {
  const arr = await getProgresses();
  arr.push(progress);
  await AsyncStorage.setItem(PROGRESSES_KEY, JSON.stringify(arr));
}

// — Funciones para ProgressScreen —
// Obtiene sólo los progresos de un ejercicio dado
export async function getProgressesByExercise(exerciseId) {
  const all = await getProgresses();
  return all.filter(p => p.exerciseId === exerciseId);
}
// Agrega un progreso y devuelve el arreglo actualizado para ese ejercicio
export async function addProgress(progress) {
  await saveProgress(progress);
  return getProgressesByExercise(progress.exerciseId);
}