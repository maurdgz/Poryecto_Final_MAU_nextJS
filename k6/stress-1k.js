
import http from 'k6/http';
import { check, sleep } from 'k6';

// Prueba de 1,000 usuarios concurrentes (manejable)
export const options = {
  stages: [
    { duration: '1m', target: 200 },  // Escalar a 200
    { duration: '1m', target: 500 },  // Subir a 500
    { duration: '30s', target: 1000 }, // Llegar a 1k
    { duration: '2m', target: 1000 }, // Mantener 1k por 2 min
    { duration: '1m', target: 0 },     // Bajar a 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'], // <10% errores permitidos
    http_req_duration: ['p(95)<1500'], // 95% < 1.5seg
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const responses = [];

  // 1. Cargar proyectos (página principal)
  const listRes = http.get(`${BASE_URL}/api/projects`);
  responses.push(listRes);

  sleep(Math.random() * 1.5);

  // 2. 40% chance de ver un proyecto detallado
  if (Math.random() < 0.4) {
    try {
      const projects = JSON.parse(listRes.body);
      if (projects && projects.length > 0) {
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const detailRes = http.get(`${BASE_URL}/api/projects/${randomProject.id}`);
        responses.push(detailRes);
      }
    } catch (e) { /* Ignorar errores de parseo */ }
  }

  sleep(Math.random() * 0.8);

  check(responses, {
    'solicitudes exitosas': (r) => r.every(res => res.status >= 200 && res.status < 400 || res.status === 401),
  });
}
