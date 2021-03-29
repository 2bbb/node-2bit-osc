import * as Osc from './types';

import oscmin from "osc-min";

import dgram from 'dgram';


export namespace Client {
    export type Options = {
        maxMspCompatible: boolean;
        recognitionInt: boolean;
    };
}

export default class Client {
    private socket: dgram.Socket;
    public readonly options: Client.Options;
    constructor(public readonly host: string,
                public readonly port: number,
                options: Partial<Client.Options> = {})
    {
        this.options = {
            maxMspCompatible: options.maxMspCompatible ?? false,
            recognitionInt: options.recognitionInt ?? true
        }
        this.socket = dgram.createSocket({
            type: 'udp4',
            reuseAddr: true
        });
    }

    // overload
    async send(message: Osc.Message): Promise<number>;
    async send(message: Osc.Bundle): Promise<number>;
    async send(address: string, argments: Osc.ArgumentLike[]): Promise<number>;
    async send(address: string, ... args: Osc.ArgumentLike[]): Promise<number>;

    async send(message_or_address: Osc.Message | Osc.Bundle | string,
            arg?: Osc.ArgumentLike[] | Osc.ArgumentLike,
            ... args: Osc.ArgumentLike[]): Promise<number>
    {
        if(typeof message_or_address == 'string') {
            const address = message_or_address;
            const osc_args: Osc.ArgumentLike[] = arg
                ? Array.isArray(arg)
                    ? arg as Osc.ArgumentLike[]
                    : [arg as Osc.ArgumentLike, ... args]
                : [];
            return this.sendMessage({
                address,
                args: osc_args.map(arg => convertToOscArgument(arg, this.options)),
                oscType: 'message'
            });
        } else {
            if(message_or_address.oscType == 'message') {
                return this.sendMessage(message_or_address);
            } else {
                return this.sendBundle(message_or_address);
            }
        }
    }

    async sendMessage(message: Osc.Message): Promise<number> {
        return this.sendBuffer(oscmin.toBuffer(message, true));
    }
    
    async sendBundle(bundle: Osc.Bundle): Promise<number> {
        return this.sendBuffer(oscmin.toBuffer(bundle, true));
    }

    protected async sendBuffer(buffer: Buffer): Promise<number> {
        return new Promise((resolve, reject) => {
            this.socket.send(buffer, this.port, this.host, (err, bytes) => {
                if(err) return reject(err);
                resolve(bytes);
            });
        });
    }

    async close(): Promise<void> {
        return new Promise(resolve => this.socket.close(resolve));
    }
}

function convertToOscArgument(arg: Osc.ArgumentLike,
                              options: Client.Options): Osc.Argument
{
    switch(typeof arg) {
        case 'boolean': {
            return {
                type: arg ? 'true' : 'false',
                value: arg
            };
        }
        case 'number': {
            if(options.recognitionInt && Math.floor(arg) == arg) {
                return {
                    type: 'integer',
                    value: arg
                };
            }
            return {
                type: options.maxMspCompatible ? 'float' : 'double',
                value: arg
            };
        }
        case 'string': {
            return {
                type: 'string',
                value: arg
            };
        }
        case 'bigint': {
            return {
                type: 'integer',
                value: Number(arg)
            };
        }
        case 'object': {
            if(arg instanceof Date) {
                return {
                    type: 'timetag',
                    value: oscmin.dateToTimetag(arg)
                };
            } else if(Array.isArray(arg)) {
                return {
                    type: 'timetag',
                    value: arg
                };
            } else if(arg instanceof Buffer) {
                return {
                    type: 'blob',
                    value: arg
                };
            } else if(arg == null) {
                return {
                    type: 'null',
                    value: null
                }
            } else {
                return arg;
            }
        }
        default: {
            return {
                type: 'null',
                value: null
            };
        }
    }
}
