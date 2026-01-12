---
layout: post
title: "Complete Guide to Deploying ML Models with Amazon SageMaker"
date: 2025-12-22
tags: [aws, sagemaker, machine-learning, deployment, inference, mlops]
---

# Complete Guide to Deploying ML Models with Amazon SageMaker

Amazon SageMaker provides a comprehensive platform for deploying machine learning models at scale. Whether you need real-time predictions, serverless inference, or batch processing, SageMaker has you covered.

This guide walks through all deployment options with practical code examples.

---

## TL;DR — Deployment Options

| Option | Best For | Latency | Cost Model |
|--------|----------|---------|------------|
| **Real-Time Endpoints** | Low-latency, consistent traffic | Milliseconds | Per-instance-hour |
| **Serverless Inference** | Intermittent traffic, cost savings | Seconds (cold start) | Per-request |
| **Async Inference** | Large payloads, long processing | Minutes | Per-request + instance |
| **Batch Transform** | Offline bulk predictions | N/A | Per-job |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Model Deployment Flow                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐    ┌──────────────┐    ┌───────────────────────────────┐│
│   │ Trained      │    │  Amazon S3   │    │  SageMaker Endpoint           ││
│   │ Model        │───▶│  model.tar.gz│───▶│  ┌─────────────────────────┐  ││
│   │ (Local/      │    │              │    │  │ Container               │  ││
│   │  SageMaker)  │    └──────────────┘    │  │ ┌───────────────────┐   │  ││
│   └──────────────┘                        │  │ │ Model Server      │   │  ││
│                                           │  │ │ (TensorFlow/      │   │  ││
│                                           │  │ │  PyTorch/HF/etc)  │   │  ││
│                                           │  │ └───────────────────┘   │  ││
│                                           │  └─────────────────────────┘  ││
│                                           └───────────────────────────────┘│
│                                                          │                  │
│                                                          ▼                  │
│                                           ┌───────────────────────────────┐│
│                                           │  Real-Time Predictions        ││
│                                           │  • REST API                   ││
│                                           │  • Auto-scaling               ││
│                                           │  • A/B Testing                ││
│                                           └───────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Real-Time Inference Endpoints

Best for: **Low-latency predictions** with consistent traffic (fraud detection, recommendations, chatbots)

### Basic Deployment

```python
import boto3
import sagemaker
from sagemaker.model import Model

# Setup
session = sagemaker.Session()
role = sagemaker.get_execution_role()
region = session.boto_region_name

# Define model
model = Model(
    image_uri=sagemaker.image_uris.retrieve(
        framework='pytorch',
        region=region,
        version='2.0',
        py_version='py310',
        image_scope='inference'
    ),
    model_data='s3://your-bucket/models/model.tar.gz',
    role=role,
    name='my-pytorch-model'
)

# Deploy to endpoint
predictor = model.deploy(
    initial_instance_count=1,
    instance_type='ml.m5.large',
    endpoint_name='my-model-endpoint'
)

# Make predictions
response = predictor.predict({"inputs": "Hello, world!"})
print(response)
```

### Framework-Specific Deployments

#### PyTorch Model

```python
from sagemaker.pytorch import PyTorchModel

pytorch_model = PyTorchModel(
    model_data='s3://bucket/pytorch-model.tar.gz',
    role=role,
    framework_version='2.0',
    py_version='py310',
    entry_point='inference.py',  # Custom inference script
    source_dir='code/'           # Directory with inference.py
)

predictor = pytorch_model.deploy(
    instance_type='ml.g4dn.xlarge',  # GPU instance
    initial_instance_count=1
)
```

#### TensorFlow Model

```python
from sagemaker.tensorflow import TensorFlowModel

tf_model = TensorFlowModel(
    model_data='s3://bucket/tensorflow-model.tar.gz',
    role=role,
    framework_version='2.12',
    entry_point='inference.py'
)

predictor = tf_model.deploy(
    instance_type='ml.m5.xlarge',
    initial_instance_count=1
)
```

