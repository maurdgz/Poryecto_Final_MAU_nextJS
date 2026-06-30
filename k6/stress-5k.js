
import http from 'k6/http';
import { check, sleep } from 'k6';

// Prueba de 5,000 usuarios concurrentes (medio)
export const options = {
  stages: [
    { duration: '1m30s', target: 1000 }, // Escalar a 1k
    { duration: '1m', target: 2500 },    // Subir a 2.5k
    { duration: '1m', target: 5000 },    // Llegar a 5k
    { duration: '3m', target: 5000 },    // Mantener 5k por 3 min
    { duration: '1m30s', target: 0 },    // Bajar a 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'], // <10% errores permitidos
    http_req_duration: ['p(95)<2000'], // 95% < 2seg
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const rand = Math.random();
  let res;

  if (rand < 0.6) {
    // 60%: Listar proyectos
    res = http.get(`${BASE_URL}/api/projects`);
  } else if (rand < 0.85) {
    // 25%: Consultar un proyecto detallado (simulado)
    res = http.get(`${BASE_URL}/api/projects/1`);
  } else {
    // 15%: Consultar API de usuarios
    res = http.get(`${BASE_URL}/api/users/test-id`);
  }

  check(res, {
    'respuesta aceptable': (r) => r.status >= 200 && r.status < 500,
  });

  sleep(Math.random() * 2 + 0.5);
}
