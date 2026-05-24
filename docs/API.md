# API Documentation

Base URL:

```text
http://localhost:5000/api
```

Authentication uses session cookies with CSRF protection. Mutating requests must include the CSRF token from the `lfc_csrf` cookie in the `X-CSRF-Token` header.

## Scope Limits

This API intentionally excludes AI automation, machine learning, payment gateways, court case management, video conferencing, mobile apps, and external government integrations. It focuses on web inquiry, appointment scheduling, lawyer availability, rule-based conflict monitoring, historical analysis, notifications, and role-based access.

## Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/auth/csrf` | Public | Issue CSRF cookie |
| POST | `/auth/register` | Public | Create a client account |
| POST | `/auth/login` | Public | Login and set secure auth cookies |
| POST | `/auth/refresh` | Public with refresh cookie | Rotate refresh token and renew session |
| POST | `/auth/logout` | Public with CSRF | Revoke refresh token and clear cookies |
| GET | `/auth/me` | Authenticated | Return current user |

## Lawyers and Availability

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/lawyers` | Public | List lawyer profiles |
| GET | `/lawyers/:id/availability` | Client, Lawyer, Staff, Admin | View recurring schedules and availability blocks |
| GET | `/schedules` | Lawyer, Staff, Admin | View schedule windows |
| POST | `/schedules` | Lawyer, Staff, Admin | Create or update recurring availability |
| GET | `/schedules/availability` | Lawyer, Staff, Admin | List dated availability blocks |
| POST | `/schedules/availability` | Lawyer, Staff, Admin | Create availability, unavailable, or reserved block |

## Appointments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/appointments` | Authenticated | Paginated appointment list scoped by role |
| POST | `/appointments/conflict-check` | Client, Staff, Admin | Run rule-based conflict scan and get alternative schedules |
| POST | `/appointments` | Client, Staff, Admin | Create appointment inquiry |
| GET | `/appointments/:id` | Authenticated | Appointment detail and timeline |
| PATCH | `/appointments/:id/status` | Lawyer, Staff, Admin | Approve, reject, schedule, or complete |
| PATCH | `/appointments/:id/reschedule` | Client, Staff, Admin | Request a new schedule |
| DELETE | `/appointments/:id` | Client, Staff, Admin | Cancel appointment |
| GET | `/appointments/:id/receipt` | Authenticated | Download PDF appointment receipt |
| POST | `/appointments/:appointmentId/documents` | Not used | Document upload is intentionally removed from the client inquiry workflow |

Query options include `page`, `limit`, `search`, `status`, `priority`, `lawyerId`, `sortBy`, and `sortOrder`.

## Priority Rules

Urgent Priority:

- Emergency consultations
- Court deadlines
- Urgent legal filings

Moderate Priority:

- Ongoing legal processing
- Scheduled follow-ups

Regular Priority:

- General consultations
- Non-urgent concerns

## Appointment Create Example

```json
{
  "lawyerId": "clw_example_lawyer_id",
  "consultationType": "Court deadline preparation",
  "priority": "URGENT",
  "subject": "Urgent filing review",
  "description": "Court deadline is approaching and documents need review.",
  "preferredStart": "2026-05-14T09:00:00.000Z",
  "preferredEnd": "2026-05-14T10:00:00.000Z",
  "locationMode": "IN_PERSON"
}
```

The backend suggests priority by rule, records the selected priority, detects overlaps, unavailable lawyers, excessive workload, recurring conflicts, and duplicate requests, and returns alternative schedule options when conflicts exist.

## Users, Analytics, and Audit

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/users` | Staff, Admin | Paginated user management |
| PATCH | `/users/:id/role` | Admin | Update role or status |
| GET | `/analytics/summary` | Lawyer, Staff, Admin | Workload, conflict, peak-hour, pending, and completed appointment analytics |
| GET | `/analytics/audit-logs` | Admin | System audit logs |
| GET | `/settings` | Admin | List system settings |
| PUT | `/settings` | Admin | Upsert a setting |
