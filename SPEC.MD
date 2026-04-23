# Real-Time Industrial Visualization and Controls Platform Spec

## 1. Purpose

Build a Node.js + React application for real-time communication, visualization, monitoring, and eventual controlled writeback for industrial systems.

Initial real-time systems:

- Rockwell PLCs
- Fanuc robots

Primary frontend goals:

- Real-time dashboards for machine, PLC, and robot data
- Clear route structure using React Router
- Global application state using React Redux with a dedicated `store/` folder
- Tailwind CSS for UI styling
- Future 3D visualization of machines, cells, robots, and process state

Primary backend goals:

- Node.js server for API and WebSocket communication
- Socket.IO for real-time bidirectional communication
- Device adapter layer for PLC and robot communication
- MongoDB as the likely persistence layer for configuration, history, alarms, commands, users, and audit data

## 2. Current Repository Shape

The project currently has two main applications:

```text
websockets-sample/
  websockets/
    app.js
    socket.js
    package.json

  websockets-frontend/
    src/
      App.jsx
      main.jsx
      App.css
      index.css
    package.json
```

Target direction:

- `websockets/` remains the Node.js backend.
- `websockets-frontend/` remains the React frontend.
- The backend should eventually own all direct communication with PLCs, robots, MongoDB, and command validation.
- The frontend should never directly communicate with PLCs or robots.

## 3. Product Scope

### 3.1 Initial Scope

The first usable version should provide:

- A connected/disconnected WebSocket status indicator
- A single-device Rockwell PLC workspace
- A frontend connection form where the user can enter the PLC host/IP, slot, and poll rate
- A backend-managed Ethernet/IP connection using `st-ethernet-ip`
- A tag browser showing controller-scoped and program-scoped tags from the PLC
- A programs section showing program names exposed by the controller tag list
- A watched-tags section showing live values for selected tags
- A bit inspector section showing the 32-bit breakdown for watched integer tags
- Redux slices for websocket connection state, PLC state, and UI settings
- React Router page structure with root and dashboard layouts

### 3.2 Future Scope

Future versions should support:

- Multiple Rockwell PLCs after the single-device workflow is stable
- Fanuc robot read integration
- MongoDB-backed device and tag configuration
- Historical trending
- Alarm/event history
- Auth and role-based permissions
- Controlled writeback to PLCs and robots
- HMI-style operator controls
- Draggable/custom dashboard layouts using `@dnd-kit/react`
- 3D visualization of machines, robot positions, tooling, fixtures, conveyors, and cell status
- Production deployment configuration

### 3.3 Explicit Non-Goals

The browser application must not be treated as a hard real-time controller.

The system should not replace:

- Safety PLCs
- Robot safety systems
- E-stops
- Guarding
- Lockout/tagout procedures
- Certified HMI or SCADA requirements where those are required

Browser-based controls can be useful, but all writeback must be server-mediated, validated, permissioned, logged, and designed with industrial safety boundaries.

## 4. Recommended Dependencies

### 4.1 Frontend

Current frontend stack:

- React
- Vite
- Tailwind CSS
- Socket.IO client

Add:

```bash
npm install react-router-dom @reduxjs/toolkit react-redux
```

Already installed for future layout work:

```bash
npm install @dnd-kit/react
```

`@dnd-kit/react` should be reserved for future draggable dashboard layout editing after the PLC data flow is stable.

Likely future additions:

```bash
npm install three
```

Optional future additions:

- Charting library for trends
- Form validation library
- Date/time utility library
- React Three Fiber if a React binding for Three.js becomes helpful

### 4.2 Backend

Current backend stack:

- Node.js
- Express
- Socket.IO
- dotenv
- CORS-related middleware
- `st-ethernet-ip` for Rockwell Ethernet/IP communication

Likely future backend additions:

```bash
npm install mongoose
```

Device driver packages should be selected after confirming the exact communication methods available for each PLC and robot cell.

## 5. Architecture Overview

```text
Rockwell PLC
     |
st-ethernet-ip Controller + TagList
     |
Node.js Backend
Express API + Socket.IO + PLC Services
     |
React Frontend
Router pages + Redux store + Tailwind UI
```

