
import http from 'k6/http';
import { check, sleep } from 'k6';

// ⚠️ IMPORTANTE: Para esta prueba NECESITAS k6 CLOUD
// k6 Cloud permite distribuir la carga entre múltiples máquinas
// No puedes correr 50k VUs en una sola PC!

export const options = {
  // Configuración para k6 Cloud
  ext: {
    loadimpact: {
      projectID: __ENV.K6_PROJECT_ID, // Tu project ID de k6 Cloud
      name: 'MVPcode Extreme Stress (50k VUs)',
      distribution: {
        distributionLabel1: { loadZone: 'amazon:us:ashburn', percent: 34 },
        distributionLabel2: { loadZone: 'amazon:eu:london', percent: 33 },
        distributionLabel3: { loadZone: 'amazon:ap:tokyo', percent: 33 },
      },
    },
  },
  stages: [
    { duration: '5m', target: 10000 },  // Escalar lentamente a 10k
    { duration: '3m', target: 25000 },  // Subir a 25k
    { duration: '2m', target: 50000 },  // Llegar a 50k
    { duration: '5m', target: 50000 },  // Mantener 50k por 5 minutos
    { duration: '3m', target: 0 },       // Bajar a 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // <5% de errores permitidos
    http_req_duration: ['p(99)<3000'], // 99% de solicitudes < 3seg
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Mix de operaciones para simular tráfico real
  const rand = Math.random();
  let res;

  if (rand < 0.6) {
    // 60%: Listar proyectos
    res = http.get(`${BASE_URL}/api/projects`);
  } else if (rand < 0.8) {
    // 20%: Consultar API de usuarios
    res = http.get(`${BASE_URL}/api/users/test-id`);
  } else {
    // 20%: Consultar un proyecto aleatorio (simular navegación)
    res = http.get(`${BASE_URL}/api/projects/1`); // Usar un ID fijo para simplicidad
  }

  check(res, {
    'respuesta exitosa o esperada': (r) => r.status >= 200 && r.status < 500,
  });

  sleep(Math.random() * 3 + 0.5); // Pausa entre 0.5s y 3.5s
}
