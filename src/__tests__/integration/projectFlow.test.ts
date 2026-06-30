import { prisma } from '@/lib/prisma';
import { POST as createProject } from '@/app/api/projects/route';
import { POST as applyProject } from '@/app/api/applications/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    application: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  },
}));

describe('Integration Tests: Project Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería permitir crear proyecto y aplicar a él', async () => {
    const mockProject = {
      id: 'proj-1',
      title: 'Proyecto Nuevo',
      description: 'Descripción',
      budget: 1000,
      duration: '1 semana',
      category: 'Web',
      technologies: 'React',
      type: 'UNITARY',
      status: 'OPEN',
      clientId: 'client-1',
    };

    const mockApplication = {
      id: 'app-1',
      projectId: 'proj-1',
      developerId: 'dev-1',
      reason: 'Quiero trabajar en este proyecto',
      project: {
        ...mockProject,
        clientId: 'client-1',
      },
      developer: {
        name: 'Dev Test',
      },
    };

    (prisma.project.create as jest.Mock).mockResolvedValue(mockProject);
    (prisma.application.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.application.create as jest.Mock).mockResolvedValue(mockApplication);
    (prisma.notification.create as jest.Mock).mockResolvedValue({});

    // Crear proyecto
    const createReq = new NextRequest('http://localhost/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Proyecto Nuevo',
        description: 'Descripción',
        budget: '1000',
        duration: '1 semana',
        clientId: 'client-1',
      }),
    });

    const createResponse = await createProject(createReq);
    expect(createResponse.status).toBe(200);

    // Aplicar al proyecto
    const applyReq = new NextRequest('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-1',
        developerId: 'dev-1',
        reason: 'Quiero trabajar en este proyecto',
      }),
    });

    const applyResponse = await applyProject(applyReq);
    expect(applyResponse.status).toBe(200);

    // Verificar notificación creada
    expect(prisma.notification.create).toHaveBeenCalled();
  });

  it('debería prevenir aplicación duplicada', async () => {
    const existingApp = {
      id: 'app-1',
      projectId: 'proj-1',
      developerId: 'dev-1',
    };

    (prisma.application.findFirst as jest.Mock).mockResolvedValue(existingApp);

    const applyReq = new NextRequest('http://localhost/api/applications', {
      method: 'POST',
      body: JSON.stringify({
        projectId: 'proj-1',
        developerId: 'dev-1',
        reason: 'Quiero aplicar',
      }),
    });

    const response = await applyProject(applyReq);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Ya te has postulado a este proyecto');
  });
});