import request from 'supertest';
import { app } from '../src/index';
import { closeDb, initDb } from '../src/lib/db';

beforeAll(() => {
  initDb(process.env.DATABASE_URL!);
});

describe('/notes CRUD', () => {
  let token: string;
  let noteId: string;

  beforeAll(() => {
    token = 'dev-token';
  });

  afterAll(async () => {
    await closeDb()
  })

  it('POST /notes → 201 & returns the new note', async () => {
    const res = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test', content: 'Hello', tags: ['a'] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    noteId = res.body.id;
    expect(res.body).toHaveProperty('id');
  });

  it('GET /notes → 200 & array containing at least one note', async () => {
    const res = await request(app)
      .get('/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

    it('GET /notes?tag=a → 200 & array containing at least one note', async () => {
        const res = await request(app)
        .get('/notes?tag=a')
        .set('Authorization', `Bearer ${token}`);
    
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('GET /notes/:id → 200 & returns the single note', async () => {
    const res = await request(app)
      .get(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: noteId,
      title: 'Test',
      content: 'Hello',
      tags: ['a'],
    });
  });

  it('PUT /notes/:id → 200 & updates the note', async () => {
    const res = await request(app)
      .put(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Title',
        content: 'Updated content',
        tags: ['bar', 'baz'],
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: noteId,
      title: 'Updated Title',
      content: 'Updated content',
      tags: ['bar', 'baz'],
    });
  });

  it('DELETE /notes/:id → 204 & actually deletes', async () => {
    const del = await request(app)
      .delete(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(del.status).toBe(204);

    const after = await request(app)
      .get(`/notes/${noteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(after.status).toBe(404);
  });

});