Future architecture:

```text
Rockwell PLCs        Fanuc Robots
     |                   |
     +--------- Device Adapter Layer --------+
                         |
                 Node.js Backend
        Express API + Socket.IO + Services
                         |
        MongoDB config/history/audit storage
                         |
                 React Frontend
      Router pages + Redux store + Tailwind UI
```

### 5.1 Backend Responsibilities

The backend owns:

- Device communication
- Polling/subscription loops
- Data normalization
- Socket.IO event publishing
- API endpoints
- MongoDB reads and writes
- Command validation
- Writeback execution
- Audit logging
- User and role checks when auth is added

### 5.2 Frontend Responsibilities

The frontend owns:

- Routing
- UI composition
- Visualization
- User interactions
- Redux state
- Socket subscription lifecycle
- Displaying live, historical, alarm, and command state

The frontend should request actions. It should not execute industrial device writes directly.

## 6. Frontend File Structure

Current frontend structure:

```text
websockets-frontend/
  src/
    App.jsx
    main.jsx
    App.css
    index.css

    components/
      layout/
        DashboardNav.jsx
        StatusBar.jsx
      plc/
        BitInspector.jsx
        PlcConnectionPanel.jsx
        PlcErrors.jsx
        ProgramList.jsx
        TagBrowser.jsx
        WatchedTagsPanel.jsx
      realtime/
        ConnectionBadge.jsx
        LiveValue.jsx

    hooks/
      useSocketConnection.js

    pages/
      Root.jsx
      DashboardRoot.jsx
      Dashboard.jsx
      Settings.jsx
      Error.jsx

    services/
      socketClient.js
      socketEvents.js

    store/
      index.js
      hooks.js
      connectionSlice.js
      plcSlice.js
      settingsSlice.js

    utils/
      formatters.js
      time.js
```

Rules:

- Route-level components belong in `pages/`.
- Shared reusable UI belongs in `components/`.
- Redux store setup and slices belong in `store/`.
- Socket.IO client setup belongs in `services/socketClient.js`.
- Socket event names belong in `services/socketEvents.js`.
- Reusable React behavior belongs in `hooks/`.
- Tailwind utility classes should be preferred over custom CSS for layout and styling.

## 7. React Router Design

Use the `createBrowserRouter` and `RouterProvider` style.

The router should live in `App.jsx` or a dedicated router module if it grows too large.

Current route shape:

```jsx
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";

import "./App.css";
import RootLayout from "./pages/Root";
import DashboardRootLayout from "./pages/DashboardRoot";
import DashboardPage from "./pages/Dashboard";
import SettingsPage from "./pages/Settings";
import ErrorPage from "./pages/Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate replace to="/dashboard" /> },
      {
        path: "dashboard",
        element: <DashboardRootLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

### 7.1 Root Layout

`pages/Root.jsx`:

```jsx
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return <Outlet />;
}
```

### 7.2 Dashboard Layout

This follows the layout pattern requested for nested pages.

`pages/DashboardRoot.jsx`:

```jsx
import { Outlet } from "react-router-dom";
import DashboardNav from "../components/layout/DashboardNav";
import StatusBar from "../components/layout/StatusBar";

export default function DashboardRootLayout() {
  return (
    <>
      <DashboardNav />
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <Outlet />
      </main>
      <StatusBar />
    </>
  );
}
```

## 8. Redux Store Design

Use Redux Toolkit with React Redux.

`main.jsx` should wrap the application with one Redux provider:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import { store } from "./store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
```

`store/index.js`:

```jsx
import { configureStore } from "@reduxjs/toolkit";
import connectionReducer from "./connectionSlice";
import plcReducer from "./plcSlice";
import settingsReducer from "./settingsSlice";

export const store = configureStore({
  reducer: {
    connection: connectionReducer,
    plc: plcReducer,
    settings: settingsReducer,
  },
});
```

### 8.1 Slice Responsibilities

`connectionSlice.js`:

- Socket connected/disconnected state
- Socket ID
- Last heartbeat time
- Reconnect attempt count
- Backend version/status when available

`plcSlice.js`:

- Current single PLC connection state
- PLC host/IP, slot, and poll rate
- Controller properties returned by `st-ethernet-ip`
- Browse state for controller/program tags
- Program names discovered by `TagList`
- Watched tag definitions
- Latest watched tag values by tag ID
- Selected tag for the bit inspector
- PLC request and polling errors

`settingsSlice.js`:

- Theme or display preferences
- Selected plant, line, cell, or station
- User dashboard preferences

### 8.2 PLC State Shape

Example:

```js
{
  plc: {
    connection: {
      status: "connected",
      host: "192.168.1.10",
      slot: 0,
      pollRateMs: 1000
    },
    browser: {
      tags: [
        {
          id: "controller:LineSpeed",
          name: "LineSpeed",
          program: null,
          scope: "controller",
          dataType: "DINT",
          isStructure: false,
          arrayDims: 0,
          readable: true
        }
      ],
      programs: ["MainProgram"]
    },
    watchedTags: [
      {
        id: "controller:LineSpeed",
        name: "LineSpeed",
        program: null
      }
    ],
    valuesById: {
      "controller:LineSpeed": {
        value: 120,
        quality: "good",
        bits: [{ bit: 0, value: false }],
        timestamp: "2026-04-23T12:00:00.000Z"
      }
    }
  }
}
```

## 9. Socket.IO Event Contract

The backend should publish normalized PLC events instead of leaking `st-ethernet-ip` objects into the frontend.

### 9.1 Server to Client Events

`connection:state`

```js
{
  status: "connected",
  host: "192.168.1.10",
  slot: 0,
  pollRateMs: 1000,
  connectedAt: "2026-04-23T12:00:00.000Z",
  properties: {
    name: "CompactLogix",
    version: "33.011",
    run: true,
    faulted: false
  }
}
```

`plc:browse:result`

```js
{
  tags: [
    {
      id: "controller:LineSpeed",
      name: "LineSpeed",
      program: null,
      scope: "controller",
      dataType: "DINT",
      isStructure: false,
      arrayDims: 0,
      readable: true
    }
  ],
  programs: ["MainProgram"],
  templates: [],
  timestamp: "2026-04-23T12:00:00.000Z"
}
```

`plc:tags:snapshot`

```js
{
  watchedTags: [
    {
      id: "controller:LineSpeed",
      name: "LineSpeed",
      program: null,
      scope: "controller",
      dataType: "DINT"
    }
  ],
  timestamp: "2026-04-23T12:00:00.000Z",
}
```

`plc:tag:update`

```js
{
  id: "controller:LineSpeed",
  name: "LineSpeed",
  program: null,
  dataType: "DINT",
  value: 120,
  quality: "good",
  bits: [
    { bit: 0, value: false },
    { bit: 1, value: false }
  ],
  timestamp: "2026-04-23T12:00:00.000Z"
}
```

`plc:error`

```js
{
  message: "PLC browse failed.",
  detail: "PLC is not connected.",
  timestamp: "2026-04-23T12:00:00.000Z"
}
```

### 9.2 Client to Server Events

`plc:connect`

```js
{
  host: "192.168.1.10",
  slot: 0,
  pollRateMs: 1000
}
```

`plc:disconnect`

```js
{}
```

`plc:browse`

```js
{}
```

`plc:tags:subscribe`

```js
{
  tags: [
    {
      name: "LineSpeed",
      program: null
    }
  ]
}
```

`plc:tags:unsubscribe`

```js
{
  tags: [
    {
      name: "LineSpeed",
      program: null
    }
  ]
}
```

## 10. Backend File Structure

Current backend structure:

```text
websockets/
  app.js
  socket.js

  services/
    realtime/
      socketEvents.js
      socketServer.js
      plcSocketHandlers.js
    plc/
      rockwellPlcService.js
      tagNormalizer.js
```

Future backend folders for MongoDB, auth, commands, alarms, Fanuc adapters, and multi-device management should be added only when those features are implemented.

## 11. Device Adapter Interface

Future device integrations should implement the same conceptual interface so the app can support multiple PLCs and robots without changing the UI.

```js
class DeviceAdapter {
  async connect() {}
  async disconnect() {}
  async getStatus() {}
  async readTags(tags) {}
  async writeTag(tagName, value, options) {}
  async subscribeTags(tags, onUpdate) {}
}
```

