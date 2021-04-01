import * as Osc from './module/types';

import oscmin = require("osc-min");

import dgram from 'dgram';
import { EventEmitter } from 'events';

export namespace Server {
    export type Options = {
        host: string,
        strict_mode: boolean
    };
}

export interface ArgumentArray {
    [Symbol.iterator](): Iterator<Osc.ValueType>;
    raw: Osc.Argument[];
}

function make_args(args: oscmin.OscArgument[]): ArgumentArray {
    const values: any = args.map(arg => arg.value);
    values.raw = args;
    return values;
}

export default class Server extends EventEmitter {
    private socket: dgram.Socket;
    public readonly options: Server.Options;
    constructor(public readonly port: number,
                options: Partial<Server.Options> = {})
    {
        super();
        this.options = {
            host: options.host ?? '0.0.0.0',
            strict_mode: options.strict_mode ?? true
        };
        this.socket = dgram.createSocket({
            type: 'udp4',
        });
        this.addListeners();

        this.socket.bind(port, this.options.host, () => {
            this.emit('bind', false);
        });
        this.socket.on('error', (err: Error) => {
            super.emit('error', err);

            const e = err as any;
            if(e.code && e.code == 'EADDRINUSE') {
                this.socket.removeAllListeners();
                this.socket.close(() => {
                    console.warn(`WARNING: does port ${port} be binded by another program?
  please check it.
  this program will try to bind with "reuseAddr: true".
  will receive data when port ${port} has become free.`);
                    this.bindWithReuseAddr();
                });
            }
        });
    }

    private bindWithReuseAddr() {
        this.socket = dgram.createSocket({
            type: 'udp4',
            reuseAddr: true
        });
        this.addListeners();

        this.socket.bind(this.port, this.options.host, () => {
            this.emit('bind', true);
        });
    }
    
    private addListeners() {
        this.socket.on('listening', () => {
            this.emit('listening');
        });

        this.socket.on('error', (err: Error) => {
            this.emit('error', err);
        });

        this.socket.on('message', (buffer: Buffer, rinfo: dgram.RemoteInfo): void => {
            try {
                const message = oscmin.fromBuffer(buffer, this.options.strict_mode !== undefined ? this.options.strict_mode : true);
                if(message.oscType == 'bundle') {
                    super.emit('bundle', message, rinfo);
                    this.emitBundle(message, rinfo);
                } else {
                    this.emitMessage(message, rinfo);
                }
            } catch(err) {
                this.emit('parse_error', err, buffer, rinfo);
            }
        });
    }

    private emitMessage(message: oscmin.OscMessage, rinfo: dgram.RemoteInfo): void {
        this.emit('message', message.address, make_args(message.args), rinfo);
        this.emit(message.address, make_args(message.args), rinfo);
        if(this.listenerCount(message.address) == 0) {
            this.emit('leaked', message.address, make_args(message.args), rinfo);
        }
    }

    private emitBundle(bundle: oscmin.OscBundle, rinfo: dgram.RemoteInfo): void {
        for(const m of bundle.elements) {
            if(m.oscType == 'bundle') {
                this.emitBundle(m, rinfo);
            } else {
                this.emitMessage(m, rinfo);
            }
        }
    }

    on(event: 'bind', callback: (with_reuseAddr: boolean) => void): this;
    on(event: 'listening', callback: () => void): this;
    on(event: 'error', callback: (err: Error) => void): this;
    on(event: 'message', listener: (address: string, args: ArgumentArray, rinfo: dgram.RemoteInfo) => void): this;
    on(event: 'leaked', listener: (address: string, args: ArgumentArray, rinfo: dgram.RemoteInfo) => void): this;
    on(event: 'bundle', listener: (bundle: Osc.BundleInterface, rinfo: dgram.RemoteInfo) => void): this;
    on(event: 'parse_error', listener: (err: Error, buffer: Buffer, rinfo: dgram.RemoteInfo) => void): this;
    on(event: string, listener: (args: ArgumentArray, rinfo: dgram.RemoteInfo) => void): this;

    on(event: string, listener: (... args: any[]) => void): this {
	    return super.on(event, listener);
    }
}
