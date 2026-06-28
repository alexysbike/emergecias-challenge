import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { CreateAddressUseCase } from "../../../application/addresses/create-address.use-case";
import { idParamSchema } from "../../validators/common.schemas";
import { createAddressSchema } from "../../validators/address.schemas";
import { toAddressResponse } from "../../mappers/address.mapper";

export class CreateAddressRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.POST];

  constructor(private readonly useCase: CreateAddressUseCase) {
    super();
  }

  protected async post(req: HttpRequest) {
    const { id } = idParamSchema.parse(req.params);
    const input = createAddressSchema.parse(req.body);
    const address = await this.useCase.execute({
      personId: id,
      ...input,
    });
    return toAddressResponse(address);
  }
}
