#!/usr/bin/env node

/**
 * Created by vasa on 18.12.13.
 */

var argv = require('optimist')
  .usage('usage: $0 --uniqueid [string] --callerid [string] --local [string] --message [string] --socket [URL]')
  .alias('u', 'uniqueid')
  .alias('c', 'callerid')
  .alias('l', 'local')
  .alias('m', 'message')
  .alias('s', 'socket')
  .string('u')
  .string('c')
  .string('l')
  .string('m')
  .string('s')
  .demand(['u', 'c', 'l', 'm'])
  .describe('u', 'Unique ID')
  .describe('c', 'Caller ID')
  .describe('l', 'local')
  .describe('m', 'message')
  .describe('s', 'URL to websocket')
  .default('s', 'http://127.0.0.1:9999/socket')
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

    client.write(JSON.stringify({
      _uuid   : uuid.v1(),
      uniqueid: argv.uniqueid,
      callerid: argv.callerid,
      local   : argv.local,
      message : argv.message
    }));

    setTimeout(function () {
      process.exit("timeout")
    }, 1000)

  })
  .on('error', function (e) {
    console.error(e);
    process.exit(e)
  });