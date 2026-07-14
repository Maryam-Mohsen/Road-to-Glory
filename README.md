# Road to Glory ⚽

**Road to Glory** is a centralized backend platform built for the Egyptian Football Association to manage every official event around Egypt's first-ever FIFA World Cup Round of 16 run — Fan Zones, public match screenings, volunteer programs, press conferences, community activities, and celebration events.

It exposes a secure REST API covering the full event lifecycle — creating an event, reserving a ticket, checking attendees in at the door, collecting feedback, and generating performance reports — with a lightweight web frontend consuming that API end to end.

## User Roles

- **Attendee** — registers, browses approved events, reserves tickets, gets a digital ticket code, views reservation history, cancels a reservation, leaves feedback after attending, and receives notifications.
- **Organizer** — creates and manages their own events (only once approved by an admin), views registrations & attendance for their events, checks attendees in, and views per-event performance reports.
- **Admin** — approves/rejects organizer applications and events, manages users (activate/deactivate/delete), views platform-wide analytics, and reviews the full audit log.

## Features

1. **Authentication & User Management** — secure register/login (JWT + bcrypt), role-based access, profile updates, organizer verification (`pending` → `approved`/`rejected`) that gates all event-management actions.
2. **Event Management** — organizers create events (title, description, category, location, date, capacity); every new event needs admin approval before it's public; editing a live event resets it to `pending` to keep information consistent.
3. **Ticket Reservation** — atomic capacity checks prevent overselling, duplicate reservations are blocked, and every confirmed reservation gets a unique digital ticket code.
4. **Attendance Management** — organizers/admins validate ticket codes at the door; a ticket can only be checked in once, with a full record of who checked in whom and when.
5. **Reviews & Feedback** — attendees rate (1–5) and comment on events, but only if they have a genuine attendance record; one review per user per event.
6. **Reporting & Analytics** — platform-wide stats for admins (users, events, reservations, check-ins, top events) and per-event stats for organizers/admins (attendance rate, average rating, etc.).
7. **Notifications** — attendees are automatically notified when an event they've reserved is updated or deleted.
8. **Audit Log** — every sensitive admin action (organizer/event approvals, user activation, deletions) is logged with a timestamp and description for traceability.

## Business Rules Enforced

- Events can never be reserved past capacity.
- Users can only perform actions permitted by their role.
- Event information stays consistent throughout its lifecycle.
- Reservations are validated (approval, capacity, no duplicates) before confirmation.
- Attendance reflects real, single-use ticket scans.
- Feedback requires genuine event participation.
- Administrative actions are logged and auditable.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** Plain HTML/CSS/JS, served as static files by the same Express server

## Getting Started

```bash
cd backend
npm install
npm run seed:admins   # optional: creates initial admin accounts
npm run dev
```

Open `http://localhost:5000` (or your configured `PORT`) — the frontend is served from the same server.

Requires a `.env` file in `backend/` with `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` (optional, defaults to `7d`), and `PORT` (optional, defaults to `5000`).

