
import http from 'k6/http';
import { check, sleep } from 'k6';

// Prueba EXTREMA: 10,000 usuarios concurrentes
export const options = {
  stages: [
    { duration: '2m', target: 2000 },  // Escalar lentamente a 2k
    { duration: '1m', target: 5000 },  // Subir a 5k
    { duration: '1m', target: 10000 }, // Llegar a 10k
    { duration: '3m', target: 10000 }, // Mantener 10k por 3 minutos
    { duration: '2m', target: 0 },     // Bajar a 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'], // <10% de errores permitidos
    http_req_duration: ['p(95)<2000'], // 95% de solicitudes < 2seg
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simular comportamiento de usuario real
  const responses = [];

  // 1. Cargar la página principal (listar proyectos)
  const listRes = http.get(`${BASE_URL}/api/projects`);
  responses.push(listRes);

  sleep(Math.random() * 2); // Pausa aleatoria entre 0-2s

  // 2. 50% chance de ver un proyecto detallado
  if (Math.random() < 0.5) {
    try {
      const projects = JSON.parse(listRes.body);
      if (projects && projects.length > 0) {
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const detailRes = http.get(`${BASE_URL}/api/projects/${randomProject.id}`);
        responses.push(detailRes);
      }
    } catch (e) { /* Ignorar errores de parseo para la prueba */ }
  }

  sleep(Math.random() * 1);

  // Verificar todas las solicitudes
  check(responses, {
    'todas las solicitudes respondieron con éxito': (r) => r.every(res => res.status >= 200 && res.status < 400 || res.status === 401),
  });
}
