process.on('unhandledRejection', console.log);

import * as Osc from '../index';

async function sendTestMessage() {
    const client = new Osc.Client('localhost', 33333);

    client.send('/raw_sequence', 1, 2, 3, 'hoge');
    client.send('/typed', { type: 'double', value: 1.234 });
    
    const bundle = new Osc.Bundle()
        .add('/bundled/1', 1, 1, 1)
        .add('/bundled/2', 2, 2, 2)
        .add(new Osc.Bundle().add('/bundled/nested', 0.1, 0.1, 0.1));
    client.send(bundle);

    await new Promise(resolve => setTimeout(resolve, 500));
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

    server.on('bundle', (bundle: Osc.BundleInterface, rinfo) => {
        console.log('bundle', bundle, rinfo);
    });

    server.on('message', (address: string, args, rinfo) => {
        console.log('all received messages: ', address, ... args, rinfo);
    });
    server.on('leaked', (address: string, args, rinfo) => {
        console.log('received messages were not registered address: ', address, ... args, rinfo);
    });

    server.on('/raw_sequence', ([a, b, c, str], rinfo) => {
        console.log("/raw_sequence", a, b, c, str, rinfo);
    });

    server.on('/typed', ({raw}, rinfo) => {
        console.log("/typed", raw, rinfo);
    });

    server.on('/finish_test', () => {
        console.log('received /finish_test. program will finish.');
        process.exit();
    });
}

test();
