# API Endpoints

Base URL: `/`

Format: JSON request and response bodies.
Charset: UTF-8.

## Conventions

| Situation                         | Status code |
|-----------------------------------|-------------|
| Resource created                  | `201`       |
| Successful operation with body    | `200`       |
| Successful deletion               | `204`       |
| Invalid body or query params      | `400`       |
| Resource not found                | `404`       |
| Conflict (e.g. duplicate email)   | `409`       |
| Internal error                    | `500`       |

### Error format

```json
{
  "error": "Human-readable error description",
  "code": "VALIDATION_ERROR"
}
```

Suggested codes: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`.

### Empty results

List and search endpoints return **`200`** with an empty `data` array when no matches are found. Do not use `404` for empty search results.

---

## Health check

### `GET /health`

Verifies the service is running.

**Response `200`**

```json
{ "status": "ok" }
```

---

## Contacts

### Contact response shape

All endpoints that return a contact (`POST /contacts`, `GET /contacts/:id`, `PATCH /contacts/:id`, and the nested `contact` object in activity responses) use this shape:

```json
{
  "id": 1,
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com",
  "dateOfBirth": "1990-05-15",
  "phones": [
    {
      "id": 1,
      "number": "+5491112345678",
      "phoneTypeId": 1,
      "phoneType": { "id": 1, "typeName": "Mobile" }
    }
  ],
  "addresses": [
    {
      "id": 1,
      "locality": "Buenos Aires",
      "street": "Av. Corrientes",
      "number": 1234,
      "notes": "Floor 3"
    }
  ]
}
```

### Paginated list response shape

`GET /contacts` returns contacts using this wrapper:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Each item in `data` uses the **contact response shape** above.

#### Pagination query params

| Param   | Required | Default | Notes                    |
|---------|----------|---------|--------------------------|
| `page`  | No       | `1`     | 1-based page number      |
| `limit` | No       | `20`    | Items per page; max `100` |

Pagination params apply to every `GET /contacts` response.

---

### `POST /contacts`

Creates a contact with optional phones and addresses.

**Request body**

```json
{
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com",
  "dateOfBirth": "1990-05-15",
  "phones": [
    { "number": "+5491112345678", "phoneTypeId": 1 }
  ],
  "addresses": [
    {
      "locality": "Buenos Aires",
      "street": "Av. Corrientes",
      "number": 1234,
      "notes": "Floor 3"
    }
  ]
}
```

| Field         | Required | Notes                                                |
|---------------|----------|------------------------------------------------------|
| `firstName`   | Yes      |                                                      |
| `lastName`    | Yes      |                                                      |
| `email`       | Yes      | Valid email format                                   |
| `dateOfBirth` | Yes      | ISO date string: `YYYY-MM-DD`                        |
| `phones`      | No       | Array; each item requires `number` and `phoneTypeId` |
| `addresses`   | No       | Array; see schema in models.md                       |

**Response `201`** — contact response shape (same as `GET /contacts/:id`).

**Errors:** `400` (validation), `409` (duplicate email).

---

### `GET /contacts`

Lists or searches contacts. Behavior depends on query params.

If no search filters are provided, returns **all contacts** paginated (does not error).

Search filter groups are **mutually exclusive**. Sending params from more than one group → `400`.

#### List all (no search filters)

`GET /contacts?page={page}&limit={limit}`

**Response `200`** — paginated list response shape.

#### Search by email

`GET /contacts?email={email}&page={page}&limit={limit}`

| Param   | Required | Notes       |
|---------|----------|-------------|
| `email` | Yes      | Exact match |

**Response `200`** — paginated list response shape (`data` contains 0 or 1 contact).

#### Search by personal data

`GET /contacts?firstName={firstName}&lastName={lastName}&dateOfBirth={dateOfBirth}&page={page}&limit={limit}`

| Param         | Required | Notes                                            |
|---------------|----------|--------------------------------------------------|
| `firstName`   | No*      | Partial match, case-insensitive (`LIKE %value%`) |
| `lastName`    | No*      | Partial match, case-insensitive (`LIKE %value%`) |
| `dateOfBirth` | No*      | Exact match; ISO date string `YYYY-MM-DD`        |

\* At least one of `firstName`, `lastName`, or `dateOfBirth` must be present in this search mode.

Present filters are combined with **AND**. Example: `firstName=An&lastName=Gar` returns contacts whose first name contains "An" **and** whose last name contains "Gar".

**Response `200`** — paginated list response shape.

#### Search by phone number and type

`GET /contacts?phoneNumber={number}&phoneType={typeName}&page={page}&limit={limit}`

| Param         | Required | Notes                                               |
|---------------|----------|-----------------------------------------------------|
| `phoneNumber` | Yes      | Exact match on `Phone.number`                       |
| `phoneType`   | Yes      | Exact match on `PhoneType.typeName` (e.g. `Mobile`) |

If either param is missing → `400`.

**Response `200`** — paginated list response shape (`data` contains 0 or 1 contact).

---

### `GET /contacts/:id`

Returns a contact by ID, including associated phones and addresses.

**Path params**

| Param | Required | Notes      |
|-------|----------|------------|
| `id`  | Yes      | Contact ID |

**Response `200`** — contact response shape.

**Errors:** `404` if the contact does not exist.

---

### `PATCH /contacts/:id`

Updates **personal data** for a contact.

**Request body** (all optional, at least one required):

```json
{
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com",
  "dateOfBirth": "1990-05-15"
}
```

Does not modify phones or addresses.

**Response `200`** — contact response shape.

**Errors:** `400`, `404`, `409` (duplicate email).

---

### `DELETE /contacts/:id`

Deletes a contact and its associated phones, addresses, and activities.

**Response `204`** — no body.

**Errors:** `404`.

---

## Activities

### `POST /contacts/:personId/activities`

Creates an activity for a contact.

**Request body**

```json
{
  "activityType": "call",
  "activityDate": "2026-06-26T10:30:00Z",
  "description": "Follow-up call"
}
```

| Field          | Required | Notes                                           |
|----------------|----------|-------------------------------------------------|
| `activityType` | Yes      | `call` \| `meeting` \| `email`                  |
| `activityDate` | Yes      | ISO datetime string: `YYYY-MM-DDTHH:mm:ss.sssZ` |
| `description`  | No       |                                                 |

**Response `201`** — created activity with `id`.

**Errors:** `400`, `404` (contact not found).

---

### `GET /contacts/:personId/activities`

Returns activities for a contact, with optional filter by type.

`GET /contacts/:personId/activities?activityType={type}`

| Param          | Required | Notes                                         |
|----------------|----------|-----------------------------------------------|
| `activityType` | No       | If provided: `call` \| `meeting` \| `email`   |

If `activityType` is provided but invalid → `400`. If omitted, returns all activities for the contact.

**Response `200`**

```json
[
  {
    "id": 1,
    "activityType": "email",
    "activityDate": "2026-06-20T14:00:00Z",
    "description": "Proposal sent",
    "contact": {
      "id": 1,
      "firstName": "Ana",
      "lastName": "García",
      "email": "ana@example.com",
      "dateOfBirth": "1990-05-15",
      "phones": [
        {
          "id": 1,
          "number": "+5491112345678",
          "phoneTypeId": 1,
          "phoneType": { "id": 1, "typeName": "Mobile" }
        }
      ],
      "addresses": [
        {
          "id": 1,
          "locality": "Buenos Aires",
          "street": "Av. Corrientes",
          "number": 1234,
          "notes": "Floor 3"
        }
      ]
    }
  }
]
```

The `contact` object uses the same shape as the **contact response shape** above.

Returns `200` with `[]` when no activities match.

**Errors:** `400` (invalid `activityType`), `404` (contact not found).

---

## Endpoint summary

| Method   | Route                               | Operation (challenge)              |
|----------|-------------------------------------|------------------------------------|
| `POST`   | `/contacts`                         | Create contact                     |
| `GET`    | `/contacts`                         | List all contacts (paginated)      |
| `GET`    | `/contacts?email=`                  | Search by email                    |
| `GET`    | `/contacts?firstName=&...`          | Search by personal data            |
| `GET`    | `/contacts?phoneNumber=&phoneType=` | Search by phone number and type    |
| `GET`    | `/contacts/:id`                     | Get contact by ID                  |
| `PATCH`  | `/contacts/:id`                     | Update personal data               |
| `DELETE` | `/contacts/:id`                     | Delete contact                     |
| `POST`   | `/contacts/:personId/activities`    | Create activity                    |
| `GET`    | `/contacts/:personId/activities`    | Search activities by contact       |
