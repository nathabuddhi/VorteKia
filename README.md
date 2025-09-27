# VorteKia

VorteKia is a **desktop application** built with **React + Tauri**, designed to simulate how a **Theme Park** would use tablets to support every aspect of its operations. The project was developed as part of a **Business Application and Analysis** case study and combines **software engineering** with **system design modeling**.

The app provides different user experiences for **customers, staff, operators, supervisors, and managers**, enabling a realistic simulation of how digital systems can streamline amusement park activities.

---

## 🎢 Features

### User Interfaces

The application consists of **five distinct UIs**, each tailored for different roles:

* **Staff UI** — Staff login, role-based dashboards, and navigation.
* **Customer UI** — Browse restaurants and rides, top up virtual balance, chat with customer service, and receive notifications.
* **Ride UI** — Ride queuing system, balance deduction, real-time shifts, and maintenance-based availability.
* **Restaurant UI** — Menu browsing, search, food ordering, order status (Pending → Cooking → Ready to Serve → Complete).
* **Store UI** — Souvenir browsing, shopping, and checkout.

### Core System Features

* **Role-based access control** (different users have different views and actions).
* **Secure authentication** (hashed + salted passwords, auto-logout for inactive customers).
* **Notification system** (ride readiness, top-up success, lost & found updates, etc.).
* **Real-time group chat** for divisions (Operations, Maintenance, Marketing, etc.).
* **Lost & Found management** (track, update, and notify customers).
* **Ride, restaurant, and store proposals** requiring approvals from executives.
* **Revenue reports** for executives (daily, weekly, monthly).

---

## 🛠️ Tech Stack

* [React](https://react.dev/) — UI framework.
* [Tauri](https://tauri.app/) — Desktop runtime with Rust backend.
* [Rust](https://www.rust-lang.org/) — Secure backend logic and database transactions.
* [Vite](https://vitejs.dev/) — Development bundler.
* [TailwindCSS](https://tailwindcss.com/) — Styling framework.
* **Database** — (Local PostgreQL as per simulation).
* **Cache** — Redis (for performance).

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (>= 18)
* [Rust](https://www.rust-lang.org/tools/install)
* [npm](https://www.npmjs.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vortekia.git
cd vortekia

# Install dependencies
npm install
```

### Development

```bash
# Run development server with Tauri
npm run tauri dev
```

### Build

```bash
# Build desktop app
npm run tauri build
```

---

## 📂 Project Structure

```
VorteKia/
├─ public/
│  └─ images/          # Static assets
├─ src/                # React frontend
│  ├─ components/      # Shared UI components
│  ├─ pages/           # Pages (Staff, Customer, Ride, Restaurant, Store)
│  └─ ...
├─ src-tauri/          # Rust + Tauri backend
├─ .env.example        # Example environment config
├─ package.json        # NPM scripts and dependencies
├─ tailwind.config.js  # Tailwind CSS setup
├─ vite.config.ts      # Vite configuration
├─ tsconfig.json       # TypeScript configuration
└─ README.md
```

---

## 📐 System Design & Diagrams

As part of this project, several **system modeling diagrams** were created to capture complex logic and workflows, including:

* **Use Case Diagram** (overall system actors and interactions)
* **Use Case Descriptions** (detailed scenarios for 8 key flows)
* **Activity Diagrams** (process flows for ride operations, restaurant ordering, etc.)
* **Multi-layer Sequence Diagrams** (with fragments for approval workflows, real-time chat, etc.)
* **Class Diagram** (entities, relationships, attributes, methods)

These diagrams were essential for understanding system behavior and ensuring that the application design followed **Satzinger’s structured design concepts**.

---

## 🎯 Goals

* Demonstrate how tablets could be integrated across theme park operations.
* Provide a single cohesive application covering **customers, staff, rides, restaurants, and stores**.
* Apply **secure, real-world practices** (auth, caching, role-based access).
* Showcase **software engineering design skills** (diagrams + implementation).

---

## 🙌 Acknowledgments

* Built using **React + Tauri** to explore cross-platform desktop development.
* Thanks to Satzinger’s system design principles for guiding the modeling process.
