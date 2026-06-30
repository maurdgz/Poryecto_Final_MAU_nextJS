import http from 'k6/http';
import { check, sleep } from 'k6';

// Prueba de estrés máxima: 1000 usuarios concurrentes
export const options = {
  vus: 1000,
  duration: '2m',
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Simular diferentes operaciones según un peso aleatorio
  const random = Math.random();

  if (random < 0.6) {
    // 60% de los usuarios: solo ven la página principal (listar proyectos)
    const res = http.get(`${BASE_URL}/api/projects`);
    check(res, {
      'listar proyectos OK': (r) => r.status === 200,
    });
  } else if (random < 0.8) {
    // 20% de los usuarios: intentan crear un proyecto (simulado)
    const payload = JSON.stringify({
      title: 'Prueba de proyecto desde k6',
      description: 'Este es un proyecto de prueba para estrés',
      budget: 1000,
      duration: '2 semanas',
      clientId: 'test-client-id', // En producción, esto necesitaría auth
      category: 'Web',
      technologies: 'React, Next.js',
      type: 'UNITARY',
      paymentMethod: 'BCP',
    });

    const params = { headers: { 'Content-Type': 'application/json' } };
    // Nota: En producción, esta solicitud necesitaría autenticación
    // Por ahora, solo comprobamos que la ruta responda (aunque sea con error de auth)
    const res = http.post(`${BASE_URL}/api/projects`, payload, params);
    check(res, {
      'crear proyecto responde': (r) => r.status === 200 || r.status === 401, // 401 es esperado si no hay auth
    });
  } else {
    // 20% de los usuarios: buscan información de un usuario aleatorio
    // Nuevamente, en producción necesitaríamos IDs reales o auth
    const res = http.get(`${BASE_URL}/api/users/test-id`);
    check(res, {
      'obtener usuario responde': (r) => r.status === 200 || r.status === 404,
    });
  }

  sleep(1);
}
