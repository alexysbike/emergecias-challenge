import { HttpRouter } from "../../../infrastructure/http/http-router";
import type { CreateAddressUseCase } from "../../../application/addresses/create-address.use-case";
import type { ListAddressesUseCase } from "../../../application/addresses/list-addresses.use-case";
import type { GetAddressUseCase } from "../../../application/addresses/get-address.use-case";
import type { UpdateAddressUseCase } from "../../../application/addresses/update-address.use-case";
import type { DeleteAddressUseCase } from "../../../application/addresses/delete-address.use-case";
import { CreateAddressRoute } from "./create-address.route";
import { ListAddressesRoute } from "./list-addresses.route";
import { GetAddressRoute } from "./get-address.route";
import { UpdateAddressRoute } from "./update-address.route";
import { DeleteAddressRoute } from "./delete-address.route";

export interface AddressDeps {
  createAddress: CreateAddressUseCase;
  listAddresses: ListAddressesUseCase;
  getAddress: GetAddressUseCase;
  updateAddress: UpdateAddressUseCase;
  deleteAddress: DeleteAddressUseCase;
}

export class AddressesRouter extends HttpRouter {
  readonly path = "/:id/addresses";

  static create(deps: AddressDeps): AddressesRouter {
    return new AddressesRouter().register(
      new CreateAddressRoute(deps.createAddress),
      new ListAddressesRoute(deps.listAddresses),
      new GetAddressRoute(deps.getAddress),
      new UpdateAddressRoute(deps.updateAddress),
      new DeleteAddressRoute(deps.deleteAddress)
    );
  }
}
