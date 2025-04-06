---
layout: post
title: "Amazon Q Business: Capabilities and Limitations"
date: 2024-06-03 10:00:00 -0500
categories: [aws, ai, cloud-computing]
tags: [aws, amazon-q, generative-ai, enterprise-ai, llm]
---

### What Q App can do

1. Compare metrics against benchmark thresholds to identify normal vs. outlier performance
2. Execute multi-branch decision tree analysis based on conditional logic
3. Consolidate findings from multiple analysis paths card input and remove duplicates
4. Apply simple logic to make data-driven decisions

### What Q App (without native QuickSight) may not be able to do well

1. Given source data from API, ask Q App itself to do advanced SQL operation like grouping and aggregation with multiple dimensions
2. Handle large datasets that require specialized processing. For example, the custom plugin behind API Gateway has payload limit of [10 MB](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html).
3. Handle very complex workflow with too many steps and long duration. One Q App has [20 cards](https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/quotas-regions.html#limits) quota limit. The auth token will expire after[1 hour](https://docs.aws.amazon.com/amazonq/latest/qbusiness-ug/using-web-experience.html#Web-logout)

