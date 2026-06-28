import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { GetAddressUseCase } from "../../../application/addresses/get-address.use-case";
import { addressParamsSchema } from "../../validators/common.schemas";
import { toAddressResponse } from "../../mappers/address.mapper";

export class GetAddressRoute extends HttpRoute {
  readonly path = "/:addressId";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: GetAddressUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const { id, addressId } = addressParamsSchema.parse(req.params);
    const address = await this.useCase.execute(id, addressId);
    return toAddressResponse(address);
  }
}
