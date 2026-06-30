import { GET, PATCH } from '@/app/api/projects/[id]/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Project by ID API', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'proj-1' }),
  };

  describe('GET /api/projects/[id]', () => {
    it('debería devolver un proyecto existente', async () => {
      const mockProject = {
        id: 'proj-1',
        title: 'Proyecto Test',
        description: 'Descripción del proyecto',
        budget: 5000,
        duration: '2 semanas',
        status: 'OPEN',
        client: {
          id: 'client-1',
          name: 'Cliente Test',
        },
        applications: [],
      };

      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const response = await GET({} as Request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProject);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        include: {
          client: true,
          applications: {
            include: { developer: true },
          },
        },
      });
    });

    it('debería devolver 404 si proyecto no existe', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET({} as Request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Proyecto no encontrado' });
    });
  });

  describe('PATCH /api/projects/[id]', () => {
    it('debería actualizar proyecto correctamente', async () => {
      const updatedProject = {
        id: 'proj-1',
        title: 'Proyecto Test',
        status: 'IN_PROGRESS',
        cancelReason: null,
        developerId: 'dev-1',
      };

      (prisma.project.update as jest.Mock).mockResolvedValue(updatedProject);

      const request = new Request('http://localhost/api/projects/proj-1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'IN_PROGRESS',
          developerId: 'dev-1',
        }),
      });

      const response = await PATCH(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedProject);
      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: {
          status: 'IN_PROGRESS',
          cancelReason: undefined,
          developerId: 'dev-1',
        },
      });
    });

    it('debería manejar cancelación de proyecto', async () => {
      const updatedProject = {
        id: 'proj-1',
        title: 'Proyecto Test',
        status: 'CANCELLED',
        cancelReason: 'No hay presupuesto',
      };

      (prisma.project.update as jest.Mock).mockResolvedValue(updatedProject);

      const request = new Request('http://localhost/api/projects/proj-1', {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'CANCELLED',
          cancelReason: 'No hay presupuesto',
        }),
      });

      const response = await PATCH(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('CANCELLED');
    });
  });
});