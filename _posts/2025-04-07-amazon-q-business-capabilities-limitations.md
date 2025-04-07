---
layout: post
title: "Amazon Q Business: Capabilities and Limitations"
date: 2025-04-07 10:00:00 +0800
categories: [aws, ai, cloud-computing]
tags: [aws, amazon-q, generative-ai, enterprise-ai, llm]
---

### Sample Apps
I built 4 Amazon Q apps with different capabilities

App 1: A course search Q App that ingests courses in PDF and mp4 format. 
1. The mp4 is converted to txt using [Amazon Transcribe](https://aws.amazon.com/transcribe/). There is Amazon Transcribe model tuning process to convert specific wording into right format (e.g. asn -> ASIN)
2. The PDFs and txt are then uploaded into S3. The metadata files are also uploaded into the same S3 path. As Amazon Q's knowledge connector is using Kendra, the metadata file is following the [Kendra metadata format](https://docs.aws.amazon.com/kendra/latest/dg/s3-metadata.html) and uploaded into the same S3.
3. Trigger the sync of Amazon Q Data Connector with S3 as the source. The sync can be adhoc or with time interval as granular as hourly.
4. Create an Amazon Q App, with an Input Card of query body, and an Output Card of course search results, with formatting.
5. Expose the Q App Url as iframe embedding into my website.

Challenges faced during our testing process (on 04/07/2025)
1. Auth issue: when auth token expires, customer ends up in the main page. This is a known issue in Amazon Q businss side as they do not preserve the # suffix between redirects. This issue can be mitigated during iframe integration.
2. Tune the search result to prioritize the course rank that has more relavance.
3. The search did not return stable result. Can the configuration like top p, top k and temparature be configured.
4. Hyperlink from the search result is broken. It is prefixed by Q Web Experience url.
5. How to isolate this search knowledge from other use cases, by knowledge plugin, or knowledge source ACL. 

### What Q App can do

1. Compare metrics against benchmark thresholds to identify normal vs. outlier performance
2. Execute multi-branch decision tree analysis based on conditional logic
3. Consolidate findings from multiple analysis paths card input and remove duplicates
4. Apply simple logic to make data-driven decisions

### What Q App (without native QuickSight) may not be able to do well

1. Given source data from API, ask Q App itself to do advanced SQL operation like grouping and aggregation with multiple dimensions
2. Handle large datasets that require specialized processing. For example, the custom plugin behind API Gateway has payload limit of [10 MB](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html).
3. Handle very complex workflow with too many steps and long duration. One Q App has [20 cards](https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/quotas-regions.html#limits) quota limit. The auth token will expire after [1 hour](https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/using-web-experience.html#Web-logout)

