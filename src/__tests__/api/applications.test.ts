import { POST } from '@/app/api/applications/route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    application: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  },
}));

describe('Applications API', () => {
  describe('POST /api/applications', () => {
    it('debería crear una postulación correctamente', async () => {
      const mockApplication = {
        id: 'app-1',
        projectId: 'proj-1',
        developerId: 'dev-1',
        reason: 'Quiero este proyecto',
        project: {
          id: 'proj-1',
          title: 'Proyecto Test',
          clientId: 'client-1',
        },
        developer: {
          name: 'Desarrollador Test',
        },
      };

      (prisma.application.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.application.create as jest.Mock).mockResolvedValue(mockApplication);
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          projectId: 'proj-1',
          developerId: 'dev-1',
          reason: 'Quiero este proyecto',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockApplication);
    });

    it('debería rechazar si ya existe una postulación', async () => {
      const existingApplication = {
        id: 'app-1',
        projectId: 'proj-1',
        developerId: 'dev-1',
      };

      (prisma.application.findFirst as jest.Mock).mockResolvedValue(existingApplication);

      const request = new NextRequest('http://localhost/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          projectId: 'proj-1',
          developerId: 'dev-1',
          reason: 'Quiero este proyecto',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Ya te has postulado a este proyecto' });
    });

    it('debería crear notificación al dueño del proyecto', async () => {
      const mockApplication = {
        id: 'app-1',
        projectId: 'proj-1',
        developerId: 'dev-1',
        reason: 'Quiero este proyecto',
        project: {
          id: 'proj-1',
          title: 'Proyecto Test',
          clientId: 'client-1',
        },
        developer: {
          name: 'Desarrollador Test',
        },
      };

      (prisma.application.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.application.create as jest.Mock).mockResolvedValue(mockApplication);
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      const request = new NextRequest('http://localhost/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          projectId: 'proj-1',
          developerId: 'dev-1',
          reason: 'Quiero este proyecto',
        }),
      });

      await POST(request);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'client-1',
          type: 'APPLICATION',
          message: expect.stringContaining('se ha postulado a tu proyecto'),
          link: '/projects/proj-1',
        },
      });
    });
  });
});