### 11.1 Rockwell PLC Adapter

Initial Rockwell adapter goals:

- Connect to one PLC
- Read configured tags
- Normalize values into the shared telemetry format
- Detect connection loss
- Reconnect with backoff
- Start read-only

Writeback should be added only after:

- Tag allowlist exists
- Type validation exists
- Range validation exists
- Role checks exist
- Command audit logging exists
- Operator confirmation exists in the UI

### 11.2 Fanuc Robot Adapter

Initial Fanuc adapter goals:

- Connect using the available Fanuc communication method for the target robots
- Read robot status
- Read program name or active job where available
- Read cycle state
- Read faults or alarms where available
- Normalize robot data into the shared telemetry format

Possible robot data:

- Robot mode
- Teach/auto state
- In cycle
- Faulted
- Program name
- Current position
- Tool number
- User frame
- Override speed

## 12. MongoDB Data Model

MongoDB is likely the persistence layer.

Initial collections:

`devices`

- Device ID
- Name
- Type: `rockwell-plc`, `fanuc-robot`
- IP address or connection settings
- Plant, line, cell, station
- Enabled/disabled state

`tags`

- Tag name
- Device ID
- Data type
- Engineering unit
- Description
- Read enabled
- Write enabled
- Min/max range for numeric writeable values
- Display settings

`telemetry_history`

- Device ID
- Tag name
- Value
- Quality
- Timestamp

`alarms`

- Alarm ID
- Device ID
- Severity
- Code
- Message
- Raised timestamp
- Cleared timestamp
- Acknowledged timestamp
- Acknowledged by

`commands`

- Command ID
- Device ID
- Target
- Operation
- Requested value
- Requested by
- Request reason
- Status
- Validation result
- Execution result
- Timestamps

`users`

- User ID
- Name
- Email or username
- Role IDs
- Active state

`layouts`

- Dashboard layout configuration
- Saved views
- 3D scene mappings

## 13. Writeback and HMI Safety Model

Writeback must be treated as a separate capability from visualization.

Rules:

- The client can request a command, but the backend decides whether it is allowed.
- Every writeable tag or robot command must be explicitly allowlisted.
- Every command must be validated on the backend.
- Every command must be audited.
- Every command should return accepted, completed, or failed status.
- The UI must display the command state clearly.
- Critical commands must require confirmation.
- Commands should support timeouts.
- Commands should be rate-limited.
- Commands should be blocked when the device is offline, faulted, or in an unsafe state.
- Browser controls must not bypass PLC, robot, or machine-level interlocks.

Example command validation checks:

- Is the user authenticated?
- Does the user have permission for this command?
- Is the device online?
- Is the command enabled for this device?
- Is the value the correct type?
- Is the value inside the allowed range?
- Is the current machine state allowed for this command?
- Is another conflicting command already pending?

## 14. 3D Visualization Direction

Use Three.js for 3D visualization.

Possible frontend modules:

```text
components/three/
  MachineScene.jsx
  RobotCellScene.jsx
  MachineMesh.jsx
  RobotStatusOverlay.jsx
  TelemetryDrivenTransform.jsx
```

3D scene goals:

- Show machine or cell layout
- Show robot status through color, overlays, or animation
- Show moving parts based on live telemetry
- Show alarms or warnings in scene context
- Allow selecting equipment from the 3D scene
- Synchronize selected 3D object with Redux selected device state

Telemetry-to-3D mapping examples:

- Robot joint values drive robot arm transforms
- Conveyor running state drives material animation
- Fault state changes equipment material color
- Door open sensor changes door mesh rotation
- Part present sensor toggles part visibility

3D should be introduced after the 2D real-time data model is stable.

## 15. Environment Variables

Frontend:

```text
VITE_SOCKET_URL=http://localhost:8080
VITE_API_URL=http://localhost:8080
```

Backend:

```text
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/realtime_visualization
CLIENT_ORIGIN=http://localhost:5173
```

Future device settings should move into MongoDB or structured config files instead of being hardcoded in `app.js`.

## 16. Implementation Phases