#### Hugging Face Model

```python
from sagemaker.huggingface import HuggingFaceModel

huggingface_model = HuggingFaceModel(
    model_data='s3://bucket/hf-model.tar.gz',
    role=role,
    transformers_version='4.28',
    pytorch_version='2.0',
    py_version='py310',
    # Or deploy directly from Hub:
    env={
        'HF_MODEL_ID': 'distilbert-base-uncased-finetuned-sst-2-english',
        'HF_TASK': 'text-classification'
    }
)

predictor = huggingface_model.deploy(
    instance_type='ml.g4dn.xlarge',
    initial_instance_count=1
)

# Predict
result = predictor.predict({
    "inputs": "I love this product!"
})
# Output: [{'label': 'POSITIVE', 'score': 0.9998}]
```

### Custom Inference Script (`inference.py`)

```python
import json
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

def model_fn(model_dir):
    """Load model from the model_dir."""
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    return {'model': model, 'tokenizer': tokenizer}

def input_fn(request_body, request_content_type):
    """Deserialize input data."""
    if request_content_type == 'application/json':
        data = json.loads(request_body)
        return data['inputs']
    raise ValueError(f"Unsupported content type: {request_content_type}")

def predict_fn(input_data, model_dict):
    """Make predictions."""
    model = model_dict['model']
    tokenizer = model_dict['tokenizer']
    
    inputs = tokenizer(input_data, return_tensors='pt', padding=True, truncation=True)
    
    with torch.no_grad():
        outputs = model(**inputs)
        predictions = torch.softmax(outputs.logits, dim=-1)
    
    return predictions.tolist()

def output_fn(prediction, response_content_type):
    """Serialize predictions."""
    if response_content_type == 'application/json':
        return json.dumps({'predictions': prediction})
    raise ValueError(f"Unsupported content type: {response_content_type}")
```

---

## 2. Serverless Inference

Best for: **Intermittent traffic** with unpredictable patterns, cost optimization

### Key Benefits
- ✅ No idle instance costs
- ✅ Auto-scales to zero
- ✅ Pay only for requests
- ⚠️ Cold start latency (seconds)

```python
from sagemaker.serverless import ServerlessInferenceConfig

# Configure serverless settings
serverless_config = ServerlessInferenceConfig(
    memory_size_in_mb=4096,      # 1024, 2048, 3072, 4096, 5120, or 6144
    max_concurrency=10,           # Max concurrent invocations
    provisioned_concurrency=1     # Optional: keep warm instances
)

# Deploy serverless endpoint
predictor = model.deploy(
    serverless_inference_config=serverless_config,
    endpoint_name='my-serverless-endpoint'
)

# Use normally
response = predictor.predict(data)
```

### When to Use Serverless

| Scenario | Serverless? | Reason |
|----------|-------------|--------|
| < 1000 requests/day | ✅ Yes | Cost savings |
| Unpredictable traffic | ✅ Yes | Auto-scales |
| < 100ms latency required | ❌ No | Cold starts |
| Large models (> 6GB) | ❌ No | Memory limit |
| GPU required | ❌ No | CPU only |

---

## 3. Asynchronous Inference

Best for: **Large payloads** (up to 1GB), long-running inference (minutes)

### Use Cases
- Document processing
- Video/audio analysis
- Large batch predictions
- Complex ML pipelines

```python
from sagemaker.async_inference import AsyncInferenceConfig

# Configure async settings
async_config = AsyncInferenceConfig(
    output_path='s3://bucket/async-outputs/',      # Where to store results
    max_concurrent_invocations_per_instance=4,
    notification_config={
        'SuccessTopic': 'arn:aws:sns:region:account:success-topic',
        'ErrorTopic': 'arn:aws:sns:region:account:error-topic'
    }
)

# Deploy async endpoint
predictor = model.deploy(
    instance_type='ml.g4dn.xlarge',
    initial_instance_count=1,
    async_inference_config=async_config,
    endpoint_name='my-async-endpoint'
)
```

