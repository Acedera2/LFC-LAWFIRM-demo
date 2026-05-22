Client Duties and Features

The Client is the end-user who requests legal consultations and appointments.

Client Responsibilities
- Submit appointment inquiries
- Request consultation appointments
- Select appointment date
- Select preferred lawyer
- Choose appointment priority: Urgent / Moderate / Regular
- View lawyer availability
- View appointment status
- Receive notifications and reminders
- Request appointment cancellation
- View appointment history

Client Permissions
Allowed:
- Create appointment request
- Cancel own appointment request
- View own schedules
- Edit limited profile information

Not Allowed:
- Approve appointments
- Manage lawyer schedules
- Access other client records
- Modify system settings

Staff Duties and Features
- Monitor appointment requests
- Review pending appointments
- Coordinate schedules with lawyers
- Approve or reject appointments
- Reschedule appointments if needed
- Monitor lawyer availability
- Handle cancellation requests
- Detect and manage scheduling conflicts
- Maintain appointment records
- Monitor recurring schedules
- Assist client inquiries

Staff Permissions
Allowed:
- Manage appointments
- Update appointment schedules
- View client records
- View lawyer schedules
- Receive conflict alerts
- Use centralized calendar

Not Allowed:
- Manage system settings
- Create admin accounts
- Access full analytics controls

Lawyer Duties and Features
- View assigned appointments
- Manage personal availability
- Accept consultation schedules
- Monitor daily appointment schedule
- Receive appointment notifications
- View appointment history
- Monitor workload

Lawyer Permissions
Allowed:
- View assigned clients
- Update availability status
- View own schedule
- Receive notifications

Not Allowed:
- Approve system users
- Modify other lawyers’ schedules
- Access admin settings
- Manage analytics system-wide

Admin Duties and Features
- Manage all users: Clients, Staff, Lawyers
- Monitor all appointments
- Manage lawyer records
- Manage legal services
- Monitor scheduling conflicts
- Oversee centralized calendar
- Manage notifications
- Generate reports
- Monitor system activities
- Manage role-based access
- Configure system settings

Admin Permissions
Allowed:
- Full CRUD operations
- Full appointment access
- User management
- Conflict monitoring
- Dashboard monitoring
- Access reports
- System configuration

Not Allowed:
- Direct legal consultation handling unless assigned as lawyer

Suggested Role Access Matrix (summary)

Feature | Client | Staff | Lawyer | Admin
---|---:|---:|---:|---:
Request Appointment | ✔ | ✖ | ✖ | ✔
Approve Appointment | ✖ | ✔ | ✖ | ✔
Manage Availability | ✖ | ✔ | ✔ | ✔
View Calendar | Limited | ✔ | ✔ | ✔
Conflict Monitoring | ✖ | ✔ | Limited | ✔
User Management | ✖ | ✖ | ✖ | ✔
Reports | ✖ | Limited | Limited | ✔
Notifications | ✔ | ✔ | ✔ | ✔
Cancellation Request | ✔ | ✔ | ✖ | ✔
System Settings | ✖ | ✖ | ✖ | ✔

Notes
- The server enforces RBAC via `authenticate` and `authorize` middleware in `server/src/middleware/auth.js`.
- Appointment ownership checks are implemented in `server/src/controllers/appointmentController.js` via `assertAppointmentAccess`.
- Administrative status updates (approve/reject) are restricted to Staff and Admin; Lawyers may `accept` assigned appointments via `/api/appointments/:id/accept`.
