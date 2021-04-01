# @2bit/osc

osc client/server written by typescript

* depends on [osc-min](https://www.npmjs.com/package/osc-min)
* influened by [node-osc](https://www.npmjs.com/package/node-osc)
* **this package is in development phase**

## install

```
npm i @2bit/osc
```

## How to use

```typescript

import * as Osc from '../index';

const server = new Osc.Server(33333, {
    host: '0.0.0.0',
});

server.on('/test1', (args) => {
    console.log(... args);
});

server.on('/test2', (args) => {
    console.log(... args);
});

server.on('message', (address, args) => {
    console.log(address, ... args); // /test1 and /test2 will be emit
});

server.on('leaked', (address, args) => {
    console.log(address, ... args); // /test2 will be emit
});

const client = new Osc.Client('localhost', 33333);
client.send('/test1', 1, 2, false, 'hoge');
client.send('/test2', 2.3, true, 'hoge');

```

## API

### Client

* `constructor(host: string, port: uint16, options?: { maxMspCompatible?: boolean = false, recognitionInt?: boolean = false })`

if set `maxMspCompatible` true, then floating point number will be float, else be double.

if set `recognitionInt` false, then all number will be float or double (depends `maxMspCompatible`.)

* `async send(message: Osc.MessageInterface): Promise<number>`
* `async send(message: Osc.BundleInterface): Promise<number>`
* `async send(address: string, args: Osc.ArgumentLike[]): Promise<number>`
* `async send(address: string, ... args: Osc.ArgumentLike[]): Promise<number>`

returns bytes is size of sent packet.

### Server

* `constructor(public readonly port: number, options?: { host?: string = '0.0.0.0', strict_mode?: boolean = true })`

* `on(event: 'bind', callback: (with_reuseAddr: boolean) => void): this`
* `on(event: 'listening', callback: () => void): this`
* `on(event: 'error', callback: (err: Error) => void): this`
* `on(event: 'message', listener: (address: string, args: ArgumentArray, rinfo: dgram.RemoteInfo) => void): this`
* `on(event: 'leaked', listener: (address: string, args: ArgumentArray, rinfo: dgram.RemoteInfo) => void): this`
* `on(event: 'bundle', listener: (bundle: Osc.BundleInterface, rinfo: dgram.RemoteInfo) => void): this`
* `on(event: 'parse_error', listener: (err: Error, buffer: Buffer, rinfo: dgram.RemoteInfo) => void): this`
* `on(event: string, listener: (args: ArgumentArray, rinfo: dgram.RemoteInfo) => void): this`

### Message

TODO

### Bundle

TODO
