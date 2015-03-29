#!/bin/bash
git pull
git rev-list HEAD --count > commit-count.log

echo "\n\nCommit count:" 
cat commit-count.log 