### Invoking Async Endpoints

```python
import boto3

runtime = boto3.client('sagemaker-runtime')

# Submit async request
response = runtime.invoke_endpoint_async(
    EndpointName='my-async-endpoint',
    InputLocation='s3://bucket/input/large-file.json',
    ContentType='application/json',
    Accept='application/json'
)

# Get the output location
output_location = response['OutputLocation']
print(f"Results will be at: {output_location}")

# Poll for results or use SNS notifications
```

### Polling for Results

```python
import time
import boto3

s3 = boto3.client('s3')

def wait_for_async_result(output_location, timeout=300):
    """Wait for async inference result."""
    bucket, key = output_location.replace('s3://', '').split('/', 1)
    
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            response = s3.get_object(Bucket=bucket, Key=key)
            return response['Body'].read().decode('utf-8')
        except s3.exceptions.NoSuchKey:
            time.sleep(5)
    
    raise TimeoutError("Async inference timed out")

result = wait_for_async_result(output_location)
print(result)
```

---

## 4. Batch Transform

Best for: **Offline bulk predictions** on large datasets

### When to Use
- Periodic scoring of entire datasets
- No real-time requirements
- Cost-effective for large volumes

```python
from sagemaker.transformer import Transformer

# Create transformer
transformer = model.transformer(
    instance_count=2,
    instance_type='ml.m5.xlarge',
    output_path='s3://bucket/batch-outputs/',
    max_payload=6,              # MB per request
    max_concurrent_transforms=4
)

# Run batch transform job
transformer.transform(
    data='s3://bucket/batch-inputs/',
    content_type='application/json',
    split_type='Line',          # Each line is a separate request
    join_source='Input'         # Include input in output
)

# Wait for completion
transformer.wait()
print(f"Outputs at: {transformer.output_path}")
```

### Input/Output Format

**Input file** (`s3://bucket/batch-inputs/data.jsonl`):
```json
{"features": [1.0, 2.0, 3.0]}
{"features": [4.0, 5.0, 6.0]}
{"features": [7.0, 8.0, 9.0]}
```

**Output file** (`s3://bucket/batch-outputs/data.jsonl.out`):
```json
{"prediction": 0.85}
{"prediction": 0.23}
{"prediction": 0.67}
```

---

## 5. Multi-Model Endpoints

Deploy **multiple models on a single endpoint** to reduce costs.

### Benefits
- Share infrastructure across models
- Pay for one endpoint, serve many models
- Dynamic model loading

```python
from sagemaker.multidatamodel import MultiDataModel

# Create multi-model endpoint
mme = MultiDataModel(
    name='my-multi-model-endpoint',
    model_data_prefix='s3://bucket/models/',
    model=model,
    sagemaker_session=session
)

# Add models
mme.add_model(model_data_source='s3://bucket/models/model-a.tar.gz')
mme.add_model(model_data_source='s3://bucket/models/model-b.tar.gz')

# Deploy
predictor = mme.deploy(
    initial_instance_count=1,
    instance_type='ml.m5.large'
)

# Invoke specific model
response = predictor.predict(
    data=input_data,
    target_model='model-a.tar.gz'  # Specify which model
)
```

---

## 6. Auto Scaling

Configure auto-scaling for production workloads:

```python
import boto3

client = boto3.client('application-autoscaling')

# Register scalable target
client.register_scalable_target(
    ServiceNamespace='sagemaker',
    ResourceId=f'endpoint/{endpoint_name}/variant/AllTraffic',
    ScalableDimension='sagemaker:variant:DesiredInstanceCount',
    MinCapacity=1,
    MaxCapacity=10
)

# Create scaling policy
client.put_scaling_policy(
    PolicyName='my-scaling-policy',
    ServiceNamespace='sagemaker',
    ResourceId=f'endpoint/{endpoint_name}/variant/AllTraffic',
    ScalableDimension='sagemaker:variant:DesiredInstanceCount',
    PolicyType='TargetTrackingScaling',
    TargetTrackingScalingPolicyConfiguration={
        'TargetValue': 70.0,  # Target CPU utilization
        'PredefinedMetricSpecification': {
            'PredefinedMetricType': 'SageMakerVariantInvocationsPerInstance'
        },
        'ScaleOutCooldown': 60,
        'ScaleInCooldown': 300
    }
)
```

