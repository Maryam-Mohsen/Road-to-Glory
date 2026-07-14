# Road to Glory

Road to Glory is a backend platform built for the Egyptian Football Association to manage official World Cup events — Fan Zones, public match screenings, volunteer programs, press conferences, community activities, and celebration events.

It handles the full event lifecycle: creating events, reserving tickets, checking in attendees, collecting feedback, and generating reports — through a secure REST API consumed by the included web frontend (and, later, mobile/desktop apps).

## User Roles

- **Attendee** — browses events, reserves tickets, gets a digital ticket, attends, and leaves feedback.
- **Organizer** — creates and manages their own events. New organizer accounts start as `pending` and **must be approved by an admin** before they can create or edit events.
- **Admin** — approves/rejects organizer accounts, approves/rejects events, manages users (activate/deactivate/delete), and monitors the whole platform.

### Registration
Sign-up only asks for **name, email, password**, and a role picker ("I am a...": Attendee or Organizer). There's no username field at registration — `username` exists in the schema but isn't set during sign-up.

## Core Modules

1. **Auth & User Management** — registration, login, JWT-based auth, role-based access, profile updates, organizer verification.
2. **Event Management** — organizers create events with a category, location, date, and capacity; every new event starts as `pending` and needs admin approval to go live.
3. **Ticket Reservation** — reserve seats with capacity limits and duplicate-booking prevention; each confirmed reservation gets a unique digital ticket code.
4. **Attendance Management** — intended to validate tickets at entry and record check-ins (see [Known Limitations](#known-limitations)).
5. **Reviews & Feedback** — attendees rate (1–5) and comment on events, one entry per user per event.
6. **Reporting & Analytics** — platform-wide stats for admins; per-event stats (reservations, checked-in count, attendance rate, average rating) for organizers/admins.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Frontend:** Plain HTML/CSS/JS, served as static files by the same Express server

## Getting Started

```bash
cd backend
npm install
npm run seed:admins   # optional: create an initial admin
npm run dev
```

Open `http://localhost:5000` (or your configured `PORT`) — the frontend is served from the same server.

## Organizer Approval Flow

1. A user registers and picks "Organizer" → account is created with `organizerStatus: pending`.
2. If they try to create or edit an event, the API blocks it (`403 – Your organizer account is not approved yet.`).
3. An admin opens the **Dashboard → Users** table, finds the pending organizer, and clicks **Approve** (or **Reject**).
4. Once approved, the organizer can create and manage events normally.

