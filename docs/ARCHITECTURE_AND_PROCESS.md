# System Architecture and Process Overview

## Process: Priority-Based Appointment Scheduling & Conflict Monitoring

The system process for the proposed Priority-Based Appointment Scheduling and Conflict Monitoring System with Web-Based Inquiry for LFC Firm begins when a client submits an inquiry or appointment request through the web interface. The workflow proceeds as follows:

- The client submits an appointment inquiry containing preferred time windows, consultation type, and optional supporting documents.
- The system checks lawyer availability for the requested time windows and suggested lawyers.
- The appointment is classified by priority (e.g., urgent, moderate, regular) based on consultation type, deadlines, and client-provided indicators.
- The system performs conflict checking to detect overlapping schedules, double-bookings, or other constraints that would prevent confirmation.
- If conflicts are detected, the system returns suggestions (alternative slots or staff-assisted scheduling) and notifies relevant staff and lawyers.
- If the schedule is clear, the appointment is confirmed and stored, with notifications sent to the client, assigned lawyer, and staff as configured.

This process helps make scheduling more organized, efficient, and easier to monitor compared to manual processes.

## Proposed System Architecture

The proposed architecture for the Priority-Based Appointment Scheduling and Conflict Monitoring System with Web-Based Inquiry for LFC Firm is a web-based platform comprising client-facing and role-based dashboards for Clients, Staff, Lawyers, and Administrators. Key components include:

- A React + Vite frontend that provides the public inquiry form and role-based dashboards for managing appointments, priorities, conflict detection feedback, and notifications.
- An Express.js API that exposes endpoints for appointment creation, conflict-checking, availability queries, notifications, and analytics.
- A relational database (MySQL/MariaDB or PostgreSQL) managed with Prisma ORM that stores users, roles, lawyers, schedules, availability windows, appointments, conflict scans, notifications, and audit logs.
- Authentication and authorization layers (JWT access + refresh tokens, cookies, CSRF protection, and role-based access control) to secure operations.
- Background services and notifications to deliver email/SMS/web notifications, and to run periodic analytics and conflict scans if required.

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

This system implements a priority-driven appointment workflow with automated conflict detection. When a client submits an inquiry, the platform classifies the request by urgency, checks lawyer availability, runs a conflict scan against existing schedules, and then either suggests alternatives or confirms the booking. Role-based dashboards present prioritized queues, conflict alerts, and scheduling controls to staff and lawyers while administrative dashboards provide oversight, settings, and analytics.
