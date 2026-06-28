# Data Models

Contact agenda API. Each contact (`Person`) can have multiple phones, addresses, and activities.

## Technical decisions

| Topic            | Decision |
|------------------|----------|
| Database engine  | SQLite   |
| Date/time format | ISO 8601 strings |
| `dateOfBirth`    | ISO date string: `YYYY-MM-DD` |
| `activityDate`   | ISO datetime string: `YYYY-MM-DDTHH:mm:ss.sssZ` |
| `email`          | UNIQUE constraint at DB level |
| `PhoneType` seed | `Mobile`, `Home`, `Work` |

---

## Entity-Relationship Diagram (summary)

```
Person 1 ── * Phone * ── 1 PhoneType
Person 1 ── * Address
Person 1 ── * ContactActivity
```

---

## Person

Represents a contact in the agenda.

| Column        | DB Type | Constraints              | Notes |
|---------------|---------|--------------------------|-------|
| `id`          | INTEGER | PK, auto-increment       |       |
| `firstName`   | TEXT    | NOT NULL                 |       |
| `lastName`    | TEXT    | NOT NULL                 |       |
| `dateOfBirth` | TEXT    | NOT NULL                 | ISO date string: `YYYY-MM-DD` |
| `email`       | TEXT    | NOT NULL, UNIQUE         | Used for email lookup |

### Business rules

- A contact may have zero or more phones and addresses when created.
- Deleting a contact cascades to its phones, addresses, and activities.
- Personal search on `firstName` and `lastName` uses partial, case-insensitive matching.
- Personal search on `dateOfBirth` uses exact matching.

---

## PhoneType

Reference table for phone types.

| Column     | DB Type | Constraints        | Notes |
|------------|---------|--------------------|-------|
| `id`       | INTEGER | PK, auto-increment |       |
| `typeName` | TEXT    | NOT NULL, UNIQUE   |       |

### Seed data

| `id` | `typeName` |
|------|------------|
| 1    | Mobile     |
| 2    | Home       |
| 3    | Work       |

Seeded on database initialization.

### Business rules

- Phone types are referenced by `Phone.phoneTypeId`.
- Contact search by phone requires both **number** and **type** (matched via `PhoneType.typeName`).

---

## Phone

Phone number associated with a contact.

| Column        | DB Type | Constraints                    | Notes |
|---------------|---------|--------------------------------|-------|
| `id`          | INTEGER | PK, auto-increment             |       |
| `number`      | TEXT    | NOT NULL                       |       |
| `personId`    | INTEGER | FK → Person.id, NOT NULL       | ON DELETE CASCADE |
| `phoneTypeId` | INTEGER | FK → PhoneType.id, NOT NULL    |       |

### Business rules

- A contact can have multiple phones.
- Search by phone requires **number** and **phone type** simultaneously.
- The API may expose `phoneTypeId` and/or the resolved `typeName` from `PhoneType`.

---

## Address

Address associated with a contact.

| Column     | DB Type | Constraints              | Notes |
|------------|---------|--------------------------|-------|
| `id`       | INTEGER | PK, auto-increment       |       |
| `personId` | INTEGER | FK → Person.id, NOT NULL | ON DELETE CASCADE |
| `locality` | TEXT    | NOT NULL                 | City / locality |
| `street`   | TEXT    | NOT NULL                 | Street name |
| `number`   | INTEGER | NOT NULL                 | Street number |
| `notes`    | TEXT    | NULL                     | Optional additional details |

### Business rules

- A contact can have multiple addresses.
- There is no address-based search in the challenge requirements.

---

## ContactActivity

Records activities performed by or about a contact.

| Column         | DB Type | Constraints                                  | Notes |
|----------------|---------|----------------------------------------------|-------|
| `id`           | INTEGER | PK, auto-increment                           |       |
| `personId`     | INTEGER | FK → Person.id, NOT NULL                     | ON DELETE CASCADE |
| `activityType` | VARCHAR | NOT NULL, enum: `call` \| `meeting` \| `email` |     |
| `activityDate` | TEXT    | NOT NULL                                     | ISO datetime string: `YYYY-MM-DDTHH:mm:ss.sssZ` |
| `description`  | TEXT    | NULL                                         | Optional |

### Business rules

- `activityType` only accepts: `call`, `meeting`, `email`.
- `activityDate` is required even when `description` is omitted.
- Activity search filters by contact and type, and includes contact details in the response.

---

## TypeScript types (reference)

```typescript
type ActivityType = "call" | "meeting" | "email";

interface Person {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
}

interface PhoneType {
  id: number;
  typeName: string;
}

interface Phone {
  id: number;
  number: string;
  personId: number;
  phoneTypeId: number;
}

interface PhoneWithType extends Phone {
  phoneType: PhoneType;
}

interface Address {
  id: number;
  personId: number;
  locality: string;
  street: string;
  number: number;
  notes?: string;
}

interface ContactActivity {
  id: number;
  personId: number;
  activityType: ActivityType;
  activityDate: string;
  description?: string;
}

interface Contact extends Person {
  phones: PhoneWithType[];
  addresses: Address[];
}
```

