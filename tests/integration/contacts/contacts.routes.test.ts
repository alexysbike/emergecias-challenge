import request from "supertest";
import { setupTestDb } from "../../helpers/test-db";
import { createTestApp } from "../../helpers/test-app";

describe("Contacts routes", () => {
  let dbPath: string;
  let cleanup: () => void;
  let app: Awaited<ReturnType<typeof createTestApp>>;

  beforeAll(async () => {
    const testDb = await setupTestDb();
    dbPath = testDb.dbPath;
    cleanup = testDb.cleanup;
    app = await createTestApp(dbPath);
  });

  afterAll(() => {
    cleanup();
  });

  it("GET /health returns ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("POST /contacts creates a contact", async () => {
    const response = await request(app)
      .post("/contacts")
      .send({
        firstName: "Ana",
        lastName: "García",
        email: "ana@example.com",
        dateOfBirth: "1990-05-15",
        phones: [{ number: "+5491112345678", phoneTypeId: 1 }],
        addresses: [
          {
            locality: "Buenos Aires",
            street: "Av. Corrientes",
            number: 1234,
            notes: "Floor 3",
          },
        ],
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      firstName: "Ana",
      lastName: "García",
      email: "ana@example.com",
      dateOfBirth: "1990-05-15",
    });
    expect(response.body.phones).toHaveLength(1);
    expect(response.body.addresses).toHaveLength(1);
  });

  it("GET /contacts lists contacts with pagination", async () => {
    const response = await request(app).get("/contacts?page=1&limit=20");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: expect.any(Array),
      pagination: {
        page: 1,
        limit: 20,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      },
    });
  });

  it("GET /contacts?email= searches by email", async () => {
    const response = await request(app).get("/contacts?email=ana@example.com");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it("returns 409 for duplicate email", async () => {
    const response = await request(app).post("/contacts").send({
      firstName: "Other",
      lastName: "Person",
      email: "ana@example.com",
      dateOfBirth: "1985-01-01",
    });

    expect(response.status).toBe(409);
    expect(response.body.code).toBe("CONFLICT");
  });

  it("GET /contacts/:id returns contact by id", async () => {
    const created = await request(app).post("/contacts").send({
      firstName: "Bob",
      lastName: "Smith",
      email: "bob@example.com",
      dateOfBirth: "1988-03-20",
    });

    const response = await request(app).get(`/contacts/${created.body.id}`);
    expect(response.status).toBe(200);
    expect(response.body.email).toBe("bob@example.com");
  });

  it("PATCH /contacts/:id updates personal data", async () => {
    const created = await request(app).post("/contacts").send({
      firstName: "Carla",
      lastName: "Lopez",
      email: "carla@example.com",
      dateOfBirth: "1992-07-10",
    });

    const response = await request(app)
      .patch(`/contacts/${created.body.id}`)
      .send({ firstName: "Carolina" });

    expect(response.status).toBe(200);
    expect(response.body.firstName).toBe("Carolina");
  });

  it("DELETE /contacts/:id removes contact", async () => {
    const created = await request(app).post("/contacts").send({
      firstName: "Delete",
      lastName: "Me",
      email: "delete@example.com",
      dateOfBirth: "1990-01-01",
    });

    const deleteResponse = await request(app).delete(`/contacts/${created.body.id}`);
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(`/contacts/${created.body.id}`);
    expect(getResponse.status).toBe(404);
  });

  it("POST /contacts/:id/activities creates activity", async () => {
    const contact = await request(app).post("/contacts").send({
      firstName: "Activity",
      lastName: "Owner",
      email: "activity@example.com",
      dateOfBirth: "1990-01-01",
    });

    const response = await request(app).post(`/contacts/${contact.body.id}/activities`).send({
      activityType: "call",
      activityDate: "2026-06-26T10:30:00.000Z",
      description: "Follow-up call",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      activityType: "call",
      description: "Follow-up call",
    });
  });

  it("GET /contacts/:id/activities lists activities", async () => {
    const contact = await request(app).post("/contacts").send({
      firstName: "List",
      lastName: "Activities",
      email: "list-activities@example.com",
      dateOfBirth: "1990-01-01",
    });

    await request(app).post(`/contacts/${contact.body.id}/activities`).send({
      activityType: "email",
      activityDate: "2026-06-20T14:00:00.000Z",
      description: "Proposal sent",
    });

    const response = await request(app).get(`/contacts/${contact.body.id}/activities`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].contact.email).toBe("list-activities@example.com");
  });
});
