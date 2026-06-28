import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  activityWithContactResponseSchema,
  createActivitySchema,
  createdActivityResponseSchema,
} from "../validators/activity.schemas";
import {
  contactResponseSchema,
  createContactSchema,
  listContactsQuerySchema,
  paginatedContactsResponseSchema,
  updateContactSchema,
} from "../validators/contact.schemas";
import {
  errorResponseSchema,
  addressParamsSchema,
  idParamSchema,
  phoneParamsSchema,
} from "../validators/common.schemas";
import {
  addressResponseSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validators/address.schemas";
import {
  createPhoneSchema,
  phoneResponseSchema,
  updatePhoneSchema,
} from "../validators/phone.schemas";

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: {
    200: {
      description: "Service health status",
      content: {
        "application/json": {
          schema: z.object({ status: z.literal("ok") }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/contacts",
  tags: ["Contacts"],
  request: {
    body: {
      content: { "application/json": { schema: createContactSchema } },
    },
  },
  responses: {
    201: {
      description: "Contact created",
      content: { "application/json": { schema: contactResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Duplicate email",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/contacts",
  tags: ["Contacts"],
  request: { query: listContactsQuerySchema },
  responses: {
    200: {
      description: "Paginated contacts list",
      content: { "application/json": { schema: paginatedContactsResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/contacts/{id}",
  tags: ["Contacts"],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Contact details",
      content: { "application/json": { schema: contactResponseSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/contacts/{id}",
  tags: ["Contacts"],
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: updateContactSchema } } },
  },
  responses: {
    200: {
      description: "Contact updated",
      content: { "application/json": { schema: contactResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    409: {
      description: "Duplicate email",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/contacts/{id}",
  tags: ["Contacts"],
  request: { params: idParamSchema },
  responses: {
    204: { description: "Contact deleted" },
    404: {
      description: "Not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/contacts/{id}/activities",
  tags: ["Activities"],
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: createActivitySchema } } },
  },
  responses: {
    201: {
      description: "Activity created",
      content: { "application/json": { schema: createdActivityResponseSchema } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    404: {
      description: "Contact not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/contacts/{id}/activities",
  tags: ["Activities"],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Activities list",
      content: {
        "application/json": {
          schema: z.array(activityWithContactResponseSchema),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: errorResponseSchema } },
    },
    404: {
      description: "Contact not found",
      content: { "application/json": { schema: errorResponseSchema } },
    },
  },
});

const notFoundResponse = {
  description: "Not found",
  content: { "application/json": { schema: errorResponseSchema } },
} as const;

const validationErrorResponse = {
  description: "Validation error",
  content: { "application/json": { schema: errorResponseSchema } },
} as const;

registry.registerPath({
  method: "post",
  path: "/contacts/{id}/phones",
  tags: ["Phones"],
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: createPhoneSchema } } },
  },
  responses: {
    201: {
      description: "Phone created",
      content: { "application/json": { schema: phoneResponseSchema } },
    },
    400: validationErrorResponse,
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "get",
  path: "/contacts/{id}/phones",
  tags: ["Phones"],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Phones list",
      content: { "application/json": { schema: z.array(phoneResponseSchema) } },
    },
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "get",
  path: "/contacts/{id}/phones/{phoneId}",
  tags: ["Phones"],
  request: { params: phoneParamsSchema },
  responses: {
    200: {
      description: "Phone details",
      content: { "application/json": { schema: phoneResponseSchema } },
    },
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "patch",
  path: "/contacts/{id}/phones/{phoneId}",
  tags: ["Phones"],
  request: {
    params: phoneParamsSchema,
    body: { content: { "application/json": { schema: updatePhoneSchema } } },
  },
  responses: {
    200: {
      description: "Phone updated",
      content: { "application/json": { schema: phoneResponseSchema } },
    },
    400: validationErrorResponse,
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "delete",
  path: "/contacts/{id}/phones/{phoneId}",
  tags: ["Phones"],
  request: { params: phoneParamsSchema },
  responses: {
    204: { description: "Phone deleted" },
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "post",
  path: "/contacts/{id}/addresses",
  tags: ["Addresses"],
  request: {
    params: idParamSchema,
    body: { content: { "application/json": { schema: createAddressSchema } } },
  },
  responses: {
    201: {
      description: "Address created",
      content: { "application/json": { schema: addressResponseSchema } },
    },
    400: validationErrorResponse,
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "get",
  path: "/contacts/{id}/addresses",
  tags: ["Addresses"],
  request: { params: idParamSchema },
  responses: {
    200: {
      description: "Addresses list",
      content: { "application/json": { schema: z.array(addressResponseSchema) } },
    },
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "get",
  path: "/contacts/{id}/addresses/{addressId}",
  tags: ["Addresses"],
  request: { params: addressParamsSchema },
  responses: {
    200: {
      description: "Address details",
      content: { "application/json": { schema: addressResponseSchema } },
    },
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "patch",
  path: "/contacts/{id}/addresses/{addressId}",
  tags: ["Addresses"],
  request: {
    params: addressParamsSchema,
    body: { content: { "application/json": { schema: updateAddressSchema } } },
  },
  responses: {
    200: {
      description: "Address updated",
      content: { "application/json": { schema: addressResponseSchema } },
    },
    400: validationErrorResponse,
    404: notFoundResponse,
  },
});

registry.registerPath({
  method: "delete",
  path: "/contacts/{id}/addresses/{addressId}",
  tags: ["Addresses"],
  request: { params: addressParamsSchema },
  responses: {
    204: { description: "Address deleted" },
    404: notFoundResponse,
  },
});

export function generateOpenApiDocument(port: number) {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "Emergencias Challenge API",
      version: "1.0.0",
    },
    servers: [{ url: `http://localhost:${port}` }],
  });
}
