import { GET, PATCH } from '@/app/api/users/[id]/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('Users API', () => {
  const mockContext = {
    params: Promise.resolve({ id: 'user-1' }),
  };

  describe('GET /api/users/[id]', () => {
    it('debería devolver un usuario existente', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Juan Pérez',
        email: 'juan@test.com',
        role: 'DEVELOPER',
        bio: 'Desarrollador fullstack',
        projects: [],
        developedProjects: [],
        reviewsReceived: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await GET({} as Request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        include: {
          projects: true,
          developedProjects: true,
          reviewsReceived: true,
        },
      });
    });

    it('debería devolver 404 si usuario no existe', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET({} as Request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Usuario no encontrado' });
    });

    it('debería manejar errores de base de datos', async () => {
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const response = await GET({} as Request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Error al obtener usuario' });
    });
  });

  describe('PATCH /api/users/[id]', () => {
    it('debería actualizar usuario correctamente', async () => {
      const updatedUser = {
        id: 'user-1',
        name: 'Juan Actualizado',
        bio: 'Nueva bio',
        role: 'CLIENT',
        certificates: 'Certificado 1',
      };

      (prisma.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const request = new Request('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({
          name: 'Juan Actualizado',
          bio: 'Nueva bio',
          role: 'CLIENT',
          certificates: 'Certificado 1',
        }),
      });

      const response = await PATCH(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedUser);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          name: 'Juan Actualizado',
          bio: 'Nueva bio',
          role: 'CLIENT',
          certificates: 'Certificado 1',
        },
      });
    });

    it('debería manejar errores al actualizar', async () => {
      (prisma.user.update as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const request = new Request('http://localhost/api/users/user-1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await PATCH(request, mockContext);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Error al actualizar usuario' });
    });
  });
});