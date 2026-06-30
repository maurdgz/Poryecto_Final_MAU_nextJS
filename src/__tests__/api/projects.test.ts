import { GET, POST } from '@/app/api/projects/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Projects API', () => {
  describe('GET /api/projects', () => {
    it('debería devolver proyectos con estado OPEN', async () => {
      const mockProjects = [
        {
          id: '1',
          title: 'Proyecto 1',
          description: 'Descripción 1',
          status: 'OPEN',
          client: { name: 'Cliente 1', email: 'cliente1@test.com' },
        },
      ];

      (prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProjects);
      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { status: 'OPEN' },
        include: { client: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debería manejar errores de base de datos', async () => {
      (prisma.project.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Error al obtener proyectos' });
    });
  });

  describe('POST /api/projects', () => {
    it('debería crear un proyecto correctamente', async () => {
      const mockProject = {
        id: '1',
        title: 'Nuevo Proyecto',
        description: 'Descripción del proyecto',
        budget: 1000,
        duration: '2 semanas',
        clientId: 'client-1',
        category: 'Web',
        technologies: 'React',
        type: 'UNITARY',
      };

      (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);

      const request = new NextRequest('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Nuevo Proyecto',
          description: 'Descripción del proyecto',
          budget: '1000',
          duration: '2 semanas',
          clientId: 'client-1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProject);
    });

    it('debería manejar errores al crear proyecto', async () => {
      (prisma.project.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const request = new NextRequest('http://localhost/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Error Proyecto',
          budget: 'invalid',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Error al crear proyecto' });
    });
  });
});