### Phase 1: Frontend Application Shell

Acceptance criteria:

- Install React Router and Redux Toolkit dependencies
- Add `pages/` folder
- Add `store/` folder
- Add router using `createBrowserRouter`
- Add dashboard layout using `Outlet`
- Add initial pages for the PLC workspace and settings
- Add Redux provider in `main.jsx`
- Add connection slice
- Show Socket.IO connection status from Redux state

### Phase 2: Single PLC WebSocket Flow

Acceptance criteria:

- Backend has organized Socket.IO event handlers
- Backend uses `st-ethernet-ip` to connect to one Rockwell PLC
- Frontend lets the user set PLC host/IP, slot, and poll rate
- Frontend can request a controller tag/program browse
- Frontend can subscribe selected tags for polling
- Watched tag values are stored in Redux and updated by websocket events
- Integer tag values show a bit breakdown section

### Phase 3: PLC Tag Organization

Acceptance criteria:

- Tag browser supports search and scope filters
- Program-scoped tags are grouped by PLC program name
- Watched tag layout can later be made draggable using `@dnd-kit/react`
- Tags can be classified as readable, structure, array, reserved, or unsupported
- Read errors are visible without breaking the websocket session

### Phase 4: MongoDB Persistence

Acceptance criteria:

- MongoDB connection module exists
- Device configuration can be loaded from MongoDB
- Telemetry history can be sampled and stored
- Alarm and command history can be stored

### Phase 5: Rockwell PLC Read Integration

Acceptance criteria:

- Rockwell adapter connects to a test PLC or lab PLC
- Configured tags can be read
- PLC data is normalized into the existing telemetry contract
- PLC disconnect/reconnect state is visible in the UI
- No PLC writes are enabled yet

### Phase 6: Fanuc Robot Read Integration

Acceptance criteria:

- Fanuc adapter connects to a test robot or approved robot interface
- Robot status can be read
- Robot data is normalized into the existing telemetry contract
- Robot disconnect/reconnect state is visible in the UI
- No robot writes are enabled yet

### Phase 7: Controlled Writeback

Acceptance criteria:

- Backend command validator exists
- Backend command executor exists
- Command allowlist exists
- Commands are audited
- Frontend has confirmation UI for write commands
- Command status is shown to the operator
- Failed/rejected commands show clear reasons

### Phase 8: Trends, Alarms, and Reports

Acceptance criteria:

- Historical telemetry can be queried
- Trend page can chart selected tags
- Alarm page can show active and historical alarms
- Alarms can be acknowledged if the user has permission
- Reports can be generated from MongoDB data

### Phase 9: 3D Visualization

Acceptance criteria:

- Three.js scene renders in the frontend
- 3D objects map to device IDs
- Live telemetry can update visual state
- Selecting equipment in the scene updates selected device state
- Alarms and status are represented clearly in 3D

## 17. Development Rules

- Keep route pages in `src/pages/`.
- Keep global state in `src/store/`.
- Keep Redux slices separated by functionality.
- Use Redux Toolkit instead of legacy Redux patterns.
- Use React Router with `createBrowserRouter` and `RouterProvider`.
- Use `Outlet` for nested layouts.
- Use Tailwind utilities for frontend styling.
- Keep direct socket code out of presentational components.
- Keep backend device communication out of the frontend.
- Normalize PLC and robot data before sending it to the frontend.
- Start integrations in read-only mode.
- Add writeback only after validation, permissions, audit logging, and clear UI feedback exist.

## 18. Initial Build Checklist

Frontend:

- [x] Add `react-router-dom`
- [x] Add `@reduxjs/toolkit`
- [x] Add `react-redux`
- [x] Create `src/pages/`
- [x] Create `src/store/`
- [x] Create router in `App.jsx`
- [x] Wrap app with Redux `Provider`
- [x] Create dashboard shell
- [x] Create connection status UI
- [x] Move socket connection state into Redux
- [x] Create `plcSlice.js` for single PLC connection, browsing, watched tags, values, and PLC errors
- [x] Create PLC connection form in the frontend
- [x] Create PLC tag browser
- [x] Create watched tag value table
- [x] Create integer bit inspector
- [x] Create PLC program name section

