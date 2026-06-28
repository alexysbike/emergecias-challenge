import type { ActivityRepository } from "../../../../src/domain/repositories/activity.repository";
import { CreateActivityUseCase } from "../../../../src/application/activities/create-activity.use-case";
import { NotFoundError } from "../../../../src/shared/errors/not-found.error";

describe("CreateActivityUseCase", () => {
  const input = {
    personId: 1,
    activityType: "call" as const,
    activityDate: "2026-06-26T10:30:00.000Z",
    description: "Follow-up call",
  };

  it("throws NotFoundError when contact does not exist", async () => {
    const repository: ActivityRepository = {
      contactExists: jest.fn().mockResolvedValue(false),
      create: jest.fn(),
      list: jest.fn(),
    };

    const useCase = new CreateActivityUseCase(repository);

    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
