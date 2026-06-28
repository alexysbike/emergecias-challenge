import type { AppModule, ModuleContext } from "../../composition/module-context";
import { CreateActivityUseCase } from "../../application/activities/create-activity.use-case";
import { ListActivitiesUseCase } from "../../application/activities/list-activities.use-case";
import { DrizzleActivityRepository } from "../../infrastructure/repositories/drizzle-activity.repository";
import { ActivitiesRouter } from "../../presentation/routes/activities/activities.router";

export function createActivityModule(ctx: ModuleContext): AppModule {
  const repository = new DrizzleActivityRepository(ctx.db);

  const deps = {
    createActivity: new CreateActivityUseCase(repository),
    listActivities: new ListActivitiesUseCase(repository),
  };

  return {
    name: "activities",
    nested: {
      activities: ActivitiesRouter.create(deps),
    },
  };
}
