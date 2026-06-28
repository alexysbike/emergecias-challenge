import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { UpdateAddressUseCase } from "../../../application/addresses/update-address.use-case";
import { addressParamsSchema } from "../../validators/common.schemas";
import { updateAddressSchema } from "../../validators/address.schemas";
import { toAddressResponse } from "../../mappers/address.mapper";

export class UpdateAddressRoute extends HttpRoute {
  readonly path = "/:addressId";
  readonly methods = [HttpMethod.PATCH];

  constructor(private readonly useCase: UpdateAddressUseCase) {
    super();
  }

  protected async patch(req: HttpRequest) {
    const { id, addressId } = addressParamsSchema.parse(req.params);
    const input = updateAddressSchema.parse(req.body);
    const address = await this.useCase.execute(id, addressId, input);
    return toAddressResponse(address);
  }
}