---

## 7. Model Packaging

### Creating model.tar.gz

```python
import tarfile
import os

def create_model_archive(model_dir, output_path='model.tar.gz'):
    """Package model directory into tar.gz."""
    with tarfile.open(output_path, 'w:gz') as tar:
        for item in os.listdir(model_dir):
            tar.add(
                os.path.join(model_dir, item),
                arcname=item
            )
    return output_path

# Example structure:
# model/
# ├── model.pth           # Model weights
# ├── config.json         # Model config
# ├── tokenizer.json      # Tokenizer (if needed)
# └── code/
#     └── inference.py    # Custom inference script

create_model_archive('model/', 'model.tar.gz')
```

### Upload to S3

```python
import boto3

s3 = boto3.client('s3')
bucket = 'your-bucket'

s3.upload_file(
    'model.tar.gz',
    bucket,
    'models/my-model/model.tar.gz'
)

model_uri = f's3://{bucket}/models/my-model/model.tar.gz'
```

---

## 8. Instance Type Selection

### CPU Instances

| Instance | vCPUs | Memory | Use Case |
|----------|-------|--------|----------|
| ml.t3.medium | 2 | 4 GB | Dev/test |
| ml.m5.large | 2 | 8 GB | Small models |
| ml.m5.xlarge | 4 | 16 GB | Medium models |
| ml.c5.xlarge | 4 | 8 GB | CPU-intensive |

### GPU Instances

| Instance | GPUs | GPU Memory | Use Case |
|----------|------|------------|----------|
| ml.g4dn.xlarge | 1 T4 | 16 GB | Cost-effective inference |
| ml.g5.xlarge | 1 A10G | 24 GB | Larger models |
| ml.p3.2xlarge | 1 V100 | 16 GB | High-performance |
| ml.p4d.24xlarge | 8 A100 | 320 GB | Large LLMs |

### Choosing the Right Instance

```python
def recommend_instance(model_size_gb, latency_requirement_ms, gpu_required):
    """Simple instance recommendation logic."""
    
    if not gpu_required:
        if model_size_gb < 2:
            return 'ml.m5.large'
        elif model_size_gb < 8:
            return 'ml.m5.xlarge'
        else:
            return 'ml.m5.2xlarge'
    else:
        if model_size_gb < 8:
            return 'ml.g4dn.xlarge'
        elif model_size_gb < 20:
            return 'ml.g5.xlarge'
        else:
            return 'ml.g5.2xlarge'
```

---

## 9. Monitoring and Logging

### CloudWatch Metrics

```python
import boto3

cloudwatch = boto3.client('cloudwatch')

# Get endpoint metrics
response = cloudwatch.get_metric_statistics(
    Namespace='AWS/SageMaker',
    MetricName='Invocations',
    Dimensions=[
        {'Name': 'EndpointName', 'Value': 'my-endpoint'},
        {'Name': 'VariantName', 'Value': 'AllTraffic'}
    ],
    StartTime=datetime.utcnow() - timedelta(hours=1),
    EndTime=datetime.utcnow(),
    Period=300,
    Statistics=['Sum']
)
```

### Key Metrics to Monitor

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| `Invocations` | Request count | Anomaly detection |
| `ModelLatency` | Inference time | > 500ms |
| `OverheadLatency` | SageMaker overhead | > 100ms |
| `Invocation4XXErrors` | Client errors | > 1% |
| `Invocation5XXErrors` | Server errors | > 0.1% |
| `CPUUtilization` | CPU usage | > 80% |
| `MemoryUtilization` | Memory usage | > 80% |

