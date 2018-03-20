#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the testrpc instance that we started (if we started one and if it's still running).
  if [ -n "$ganachePID" ] && ps -p $ganachePID > /dev/null; then
    kill -9 $ganachePID
  fi

  if [ -n "$accountPID" ] && ps -p $accountPID > /dev/null; then
    kill -9 $accountPID
  fi

  if [ -n "$scanAPI" ] && ps -p $scanAPI > /dev/null; then
    kill -9 $scanAPI
  fi

  if [ -n "$processAPI" ] && ps -p $processAPI > /dev/null; then
    kill -9 $processAPI
  fi

  docker rm -f test_mongo
}

ganache-cli --gasLimit 0xfffffffffff > logs/test_ganache.log &
ganachePID=$!

echo "Start mongo ..."
docker run -d -p 27017:27017 --name test_mongo mongo

# wait for testbed startup
echo "Start ganache ..."
sleep 2s

password=123 PORT=10000 node src/server > logs/test_server.log &
accountPID=$!
echo "Run account ..."

password=123 node src/Ethereum/scanDeposit > logs/test_scanDeposit.log &
scanAPI=$!
echo "Run scan deposit ..."

password=123 node src/Ethereum/processDeposit > logs/test_processDeposit.log &
processAPI=$!
echo "Run deposit ..."

sleep 2s

mocha $1

sleep 60s



