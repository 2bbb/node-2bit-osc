import * as Osc from './module/types';
import oscmin from "osc-min";

import dgram from 'dgram';

export namespace Client {
    export type Options = Osc.Convert.Options;
}

export default class Client {
    public readonly socket: dgram.Socket;
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
    
    // declare overload parameters
    async send(message: Osc.MessageInterface): Promise<number>;
    async send(message: Osc.BundleInterface): Promise<number>;
    async send(address: string, args: Osc.ArgumentLike[]): Promise<number>;
    async send(address: string, ... args: Osc.ArgumentLike[]): Promise<number>;

    async send(message_or_address: Osc.MessageInterface | Osc.BundleInterface | string,
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
                args: osc_args.map(arg => Osc.Convert.toArgument(arg, this.options)),
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

    async sendMessage(message: Osc.MessageInterface): Promise<number> {
        return this.sendBuffer(oscmin.toBuffer(message, true));
    }
    
    async sendBundle(bundle: Osc.BundleInterface): Promise<number> {
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
