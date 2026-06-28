import type { ContactRepository } from "../../../../src/domain/repositories/contact.repository";
import type { Contact } from "../../../../src/domain/entities/contact";
import { UpdateContactUseCase } from "../../../../src/application/contacts/update-contact.use-case";
import { ConflictError } from "../../../../src/shared/errors/conflict.error";
import { NotFoundError } from "../../../../src/shared/errors/not-found.error";
import { ValidationError } from "../../../../src/shared/errors/validation.error";

function createMockContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: 1,
    firstName: "Ana",
    lastName: "García",
    email: "ana@example.com",
    dateOfBirth: "1990-05-15",
    phones: [],
    addresses: [],
    ...overrides,
  };
}

describe("UpdateContactUseCase", () => {
  it("throws ValidationError when no fields are provided", async () => {
    const repository: ContactRepository = {
      findByEmail: jest.fn(),
      phoneTypeExists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new UpdateContactUseCase(repository);

    await expect(useCase.execute(1, {})).rejects.toThrow(ValidationError);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when contact does not exist", async () => {
    const repository: ContactRepository = {
      findByEmail: jest.fn(),
      phoneTypeExists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new UpdateContactUseCase(repository);

    await expect(useCase.execute(99, { firstName: "Updated" })).rejects.toThrow(NotFoundError);
  });

  it("throws ConflictError when email is taken by another contact", async () => {
    const repository: ContactRepository = {
      findByEmail: jest.fn().mockResolvedValue(createMockContact({ id: 2, email: "taken@example.com" })),
      phoneTypeExists: jest.fn(),
      create: jest.fn(),
      findById: jest.fn().mockResolvedValue(createMockContact()),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const useCase = new UpdateContactUseCase(repository);

    await expect(useCase.execute(1, { email: "taken@example.com" })).rejects.toThrow(ConflictError);
  });
});
