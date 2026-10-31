#!/usr/bin/env bash
# CloudFront Function bulmeong-router on the default behaviour (see router.js). Run in AWS CloudShell (us-east-1)
# after setup.sh, with router.js next to this file: bash setup-router.sh
# Re-runnable: the function is updated, tested, published, then (re)attached to the distribution.
set -euo pipefail
cd "$(dirname "$0")"
export AWS_DEFAULT_REGION=us-east-1 AWS_PAGER=""
. ~/bulmeong-state.env
F=bulmeong-router
cfg="Comment=$F,Runtime=cloudfront-js-2.0"
if aws cloudfront describe-function --name $F >/dev/null 2>&1; then
  aws cloudfront update-function --name $F --if-match "$(aws cloudfront describe-function --name $F --query ETag --output text)" \
    --function-config "$cfg" --function-code fileb://router.js >/dev/null
else
  aws cloudfront create-function --name $F --function-config "$cfg" --function-code fileb://router.js >/dev/null
fi

echo "--- tests (error, output)"
for uri in /ja/ /ja /app.mjs; do
  printf '{"version":"1.0","context":{"eventType":"viewer-request"},"viewer":{"ip":"198.51.100.1"},"request":{"method":"GET","uri":"%s","querystring":{},"headers":{},"cookies":{}}}' "$uri" > /tmp/$F-ev.json
  R=$(aws cloudfront test-function --name $F --if-match "$(aws cloudfront describe-function --name $F --query ETag --output text)" --stage DEVELOPMENT \
    --event-object fileb:///tmp/$F-ev.json --query 'TestResult.[FunctionErrorMessage,FunctionOutput]' --output text | tr -d '\n' | cut -c1-160)
  echo "[$uri] $R"
  # test-function exits 0 even when the function throws; the error is the first tab-separated field
  [ -z "${R%%$'\t'*}" ] || [ "${R%%$'\t'*}" = None ] || { echo "function error, nothing published" >&2; exit 1; }
done

aws cloudfront publish-function --name $F --if-match "$(aws cloudfront describe-function --name $F --query ETag --output text)" >/dev/null
ARN=$(aws cloudfront describe-function --name $F --stage LIVE --query FunctionSummary.FunctionMetadata.FunctionARN --output text)
aws cloudfront get-distribution-config --id "$DIST_ID" > /tmp/$F-dc.json
jq --arg arn "$ARN" '.DistributionConfig | .DefaultCacheBehavior.FunctionAssociations = {Quantity: 1, Items: [{FunctionARN: $arn, EventType: "viewer-request"}]}' \
  /tmp/$F-dc.json > /tmp/$F-dc-new.json
aws cloudfront update-distribution --id "$DIST_ID" --if-match "$(jq -r .ETag /tmp/$F-dc.json)" \
  --distribution-config file:///tmp/$F-dc-new.json --query 'Distribution.[Status,DistributionConfig.DefaultCacheBehavior.FunctionAssociations.Quantity]' --output text
