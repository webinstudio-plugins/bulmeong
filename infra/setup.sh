#!/usr/bin/env bash
# Bulmeong on AWS: private bucket, OAC, CloudFront (default *.cloudfront.net certificate, no custom domain yet),
# and a GitHub OIDC deploy role for webinstudio-plugins/bulmeong (master only).
# Run in AWS CloudShell (us-east-1): bash setup.sh ACCOUNT_ID REPO_OWNER_ID REPO_ID
# Re-runnable: each step skips what exists; the header policy, trust and inline policies are rewritten.
# Adapted from pflegegrad-site/infra/setup-1..3.sh (same AWS account, separate resource names).
set -euo pipefail
if [ $# -ne 3 ] || ! [[ $1 =~ ^[0-9]{12}$ && $2 =~ ^[0-9]+$ && $3 =~ ^[0-9]+$ ]]; then
  echo "usage: bash setup.sh ACCOUNT_ID REPO_OWNER_ID REPO_ID" >&2; exit 1
fi
export AWS_DEFAULT_REGION=us-east-1 AWS_PAGER=""
N=bulmeong SITE=bulmeong-site ACCT=$1 H=token.actions.githubusercontent.com
[ "$(aws sts get-caller-identity --query Account --output text)" = "$ACCT" ] || { echo "Not account $ACCT" >&2; exit 1; }
STATE=~/$N-state.env; touch "$STATE"; . "$STATE"
save() { grep -v "^$1=" "$STATE" > "$STATE.tmp" || true; echo "$1=$2" >> "$STATE.tmp"; mv "$STATE.tmp" "$STATE"; }
none() { [ -z "$1" ] || [ "$1" = "None" ]; }

# 1. Private bucket
aws s3api head-bucket --bucket $SITE 2>/dev/null || aws s3api create-bucket --bucket $SITE >/dev/null
aws s3api put-public-access-block --bucket $SITE --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

# 2. Origin access control
OAC_ID=${OAC_ID:-$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='$N-oac'].Id | [0]" --output text)}
if none "$OAC_ID"; then
  OAC_ID=$(aws cloudfront create-origin-access-control --origin-access-control-config \
    Name=$N-oac,SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3 \
    --query OriginAccessControl.Id --output text)
fi
save OAC_ID "$OAC_ID"

# 3. Response headers policy: security headers, plus CORS because the pages live on bulmeong.web.app (Firebase)
#    and load modules, JSON, audio and canvas images from here. Created when missing, otherwise rewritten.
CORS='"CorsConfig":{"AccessControlAllowOrigins":{"Quantity":1,"Items":["*"]},"AccessControlAllowHeaders":{"Quantity":1,"Items":["*"]},"AccessControlAllowMethods":{"Quantity":2,"Items":["GET","HEAD"]},"AccessControlAllowCredentials":false,"OriginOverride":true}'
HP_JSON="{\"Name\":\"$N-site-headers\",\"SecurityHeadersConfig\":{\"ReferrerPolicy\":{\"ReferrerPolicy\":\"strict-origin-when-cross-origin\",\"Override\":true},\"ContentTypeOptions\":{\"Override\":true}},$CORS}"
SITE_HP=$(aws cloudfront list-response-headers-policies --type custom \
  --query "ResponseHeadersPolicyList.Items[?ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name=='$N-site-headers'].ResponseHeadersPolicy.Id | [0]" --output text)
if none "$SITE_HP"; then
  SITE_HP=$(aws cloudfront create-response-headers-policy --response-headers-policy-config "$HP_JSON" --query ResponseHeadersPolicy.Id --output text)
else
  aws cloudfront update-response-headers-policy --id "$SITE_HP" --response-headers-policy-config "$HP_JSON" \
    --if-match "$(aws cloudfront get-response-headers-policy --id "$SITE_HP" --query ETag --output text)" >/dev/null
fi
save SITE_HP "$SITE_HP"

# 4. Distribution: CachingOptimized; the deploy sets Cache-Control and invalidates /* on every release.
if [ -z "${DIST_ID:-}" ]; then
  BEH='"ViewerProtocolPolicy":"redirect-to-https","AllowedMethods":{"Quantity":2,"Items":["GET","HEAD"],"CachedMethods":{"Quantity":2,"Items":["GET","HEAD"]}},"Compress":true,"CachePolicyId":"658327ea-f89d-4fab-a63d-7e88639e58f6"'
  cat > /tmp/$N-dist.json <<JSON
{"CallerReference":"$N-site-1","Comment":"$N site","Enabled":true,"DefaultRootObject":"index.html",
 "Origins":{"Quantity":1,"Items":[{"Id":"s3-site","DomainName":"$SITE.s3.us-east-1.amazonaws.com","OriginAccessControlId":"$OAC_ID","S3OriginConfig":{"OriginAccessIdentity":""}}]},
 "DefaultCacheBehavior":{"TargetOriginId":"s3-site",$BEH,"ResponseHeadersPolicyId":"$SITE_HP"},
 "CustomErrorResponses":{"Quantity":2,"Items":[
  {"ErrorCode":403,"ResponsePagePath":"/index.html","ResponseCode":"404","ErrorCachingMinTTL":10},
  {"ErrorCode":404,"ResponsePagePath":"/index.html","ResponseCode":"404","ErrorCachingMinTTL":10}]},
 "ViewerCertificate":{"CloudFrontDefaultCertificate":true},"HttpVersion":"http2and3","IsIPV6Enabled":true,"PriceClass":"PriceClass_All"}
JSON
  jq -e . /tmp/$N-dist.json >/dev/null
  DIST_ID=$(aws cloudfront create-distribution --distribution-config file:///tmp/$N-dist.json --query Distribution.Id --output text)
  save DIST_ID "$DIST_ID"
fi
DIST_HOST=$(aws cloudfront get-distribution --id "$DIST_ID" --query Distribution.DomainName --output text)
save DIST_HOST "$DIST_HOST"
aws s3api put-bucket-policy --bucket $SITE --policy "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"cloudfront.amazonaws.com\"},\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::$SITE/*\",\"Condition\":{\"StringEquals\":{\"AWS:SourceArn\":\"arn:aws:cloudfront::$ACCT:distribution/$DIST_ID\"}}}]}"

# 5. Deploy role: only pushes to master of this repository (matched by numeric ids, so a rename keeps working).
OIDC_ARN=arn:aws:iam::$ACCT:oidc-provider/$H
aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN" >/dev/null 2>&1 \
  || aws iam create-open-id-connect-provider --url "https://$H" --client-id-list sts.amazonaws.com >/dev/null
cat > /tmp/$N-trust.json <<JSON
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Federated":"$OIDC_ARN"},
 "Action":"sts:AssumeRoleWithWebIdentity",
 "Condition":{"StringEquals":{"$H:aud":"sts.amazonaws.com","$H:sub":"repo:webinstudio-plugins@$2/bulmeong@$3:ref:refs/heads/master"}}}]}
