/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

import type { DefaultEventsMap } from "node_modules/socket.io/dist/typed-events"
import type { Server } from "socket.io"

declare global {
    var io:Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
}
export {}