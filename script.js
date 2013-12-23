#!/usr/bin/env node

/**
 * Created by vasa on 18.12.13.
 */

var argv = require('optimist')
  .usage('usage: $0 --action [incoming|call_picked|call_hangup] --callerid [string] --uniqueid [string] --local [string] --file [string] --message [string] --socket [URL]')
  .alias('a', 'action')
  .alias('u', 'uniqueid')
  .alias('c', 'callerid')
  .alias('l', 'local')
  .alias('f', 'file')
  .alias('m', 'message')
  .alias('s', 'socket')
  .check(function (argv) {
    return /^(incoming|call_picked|call_hangup)$/.test(argv.action)
  })
  .check(function (argv) {
    switch (argv.action) {
      case 'incoming':
        return (typeof argv.callerid == "string");
        break;
      case 'call_picked':
        return (typeof argv.callerid == "string") &&
               (typeof argv.uniqueid == "string") &&
               (typeof argv.file == "string") &&
               (typeof argv.local == "string");
        break;
      case 'call_hangup':
        return (typeof argv.uniqueid == "string");
        break;
      default:
        return false;
    }
  })
  .string('a')
  .string('u')
  .string('c')
  .string('l')
  .string('f')
  .string('m')
  .string('s')
  .demand(['a'])
  .describe('a', 'Action: incoming|call_picked|call_hangup')
  .describe('u', 'Unique ID')
  .describe('c', 'Caller ID')
  .describe('l', 'local')
  .describe('f', 'path to call recording')
  .describe('m', 'message')
  .describe('s', 'URL to websocket')
  .default('s', 'http://127.0.0.1:9999/phone')
  .argv;

var SockJs = require('sockjs-client');
var uuid = require('node-uuid');
var client = SockJs.create(argv.socket);

client
  .on('connection', function () {
    var _uuid = uuid.v1();

    client.on('message', function (message) {
      if (message == _uuid) {
        process.exit(0)
      }
    });

    switch (argv.action) {
      case 'incoming':
        client.write(JSON.stringify({
          _uuid   : uuid.v1(),
          type    : 'incoming',
          callerid: argv.callerid,
          message : argv.message
        }));
        break;
      case 'call_picked':
        client.write(JSON.stringify({
          _uuid   : uuid.v1(),
          type    : 'call_picked',
          uniqueid: argv.uniqueid,
          callerid: argv.callerid,
          local   : argv.local,
          file    : argv.file,
          message : argv.message
        }));
        break;
      case 'call_hangup':
        client.write(JSON.stringify({
          _uuid   : uuid.v1(),
          type    : 'call_hangup',
          uniqueid: argv.uniqueid
        }));
        break;
    }

    setTimeout(function () {
      process.exit("timeout")
    }, 1000)

  })
  .on('error', function (e) {
    console.error(e);
    process.exit(e)
  });