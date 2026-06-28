import type { AppModule, ModuleContext } from "../../composition/module-context";
import { CreatePhoneUseCase } from "../../application/phones/create-phone.use-case";
import { ListPhonesUseCase } from "../../application/phones/list-phones.use-case";
import { GetPhoneUseCase } from "../../application/phones/get-phone.use-case";
import { UpdatePhoneUseCase } from "../../application/phones/update-phone.use-case";
import { DeletePhoneUseCase } from "../../application/phones/delete-phone.use-case";
import { ensurePhoneTypesSeeded } from "../../infrastructure/database/seed/run-seed";
import { DrizzlePhoneRepository } from "../../infrastructure/repositories/drizzle-phone.repository";
import { PhonesRouter } from "../../presentation/routes/phones/phones.router";

export function createPhoneModule(ctx: ModuleContext): AppModule {
  const repository = new DrizzlePhoneRepository(ctx.db);

  const deps = {
    createPhone: new CreatePhoneUseCase(repository),
    listPhones: new ListPhonesUseCase(repository),
    getPhone: new GetPhoneUseCase(repository),
    updatePhone: new UpdatePhoneUseCase(repository),
    deletePhone: new DeletePhoneUseCase(repository),
  };

  return {
    name: "phones",
    nested: {
      phones: PhonesRouter.create(deps),
    },
    onInit: async (moduleCtx) => {
      await ensurePhoneTypesSeeded(moduleCtx.db);
    },
  };
}
