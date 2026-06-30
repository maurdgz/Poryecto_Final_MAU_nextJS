import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración: simula 500 usuarios concurrentes
export const options = {
  stages: [
    { duration: '30s', target: 100 },  // Escalar hasta 100 usuarios en 30s
    { duration: '1m', target: 300 },   // Mantener 300 usuarios por 1 minuto
    { duration: '30s', target: 500 },  // Escalar hasta 500 usuarios
    { duration: '1m', target: 500 },   // Mantener 500 usuarios por 1 minuto
    { duration: '30s', target: 0 },    // Reducir a 0
  ],
};

// La URL de tu app (usa la de Vercel o localhost:3000 para pruebas locales)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 1. Obtener lista de proyectos (la página principal)
  let res = http.get(`${BASE_URL}/api/projects`);
  check(res, {
    'status es 200': (r) => r.status === 200,
    'tiempo de respuesta < 500ms': (r) => r.timings.duration < 500,
  });

  // Parsear proyectos para usar en las siguientes solicitudes
  let projects = [];
  try {
    projects = JSON.parse(res.body);
  } catch (e) {
    console.log('Error parsing JSON:', e);
  }

  // Pausa pequeña entre solicitudes para simular usuario real
  sleep(1);

  // 2. Si hay proyectos, visitar uno aleatorio
  if (projects.length > 0) {
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    res = http.get(`${BASE_URL}/api/projects/${randomProject.id}`);
    check(res, {
      'status es 200 (detalle de proyecto)': (r) => r.status === 200,
      'tiempo de respuesta detalle < 400ms': (r) => r.timings.duration < 400,
    });
  }

  sleep(0.5);
}
