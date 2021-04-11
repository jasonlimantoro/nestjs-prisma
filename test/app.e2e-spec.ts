import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockPrismaService = {
    post: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    app.close();
  });

  describe('PostsController (/posts)', () => {
    it('/ (POST)', async () => {
      const res = await request(app.getHttpServer()).post(`/posts`).send({
        title: 'Post title',
        content: 'Post content',
        authorEmail: 'bob@bob.com',
      });
      expect(res.status).toEqual(201);
      expect(res.body).toEqual(await mockPrismaService.post.create());
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          title: 'Post title',
          content: 'Post content',
          author: {
            connect: {
              email: 'bob@bob.com',
            },
          },
        },
      });
    });
    it('/all/:filter (GET)', async () => {
      const searchFilter = 'hello';
      const res = await request(app.getHttpServer()).get(
        `/posts/all/${searchFilter}`,
      );
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(await mockPrismaService.post.findMany());
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              title: {
                contains: searchFilter,
              },
            },
            {
              content: {
                contains: searchFilter,
              },
            },
          ],
        },
      });
    });
    it('/:id (GET)', async () => {
      const res = await request(app.getHttpServer()).get(`/posts/1`);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(await mockPrismaService.post.findUnique());
      expect(mockPrismaService.post.findUnique).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });

    it('/:id (PATCH)', async () => {
      const res = await request(app.getHttpServer()).patch(`/posts/1`).send({
        title: 'Post title',
        content: 'Post content',
      });
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(await mockPrismaService.post.findUnique());
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          title: 'Post title',
          content: 'Post content',
        },
      });
    });

    it('/:id (DELETE)', async () => {
      const res = await request(app.getHttpServer()).delete(`/posts/1`);
      expect(res.status).toEqual(204);
      expect(res.body).toEqual(await mockPrismaService.post.delete());
      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
      });
    });

    it('/publish/:id (PATCH)', async () => {
      const res = await request(app.getHttpServer()).patch(`/posts/publish/1`);
      expect(res.status).toEqual(200);
      expect(res.body).toEqual(await mockPrismaService.post.findUnique());
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: {
          id: 1,
        },
        data: {
          published: true,
        },
      });
    });
  });
});
