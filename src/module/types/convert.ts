import { Argument, ArgumentLike } from './argument';
import oscmin = require("osc-min");

export type Options = {
    maxMspCompatible: boolean;
    recognitionInt: boolean;
};

const defaultOption = {
    maxMspCompatible: false,
    recognitionInt: true,
} as const;

export function toArgument(arg: ArgumentLike,
                        options: Partial<Options> = defaultOption): Argument
{
    options = {
        maxMspCompatible: options.maxMspCompatible ?? defaultOption.maxMspCompatible,
        recognitionInt: options.recognitionInt ?? defaultOption.recognitionInt,
    };
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
            } else if(arg instanceof Buffer) {
                return {
                    type: 'blob',
                    value: arg
                };
            } else if(Array.isArray(arg)) {
                return {
                    type: 'blob',
                    value: Buffer.from(arg)
                };
            } else if(arg instanceof ArrayBuffer) {
                return {
                    type: 'blob',
                    value: Buffer.from(arg)
                };
            } else if(arg instanceof Uint8Array) {
                return {
                    type: 'blob',
                    value: Buffer.from(arg)
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