### Enable Container Logging

```python
predictor = model.deploy(
    instance_type='ml.m5.large',
    initial_instance_count=1,
    # Enable data capture for monitoring
    data_capture_config=DataCaptureConfig(
        enable_capture=True,
        sampling_percentage=100,
        destination_s3_uri='s3://bucket/capture/'
    )
)
```

---

## 10. Cost Optimization

### Strategies

1. **Right-size instances**: Start small, scale up based on metrics
2. **Use Serverless**: For < 1000 requests/day
3. **Spot instances**: For fault-tolerant workloads (up to 90% savings)
4. **Multi-model endpoints**: Share infrastructure
5. **Auto-scaling**: Scale down during low traffic
6. **Savings Plans**: Commit for predictable workloads

### Cost Comparison Example

For 100,000 requests/day with 100ms inference time:

| Option | Monthly Cost | Notes |
|--------|--------------|-------|
| ml.m5.large (24/7) | ~$70 | Always on |
| Serverless (4GB) | ~$15 | Pay per request |
| ml.m5.large + auto-scale | ~$40 | Scale to 0 at night |

---

## 11. Production Checklist

Before deploying to production:

- [ ] **Model tested** on representative data
- [ ] **Instance type benchmarked** for latency/throughput
- [ ] **Auto-scaling configured** with appropriate thresholds
- [ ] **Monitoring dashboards** set up in CloudWatch
- [ ] **Alerts configured** for errors and latency
- [ ] **Data capture enabled** for model monitoring
- [ ] **IAM roles** follow least privilege
- [ ] **VPC configuration** if needed for security
- [ ] **Endpoint name** follows naming convention
- [ ] **Rollback plan** documented

---

## Quick Reference: Deployment Commands

```python
# Real-time endpoint
predictor = model.deploy(instance_type='ml.m5.large', initial_instance_count=1)

# Serverless
predictor = model.deploy(serverless_inference_config=ServerlessInferenceConfig(memory_size_in_mb=4096))

# Async
predictor = model.deploy(instance_type='ml.m5.large', async_inference_config=async_config)

# Batch
transformer = model.transformer(instance_type='ml.m5.xlarge', instance_count=2)
transformer.transform(data='s3://input/', output_path='s3://output/')

# Delete endpoint
predictor.delete_endpoint()
```

---

## Summary

| Deployment Type | Latency | Max Payload | Scaling | Best For |
|----------------|---------|-------------|---------|----------|
| **Real-Time** | ms | 6 MB | Manual/Auto | APIs, chatbots |
| **Serverless** | seconds | 6 MB | Automatic | Low traffic |
| **Async** | minutes | 1 GB | Auto | Large files |
| **Batch** | N/A | Unlimited | Per-job | Offline scoring |

**Key Takeaways:**
1. ✅ Start with **Serverless** for new projects (cost-effective)
2. ✅ Use **Real-Time** when latency matters
3. ✅ Choose **Async** for large payloads
4. ✅ Use **Batch Transform** for offline bulk processing
5. ✅ Always configure **auto-scaling** for production
6. ✅ Monitor **CloudWatch metrics** continuously

---

**Related Posts:**
- [Designing a Knowledge Base with Metadata Filtering in AWS](/2025/12/22/aws-knowledge-base-metadata-filtering-solution/)
- [Generating RAG Evaluation Datasets from S3](/2025/12/22/rag-evaluation-dataset-generation-from-s3/)

**References:**
- [SageMaker Deploy Models Documentation](https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html)
- [Real-Time Inference Endpoints](https://docs.aws.amazon.com/sagemaker/latest/dg/realtime-endpoints.html)
- [Serverless Inference](https://docs.aws.amazon.com/sagemaker/latest/dg/serverless-endpoints.html)
- [Async Inference](https://docs.aws.amazon.com/sagemaker/latest/dg/async-inference.html)
- [SageMaker Pricing](https://aws.amazon.com/sagemaker/pricing/)