JSON
cat > /tmp/$N-perm.json <<JSON
{"Version":"2012-10-17","Statement":[
 {"Effect":"Allow","Action":"s3:ListBucket","Resource":"arn:aws:s3:::$SITE"},
 {"Effect":"Allow","Action":["s3:PutObject","s3:DeleteObject"],"Resource":"arn:aws:s3:::$SITE/*"},
 {"Effect":"Allow","Action":["cloudfront:CreateInvalidation","cloudfront:GetInvalidation"],
  "Resource":"arn:aws:cloudfront::$ACCT:distribution/$DIST_ID"}]}
JSON
jq -e . /tmp/$N-trust.json >/dev/null; jq -e . /tmp/$N-perm.json >/dev/null
if aws iam get-role --role-name $N-deploy >/dev/null 2>&1; then
  aws iam update-assume-role-policy --role-name $N-deploy --policy-document file:///tmp/$N-trust.json
else
  aws iam create-role --role-name $N-deploy --assume-role-policy-document file:///tmp/$N-trust.json >/dev/null
fi
aws iam put-role-policy --role-name $N-deploy --policy-name deploy --policy-document file:///tmp/$N-perm.json
save ROLE_ARN "$(aws iam get-role --role-name $N-deploy --query Role.Arn --output text)"

echo "--- state"; cat "$STATE"
