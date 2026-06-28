import type { AppModule, ModuleContext } from "../../composition/module-context";
import { CreateAddressUseCase } from "../../application/addresses/create-address.use-case";
import { ListAddressesUseCase } from "../../application/addresses/list-addresses.use-case";
import { GetAddressUseCase } from "../../application/addresses/get-address.use-case";
import { UpdateAddressUseCase } from "../../application/addresses/update-address.use-case";
import { DeleteAddressUseCase } from "../../application/addresses/delete-address.use-case";
import { DrizzleAddressRepository } from "../../infrastructure/repositories/drizzle-address.repository";
import { AddressesRouter } from "../../presentation/routes/addresses/addresses.router";

export function createAddressModule(ctx: ModuleContext): AppModule {
  const repository = new DrizzleAddressRepository(ctx.db);

  const deps = {
    createAddress: new CreateAddressUseCase(repository),
    listAddresses: new ListAddressesUseCase(repository),
    getAddress: new GetAddressUseCase(repository),
    updateAddress: new UpdateAddressUseCase(repository),
    deleteAddress: new DeleteAddressUseCase(repository),
  };

  return {
    name: "addresses",
    nested: {
      addresses: AddressesRouter.create(deps),
    },
  };
}