Backend:

- [x] Keep Socket.IO setup in `socket.js`
- [x] Split Socket.IO event names into `services/realtime/socketEvents.js`
- [x] Split Socket.IO registration into `services/realtime/socketServer.js`
- [x] Split PLC socket handlers into `services/realtime/plcSocketHandlers.js`
- [x] Create `services/plc/rockwellPlcService.js`
- [x] Create `services/plc/tagNormalizer.js`
- [x] Connect to one Rockwell PLC using `st-ethernet-ip`
- [x] Browse controller and program-scoped tags using `TagList`
- [x] Poll selected watched tags and emit websocket updates
- [x] Add health endpoint
- [x] Serve the built React app from the backend

Future:

- [ ] Add MongoDB connection
- [ ] Add saved PLC connection profiles
- [ ] Add tag watch lists
- [ ] Add draggable dashboard layouts with `@dnd-kit/react`
- [ ] Add multiple Rockwell PLC support
- [ ] Add Fanuc robot adapter
- [ ] Add command validator
- [ ] Add command audit log
- [ ] Add Three.js visualization

## 19. Current Implementation - 2026-04-23

The project has moved away from fake telemetry. The current implementation is a single-device Rockwell PLC workspace. It is still read-only.

### 19.1 Backend

Implemented files:

```text
websockets/app.js
websockets/socket.js
websockets/services/realtime/socketEvents.js
websockets/services/realtime/socketServer.js
websockets/services/realtime/plcSocketHandlers.js
websockets/services/plc/rockwellPlcService.js
websockets/services/plc/tagNormalizer.js
```

Backend behavior:

- Starts Socket.IO on the existing Express server.
- Serves the built React frontend from `websockets-frontend/dist`.
- Adds `GET /health`.
- Supports React Router browser-history fallback for frontend routes.
- Uses `st-ethernet-ip` `Controller` for Rockwell PLC connections.
- Uses `st-ethernet-ip` `TagList` to browse controller and program-scoped tags.
- Polls only tags explicitly selected by the frontend.
- Emits normalized PLC connection, browse, snapshot, and tag update events.

Current backend websocket events:

- `connection:state`
- `plc:connect`
- `plc:disconnect`
- `plc:browse`
- `plc:browse:result`
- `plc:tags:subscribe`
- `plc:tags:unsubscribe`
- `plc:tags:snapshot`
- `plc:tag:update`
- `plc:error`

Read-only rules:

- No PLC writes are implemented.
- The browser never talks directly to the PLC.
- The backend manages the Ethernet/IP connection.
- Writeback remains disabled until command validation, permissions, audit logging, and operator confirmation are implemented.

### 19.2 Frontend

Implemented folders:

```text
websockets-frontend/src/pages/
websockets-frontend/src/store/
websockets-frontend/src/services/
websockets-frontend/src/hooks/
websockets-frontend/src/components/layout/
websockets-frontend/src/components/plc/
websockets-frontend/src/components/realtime/
websockets-frontend/src/utils/
```

Implemented app structure:

- `App.jsx` uses `createBrowserRouter` and `RouterProvider`.
- `pages/Root.jsx` owns the websocket lifecycle hook.
- `pages/DashboardRoot.jsx` provides dashboard navigation, outlet layout, and status bar.
- `main.jsx` wraps the app with the Redux `Provider`.

Implemented Redux slices:

- `connectionSlice.js`
- `plcSlice.js`
- `settingsSlice.js`

Implemented pages:

- `/dashboard`
- `/dashboard/settings`

Current frontend behavior:

- User enters PLC host/IP, slot, and poll rate.
- User can connect, disconnect, and reconnect.
- User can browse tags and program names from the connected PLC.
- User can filter tags by search text and controller/program scope.
- User can add readable non-structure tags to the watched list.
- Watched tags update over websocket polling.
- Integer watched tags expose a 32-bit bit inspector.
- PLC errors are shown in the dashboard and can be cleared.

Known limitation:

- `st-ethernet-ip` exposes program names and program-scoped tags through the tag list. It does not retrieve the PLC source code, ladder routines, or Studio 5000 project file.
