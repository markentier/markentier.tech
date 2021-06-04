#!/bin/bash
set -eou pipefail

POST_TEMPLATE="tools/new-post/post.template.md"

echo Creating a new blog post DRAFT
echo "IMPORTANT: the drafts folder is git ignored, the post will exist only locally!"
echo
echo -n "Title: "; read NEW_TITLE

NEW_TITLE_SLUG=$(
  echo "${NEW_TITLE}" | \
  iconv -t ascii//TRANSLIT | \
  sed -r -e "s|[^a-zA-Z0-9]+|-|g" | \
  sed -r -e "s|^-+\|-+$||g" | \
  tr A-Z a-z
)

DATE_TAG=$(date +"%FT%TZ")
DATE_PATH=$(date +"%Y/%m")
POST_PATH_DIR="drafts/${NEW_TITLE_SLUG}"
POST_PATH_MD="${POST_PATH_DIR}/index.md"

mkdir -p ${POST_PATH_DIR}

cat ${POST_TEMPLATE} | \
  sed -r -e "s|\%\%title\%\%|${NEW_TITLE}|g" | \
  sed -r -e "s|\%\%date\%\%|${DATE_TAG}|g" > ${POST_PATH_MD}

echo "${POST_PATH_MD} created. Go ahead and write something awesome!"
