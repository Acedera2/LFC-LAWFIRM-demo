# System Architecture and Process Overview

## Process: Priority-Based Appointment Scheduling & Conflict Monitoring

The system process for the proposed Priority-Based Appointment Scheduling and Conflict Monitoring System with Web-Based Inquiry for LFC Firm begins when a client submits an inquiry or appointment request through the web interface. The workflow proceeds as follows:

- The client submits a web-based inquiry and selects the appointment date first.
- The system checks lawyer availability, existing schedules, historical records, and workload balance.
- The client selects a preferred lawyer based on availability.
- The appointment is classified by priority as Urgent, Moderate, or Regular.
- The system performs conflict checking to detect overlapping schedules, duplicate bookings, recurring conflicts, and lawyer overload.
- If conflicts are detected, the system returns alternatives, notifies staff/admin, and blocks confirmation until the issue is resolved.
- If the schedule is clear, the appointment is confirmed and stored, with notifications sent to the client, assigned lawyer, staff, and administrators as needed.

This process helps make scheduling more organized, efficient, and easier to monitor compared to manual processes.

## Proposed System Architecture

The proposed architecture for the Priority-Based Appointment Scheduling and Conflict Monitoring System with Web-Based Inquiry for LFC Firm is a web-based platform comprising client-facing and role-based dashboards for Clients, Staff, Lawyers, and Administrators. Key components include:

- A React + Tailwind CSS frontend that provides the public inquiry form, landing page, and role-based dashboards for Clients, Staff, Lawyers, and Administrators.
- An Express.js API that exposes endpoints for appointment creation, conflict-checking, availability queries, notifications, analytics, and settings.
- A MySQL relational database managed with Prisma ORM that stores users, roles, lawyers, schedules, availability windows, appointments, conflict logs, notifications, activity logs, and audit history.
- Authentication and authorization layers that use session cookies, CSRF protection, and role-based access control to secure operations.
- Notification services that deliver web alerts and can be extended to email or SMS if required by the firm.

Through this architecture, appointment management becomes faster, more organized, and easier to monitor. Role-specific dashboards let staff and lawyers react to conflicts, while clients get immediate feedback on availability and priority-driven scheduling options.

## Research Statements Included

" presents the system process or workflow of the proposed Priority-Based Appointment Scheduling and Conflict Monitoring System with Web-Based Inquiry for LFC Firm. The process begins when a client submits an inquiry for LFC Firm. The process begins when a client submits an inquiry or appointment request, check lawyer availability, and classify the appointment based on its level of urgency such as urgent, moderate, or regular. After this the system perform conflict checking to identify possible overlapping schedules or double bookings before confirming the appointment scheduling more organized, efficient, and easier to monitor"

"the proposed system architecture of the Priority-Based Appointment Scheduling and Conflict Monitoring System with Web-Based Inquiry for LFC Firm. The proposed system uses a web-based platform where clients, staff,  lawyer , and administrator can access and manage appointment scheduling, priority classification. Conflict detection, and notification features to help prevent overlapping, schedules and improve coordination. Through this architecture, appointment management becomes faster, more organized , and easier to monitor compared to the current manual process.
"

## Diagram

```mermaid
flowchart LR
	Client[Client Browser]
	Staff[Staff Dashboard]
	Lawyer[Lawyer Dashboard]
	Admin[Admin Dashboard]
	Web[Web Frontend (React + Vite)]
	API[API Server (Express + Prisma)]
	DB[(Database: MySQL / PostgreSQL)]
	Notification[Notification Service]

	Client --> Web
	Staff --> Web
	Lawyer --> Web
	Admin --> Web
	Web --> API
	API --> DB
	API --> Notification

	subgraph Background
		Notification -->|Email/SMS| Client
		Notification -->|Email/SMS| Staff
		Notification -->|Email/SMS| Lawyer
	end
```

## Wording refinement

This system implements a priority-driven appointment workflow with automated conflict detection. When a client submits an inquiry, the platform classifies the request by urgency, checks lawyer availability, runs a conflict scan against existing schedules and workload patterns, and then either suggests alternatives or confirms the booking. Role-based dashboards present prioritized queues, conflict alerts, scheduling controls, and analytics to staff, lawyers, and administrators.
