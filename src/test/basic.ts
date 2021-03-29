process.on('unhandledRejection', console.log);

import * as Osc from '../index';

async function sendTestMessage() {
    const client = new Osc.Client('localhost', 33333);
    client.send('/raw_sequence', 1, 2, 3, 'hoge');
    client.send('/typed', { type: 'double', value: 1.234 });
    await new Promise(resolve => setTimeout(resolve, 500));
    const bundle: Osc.Bundle = {
        timetag: 0,
        elements: [{
            oscType: 'message',
            address: '/bundled/1',
            args: [],
        }, {
            oscType: 'message',
            address: '/bundled/2',
            args: [],
        }, {
            oscType: 'bundle',
            timetag: 0,
            elements: [{
                oscType: 'message',
                address: '/bundled/nested',
                args: []
            }]
        }],
        oscType: 'bundle'
    };
    client.send(bundle);
    client.send('/finish_test');
}

async function test() {
    const server = new Osc.Server(33333, {
        host: '0.0.0.0',
    });

    server.on('listening', () => {
        console.log('listening');
    });

    server.on('bind', (with_reuseAddr: boolean) => {
        console.log('bind', with_reuseAddr);
        sendTestMessage();
    });

    server.on('error', (err) => {
        console.log('error', err);
    });

    server.on('bundle', (bundle: Osc.Bundle, rinfo) => {
        console.log('bundle', bundle, rinfo);
    });

    server.on('message', (address: string, {raw}, rinfo) => {
        console.log('message', address, raw, rinfo);
    });

    server.on('/raw_sequence', ([a, b, c, str], rinfo) => {
        console.log("/raw_sequence", a, b, c, str, rinfo);
    });

    server.on('/typed', (args, rinfo) => {
        console.log("/typed", args, rinfo);
    });

    server.on('/finish_test', (args, rinfo) => {
        console.log('/finish_test', args, rinfo);
        process.exit();
    });
}

test();
