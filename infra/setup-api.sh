#!/usr/bin/env bash
# Shared-state API: DynamoDB table + Lambda (Node 22) behind a public function URL. Run in AWS CloudShell (us-east-1)
# with api/index.mjs next to this file: bash setup-api.sh
# Re-runnable: the table and role are created when missing; code, settings and CORS are updated in place.
# Cost guard: provisioned 10/10 capacity (inside the always-free 25/25) and 10 reserved concurrent executions.
set -euo pipefail
cd "$(dirname "$0")"
export AWS_DEFAULT_REGION=us-east-1 AWS_PAGER=""
STATE=~/bulmeong-state.env; touch "$STATE"
save() { grep -v "^$1=" "$STATE" > "$STATE.tmp" || true; echo "$1=$2" >> "$STATE.tmp"; mv "$STATE.tmp" "$STATE"; }
T=bulmeong F=bulmeong-api R=bulmeong-api-role
ACCT=$(aws sts get-caller-identity --query Account --output text)

# 1. Table: pk/sk strings, expired presence/feed rows removed by TTL
if ! aws dynamodb describe-table --table-name $T >/dev/null 2>&1; then
  aws dynamodb create-table --table-name $T \
    --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
    --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=10 >/dev/null
  aws dynamodb wait table-exists --table-name $T
fi
aws dynamodb update-time-to-live --table-name $T --time-to-live-specification Enabled=true,AttributeName=ttl >/dev/null 2>&1 || true

# 2. Execution role: this table only, plus its own logs
if ! aws iam get-role --role-name $R >/dev/null 2>&1; then
  aws iam create-role --role-name $R --assume-role-policy-document \
    '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null
  sleep 10 # new roles take a moment before Lambda accepts them
fi
aws iam put-role-policy --role-name $R --policy-name api --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[
 {\"Effect\":\"Allow\",\"Action\":[\"dynamodb:GetItem\",\"dynamodb:PutItem\",\"dynamodb:UpdateItem\",\"dynamodb:Query\"],\"Resource\":\"arn:aws:dynamodb:us-east-1:$ACCT:table/$T\"},
 {\"Effect\":\"Allow\",\"Action\":[\"logs:CreateLogGroup\",\"logs:CreateLogStream\",\"logs:PutLogEvents\"],\"Resource\":\"arn:aws:logs:us-east-1:$ACCT:log-group:/aws/lambda/$F:*\"}]}"

# 3. Function
rm -f /tmp/$F.zip && (cd api && zip -q /tmp/$F.zip index.mjs)
if aws lambda get-function --function-name $F >/dev/null 2>&1; then
  aws lambda update-function-code --function-name $F --zip-file fileb:///tmp/$F.zip >/dev/null
  aws lambda wait function-updated --function-name $F
  aws lambda update-function-configuration --function-name $F --runtime nodejs22.x --handler index.handler \
    --memory-size 256 --timeout 5 --environment "Variables={TABLE=$T}" >/dev/null
else
  aws lambda create-function --function-name $F --runtime nodejs22.x --handler index.handler --role "arn:aws:iam::$ACCT:role/$R" \
    --memory-size 256 --timeout 5 --environment "Variables={TABLE=$T}" --zip-file fileb:///tmp/$F.zip >/dev/null
fi
aws lambda wait function-updated --function-name $F
aws lambda put-function-concurrency --function-name $F --reserved-concurrent-executions 10 >/dev/null

# 4. Public URL with CORS for the two page hosts (and the local preview)
CORS='{"AllowOrigins":["https://bulmeong.web.app","https://d3ouqxquns99r3.cloudfront.net","http://localhost:5178"],"AllowMethods":["GET","POST"],"AllowHeaders":["content-type"],"MaxAge":86400}'
if aws lambda get-function-url-config --function-name $F >/dev/null 2>&1; then
  aws lambda update-function-url-config --function-name $F --auth-type NONE --cors "$CORS" >/dev/null
else
  aws lambda create-function-url-config --function-name $F --auth-type NONE --cors "$CORS" >/dev/null
fi
# NONE auth needs both statements (each in its own call); ignore "already exists" on re-runs
aws lambda add-permission --function-name $F --statement-id public-url --action lambda:InvokeFunctionUrl \
  --principal '*' --function-url-auth-type NONE >/dev/null 2>&1 || true
aws lambda add-permission --function-name $F --statement-id public-invoke --action lambda:InvokeFunction \
  --principal '*' --invoked-via-function-url >/dev/null 2>&1 || true
URL=$(aws lambda get-function-url-config --function-name $F --query FunctionUrl --output text)
save API_URL "$URL"

echo "--- smoke test"
sleep 3
curl -s -X POST "${URL}burn" -H 'content-type: application/json' -d '{"sid":"setup_check_01","itemType":"wood"}'; echo
curl -s "${URL}state?sid=setup_check_01" | cut -c1-200; echo
echo "API_URL=$URL"
