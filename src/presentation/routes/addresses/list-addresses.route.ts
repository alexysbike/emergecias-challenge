import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { ListAddressesUseCase } from "../../../application/addresses/list-addresses.use-case";
import { idParamSchema } from "../../validators/common.schemas";
import { toAddressResponse } from "../../mappers/address.mapper";

export class ListAddressesRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: ListAddressesUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const { id } = idParamSchema.parse(req.params);
    const addresses = await this.useCase.execute(id);
    return addresses.map(toAddressResponse);
  }
}
