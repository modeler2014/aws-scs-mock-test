import type { Question } from '@/types/quiz'

export const questions: Question[] = [
  {
    id: 'dp-001',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company needs to encrypt objects in S3 using keys that AWS manages the storage for, but where the company controls key rotation policy and can audit key usage via CloudTrail. Which encryption option should they use?',
    options: [
      { id: 'a', text: 'SSE-S3' },
      { id: 'b', text: 'SSE-KMS with a customer managed key' },
      { id: 'c', text: 'SSE-C' },
      { id: 'd', text: 'Client-side encryption with a locally managed key' },
    ],
    correctAnswers: ['b'],
    explanation:
      'SSE-KMS with a customer managed key lets AWS store the key material while the customer controls the key policy, rotation, and gets CloudTrail visibility into every use of the key. SSE-S3 uses AWS-owned keys with no customer control; SSE-C and client-side encryption push key management entirely to the customer.',
  },
  {
    id: 'iam-001',
    domain: 'Identity and Access Management',
    questionType: 'multi',
    question:
      'A security engineer is designing cross-account access from Account A to a set of S3 buckets in Account B, without using long-lived credentials. Select TWO approaches that meet this requirement.',
    options: [
      { id: 'a', text: 'Create an IAM role in Account B with a trust policy allowing Account A to assume it' },
      { id: 'b', text: 'Share an IAM user access key from Account B with Account A' },
      { id: 'c', text: 'Attach a bucket policy in Account B that grants access to a specific IAM role ARN in Account A' },
      { id: 'd', text: 'Copy the S3 bucket policy into Account A' },
    ],
    correctAnswers: ['a', 'c'],
    explanation:
      'Cross-account access without long-lived credentials is achieved either by assuming a role in the target account (trust policy) or by granting a specific principal from the other account access via a resource-based (bucket) policy. Sharing access keys (b) creates long-lived credentials, and bucket policies are not "copied" between accounts (d).',
  },

  // ---------------------------------------------------------------------
  // Threat Detection and Incident Response (td-001..td-009)
  // ---------------------------------------------------------------------
  {
    id: 'td-001',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'GuardDuty has generated a finding indicating that an EC2 instance is communicating with a known command-and-control domain. Which GuardDuty finding type category does this represent?',
    options: [
      { id: 'a', text: 'Backdoor:EC2/C&CActivity.B!DNS' },
      { id: 'b', text: 'Recon:EC2/PortProbeUnprotectedPort' },
      { id: 'c', text: 'Policy:IAMUser/RootCredentialUsage' },
      { id: 'd', text: 'UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B' },
      { id: 'e', text: 'CryptoCurrency:EC2/BitcoinTool.B' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Backdoor finding types indicate the resource is compromised and being used for malicious purposes such as C2 communication; the DNS variant specifically triggers when the instance performs a DNS lookup for a domain associated with known C2 infrastructure. The other options are recon, policy, or credential-related findings.',
  },
  {
    id: 'td-002',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A security team wants GuardDuty to automatically analyze S3 access patterns and CloudTrail S3 data events to detect suspicious activity like unusual data access from a Tor exit node. What must they enable within GuardDuty?',
    options: [
      { id: 'a', text: 'GuardDuty S3 Protection' },
      { id: 'b', text: 'AWS Config recorder for S3' },
      { id: 'c', text: 'Amazon Macie classification jobs' },
      { id: 'd', text: 'VPC Flow Logs for the S3 VPC endpoint' },
    ],
    correctAnswers: ['a'],
    explanation:
      'GuardDuty S3 Protection ingests CloudTrail S3 data events (object-level API activity) to generate findings for suspicious access patterns. Macie focuses on discovering and classifying sensitive data, not behavioral threat detection; AWS Config tracks configuration changes, not access anomalies.',
  },
  {
    id: 'td-003',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'An incident responder needs to preserve the exact state of a potentially compromised EC2 instance for forensic analysis while removing it from the production network as quickly as possible, without terminating it. What is the best first step?',
    options: [
      { id: 'a', text: 'Terminate the instance and restore from the latest backup' },
      { id: 'b', text: 'Take an EBS snapshot, then move the instance to an isolated security group with no inbound/outbound rules' },
      { id: 'c', text: 'Stop the instance immediately to freeze its memory state' },
      { id: 'd', text: 'Reboot the instance to clear any active malicious processes' },
    ],
    correctAnswers: ['b'],
    explanation:
      'Capturing an EBS snapshot preserves disk state for forensics, and moving the instance to an isolated security group (with no rules, or explicit deny) contains it without powering it off, which would lose volatile memory state. Terminating destroys evidence; stopping loses RAM contents; rebooting can trigger anti-forensic behavior in malware.',
  },
  {
    id: 'td-004',
    domain: 'Threat Detection and Incident Response',
    questionType: 'multi',
    question:
      'Which TWO AWS services can automatically trigger a Lambda-based remediation function in response to a GuardDuty finding, enabling near real-time automated incident response?',
    options: [
      { id: 'a', text: 'Amazon EventBridge, using a rule that matches GuardDuty finding events' },
      { id: 'b', text: 'AWS Security Hub, using a custom action combined with an EventBridge rule' },
      { id: 'c', text: 'AWS Trusted Advisor' },
      { id: 'd', text: 'Amazon QuickSight' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'GuardDuty findings are published to EventBridge, so a rule can directly invoke a Lambda function; alternatively findings can be forwarded to Security Hub and a custom action there, combined with an EventBridge rule, can trigger the same remediation Lambda. Trusted Advisor provides best-practice checks and QuickSight is for BI dashboards — neither triggers remediation workflows.',
  },
  {
    id: 'td-005',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A GuardDuty finding of type "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS" is generated. What does this finding most likely indicate?',
    options: [
      { id: 'a', text: 'Temporary credentials obtained from the EC2 instance metadata service are being used from an IP address outside AWS' },
      { id: 'b', text: 'A user logged into the AWS console without MFA' },
      { id: 'c', text: 'An S3 bucket was made public' },
      { id: 'd', text: 'A root account access key was created' },
    ],
    correctAnswers: ['a'],
    explanation:
      'This finding fires when credentials associated with an EC2 instance role (normally obtained via IMDS) are used from a source outside the AWS network, a strong indicator that the credentials were stolen and exfiltrated, for example via an SSRF vulnerability. The other options describe unrelated finding types.',
  },
  {
    id: 'td-006',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'To detect potential malware on EC2 instances and container workloads flagged by suspicious GuardDuty findings, which GuardDuty feature performs an agentless scan of the attached EBS volumes?',
    options: [
      { id: 'a', text: 'GuardDuty Malware Protection for EC2' },
      { id: 'b', text: 'Amazon Inspector network reachability' },
      { id: 'c', text: 'AWS Systems Manager Patch Manager' },
      { id: 'd', text: 'Amazon Detective' },
    ],
    correctAnswers: ['a'],
    explanation:
      'GuardDuty Malware Protection for EC2 automatically takes a snapshot of the EBS volumes attached to an instance implicated in a relevant finding and scans it agentlessly for malware, without impacting the running workload. Inspector assesses vulnerabilities and network reachability, not malware; Detective visualizes and investigates existing findings rather than scanning for malware.',
  },
  {
    id: 'td-007',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A security analyst wants to visually explore the relationships between IAM roles, EC2 instances, and API calls surrounding a GuardDuty finding to understand the full scope of a potential compromise, without writing custom Athena queries. Which service should they use?',
    options: [
      { id: 'a', text: 'Amazon Detective' },
      { id: 'b', text: 'AWS Config' },
      { id: 'c', text: 'AWS CloudTrail Lake' },
      { id: 'd', text: 'AWS X-Ray' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Amazon Detective automatically builds a graph model from VPC Flow Logs, CloudTrail, and GuardDuty findings, letting analysts visually pivot through entities and timelines to investigate an incident. AWS Config tracks resource configuration history, CloudTrail Lake stores and queries event history, and X-Ray traces application requests — none provide Detective\'s purpose-built visual investigation graph.',
  },
  {
    id: 'td-008',
    domain: 'Threat Detection and Incident Response',
    questionType: 'multi',
    question:
      'Which TWO actions should be part of an automated response playbook when GuardDuty detects that an IAM user\'s credentials have likely been compromised (e.g., "UnauthorizedAccess:IAMUser/MaliciousIPCaller.Custom")?',
    options: [
      { id: 'a', text: 'Attach an explicit-deny IAM policy or disable the access keys for the affected principal' },
      { id: 'b', text: 'Rotate/revoke the compromised credentials and any active sessions' },
      { id: 'c', text: 'Immediately delete the CloudTrail trail to stop further logging' },
      { id: 'd', text: 'Grant the principal AdministratorAccess to allow the security team to investigate as that user' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'Containing a compromised identity means cutting off its ability to act (deny policy or disabling keys) and invalidating the leaked credentials/sessions so they cannot be reused. Deleting the CloudTrail trail destroys evidence and disables detection; granting more privileges is the opposite of containment.',
  },
  {
    id: 'td-009',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'An organization wants a single, aggregated, prioritized view of security findings from GuardDuty, Inspector, Macie, and third-party tools, with the ability to apply standardized findings format (ASFF) and set up automated response workflows. Which service should be deployed as the central hub?',
    options: [
      { id: 'a', text: 'AWS Security Hub' },
      { id: 'b', text: 'AWS Systems Manager OpsCenter' },
      { id: 'c', text: 'AWS Config aggregator' },
      { id: 'd', text: 'Amazon CloudWatch dashboards' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Security Hub natively aggregates findings from GuardDuty, Inspector, Macie, and supported third-party products, normalizes them into the AWS Security Finding Format (ASFF), and supports automated response via custom actions and EventBridge. Config aggregators consolidate configuration compliance data, not security findings, and OpsCenter is for operational issue tracking.',
  },

  // ---------------------------------------------------------------------
  // Security Logging and Monitoring (slm-001..slm-012)
  // ---------------------------------------------------------------------
  {
    id: 'slm-001',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A company must retain CloudTrail logs for 7 years for compliance and ensure they cannot be altered or deleted, even by the account\'s administrators. What is the most effective way to protect the log files in S3?',
    options: [
      { id: 'a', text: 'Enable S3 Object Lock in compliance mode on the CloudTrail destination bucket with a 7-year retention period' },
      { id: 'b', text: 'Enable S3 versioning only' },
      { id: 'c', text: 'Apply a bucket policy that denies s3:DeleteObject to all principals except administrators' },
      { id: 'd', text: 'Move logs to Amazon EBS on a stopped instance' },
    ],
    correctAnswers: ['a'],
    explanation:
      'S3 Object Lock in compliance mode enforces WORM (write-once-read-many) protection that even the root user cannot override until the retention period expires, satisfying strict regulatory tamper-proofing requirements. Versioning alone still allows deletion of versions by sufficiently privileged principals, and a bucket policy can be changed by an administrator.',
  },
  {
    id: 'slm-002',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'Which CloudTrail capability records data-plane operations such as GetObject and PutObject calls made against specific S3 buckets?',
    options: [
      { id: 'a', text: 'Data events' },
      { id: 'b', text: 'Management events' },
      { id: 'c', text: 'Insight events' },
      { id: 'd', text: 'CloudTrail Lake dashboards' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Data events capture object-level (data plane) API activity like GetObject/PutObject on S3 or invoke operations on Lambda, and are not logged by default due to volume/cost. Management events cover control-plane operations (like CreateBucket), and Insight events surface unusual API call-rate patterns.',
  },
  {
    id: 'slm-003',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A security team suspects that CloudTrail logging was disabled in one member account of an AWS Organization to hide malicious activity. What is the best way to prevent this from happening again across all accounts in the organization?',
    options: [
      { id: 'a', text: 'Create an organization trail in the management account with "apply to all accounts" enabled' },
      { id: 'b', text: 'Ask each account owner to enable CloudTrail manually' },
      { id: 'c', text: 'Enable AWS Config in each account to detect the change after the fact' },
      { id: 'd', text: 'Enable GuardDuty in each account' },
    ],
    correctAnswers: ['a'],
    explanation:
      'An organization trail created in the management account and applied to all accounts is enforced centrally: member account users cannot disable or delete it, ensuring consistent, tamper-resistant logging org-wide. Config would only detect the change after the fact rather than prevent it, and GuardDuty does not control CloudTrail configuration.',
  },
  {
    id: 'slm-004',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A company wants to detect, in near real time, when someone disables CloudTrail logging or deletes a CloudTrail trail. What is the most direct way to alert on this?',
    options: [
      { id: 'a', text: 'Create a CloudWatch metric filter and alarm on the CloudTrail log group for StopLogging and DeleteTrail events' },
      { id: 'b', text: 'Wait for the next AWS Config compliance report' },
      { id: 'c', text: 'Enable S3 Storage Lens' },
      { id: 'd', text: 'Review Cost Explorer reports weekly' },
    ],
    correctAnswers: ['a'],
    explanation:
      'CloudTrail logs are delivered to CloudWatch Logs, where a metric filter matching StopLogging/DeleteTrail API calls combined with a CloudWatch Alarm provides near real-time notification (e.g., via SNS). AWS Config would only report drift on its next evaluation, which is not immediate; the other options are unrelated to this use case.',
  },
  {
    id: 'slm-005',
    domain: 'Security Logging and Monitoring',
    questionType: 'multi',
    question:
      'Which TWO log sources should be enabled to investigate suspicious network traffic patterns and DNS-based data exfiltration attempts within a VPC?',
    options: [
      { id: 'a', text: 'VPC Flow Logs' },
      { id: 'b', text: 'Route 53 Resolver query logging' },
      { id: 'c', text: 'AWS Trusted Advisor checks' },
      { id: 'd', text: 'IAM Access Analyzer findings' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'VPC Flow Logs capture IP-level traffic metadata (source/destination/port/bytes) useful for detecting unusual network flows, and Route 53 Resolver query logs record DNS queries made from within the VPC, which is essential for spotting DNS tunneling/exfiltration. Trusted Advisor and IAM Access Analyzer are unrelated to network traffic inspection.',
  },
  {
    id: 'slm-006',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A company wants to run ad hoc SQL queries against a year of CloudTrail event history without managing an Athena table, glue crawler, or S3 lifecycle policy themselves. Which capability best fits this need?',
    options: [
      { id: 'a', text: 'CloudTrail Lake' },
      { id: 'b', text: 'CloudWatch Logs Insights on the raw trail bucket' },
      { id: 'c', text: 'AWS Config advanced queries' },
      { id: 'd', text: 'S3 Select on individual log files' },
    ],
    correctAnswers: ['a'],
    explanation:
      'CloudTrail Lake is a managed, queryable event data store that lets you run SQL-based queries across a long retention window without setting up Athena/Glue infrastructure yourself. CloudWatch Logs Insights queries log groups, not S3 objects directly; Config advanced queries operate on configuration data, not CloudTrail events; S3 Select only queries one object at a time.',
  },
  {
    id: 'slm-007',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'An application team needs to know exactly which IAM principal, source IP, and API calls were used against a specific KMS key over the last 90 days, including from the management account and all linked member accounts. What should they consult first?',
    options: [
      { id: 'a', text: 'CloudTrail event history filtered by resource name/event source kms.amazonaws.com' },
      { id: 'b', text: 'Amazon Macie findings' },
      { id: 'c', text: 'AWS Config resource timeline' },
      { id: 'd', text: 'VPC Flow Logs' },
    ],
    correctAnswers: ['a'],
    explanation:
      'CloudTrail logs every KMS API call (Encrypt, Decrypt, GenerateDataKey, etc.) including the calling principal, source IP, and request parameters, making it the correct source for a key-usage audit trail. Macie is for sensitive-data discovery, Config tracks configuration state rather than API call history, and Flow Logs capture network metadata, not KMS API activity.',
  },
  {
    id: 'slm-008',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'Which AWS Config feature notifies a security team via SNS whenever a resource\'s configuration drifts out of compliance with a specific rule, such as an S3 bucket becoming publicly readable?',
    options: [
      { id: 'a', text: 'Config Rules combined with an EventBridge rule/SNS notification on compliance change' },
      { id: 'b', text: 'Config resource inventory export to S3' },
      { id: 'c', text: 'Config aggregator dashboard' },
      { id: 'd', text: 'Config conformance pack score' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Config Rules evaluate resource compliance continuously or on change, and Config emits compliance-change events to EventBridge, which can trigger an SNS notification for near real-time alerting. A resource inventory export and aggregator dashboard are passive reporting tools, and a conformance pack score is a rollup metric, not an alerting mechanism by itself.',
  },
  {
    id: 'slm-009',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A security team wants centralized, near real-time streaming of logs from CloudWatch Logs in multiple accounts into a single security analytics tool outside of AWS. What is the recommended AWS-native mechanism to stream this data?',
    options: [
      { id: 'a', text: 'A CloudWatch Logs subscription filter delivering to Kinesis Data Streams or Firehose' },
      { id: 'b', text: 'Manually export CloudWatch Logs to S3 daily' },
      { id: 'c', text: 'Enable CloudWatch Logs Insights sharing' },
      { id: 'd', text: 'Use AWS Config to forward logs' },
    ],
    correctAnswers: ['a'],
    explanation:
      'CloudWatch Logs subscription filters can stream log events in near real time to a Kinesis Data Stream, Kinesis Data Firehose, or Lambda, which is the standard pattern for forwarding logs to an external SIEM. Manual daily exports are not near real time, and Config/Logs Insights are not log-forwarding mechanisms.',
  },
  {
    id: 'slm-010',
    domain: 'Security Logging and Monitoring',
    questionType: 'multi',
    question:
      'A security team is designing a centralized logging architecture across a multi-account AWS Organization. Which TWO practices are recommended best practices?',
    options: [
      { id: 'a', text: 'Deliver logs from all member accounts to a dedicated, access-restricted logging account' },
      { id: 'b', text: 'Enable S3 server access logging or CloudTrail data events on the central log bucket to detect unauthorized access to the logs themselves' },
      { id: 'c', text: 'Store all logs only in the account that generated them for simplicity' },
      { id: 'd', text: 'Grant every developer full read/write access to the central log bucket for convenience' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'Centralizing logs into a dedicated, tightly access-controlled logging account (a core landing zone/Control Tower pattern) reduces the blast radius if a workload account is compromised, and monitoring access to the log bucket itself closes the loop on log tampering detection. Keeping logs only in the source account and broad developer access both undermine log integrity and availability during an incident.',
  },
  {
    id: 'slm-011',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'What is the primary difference between an AWS CloudTrail management event and a CloudTrail Insight event?',
    options: [
      { id: 'a', text: 'Insight events detect unusual API call volume or error-rate patterns, while management events log control-plane API calls themselves' },
      { id: 'b', text: 'Insight events are free while management events incur cost' },
      { id: 'c', text: 'Management events only cover S3, while Insight events cover all services' },
      { id: 'd', text: 'There is no difference; they are the same event type' },
    ],
    correctAnswers: ['a'],
    explanation:
      'CloudTrail Insights analyzes normal management-event API call patterns and generates a separate Insight event when it detects anomalies such as a spike in IAM policy changes or unusual error rates, which is fundamentally different from a management event, which simply logs that a control-plane API call occurred. The first delivery of 5 management event types per region per trail per month is free, but Insights has its own separate pricing.',
  },
  {
    id: 'slm-012',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A company enables VPC Flow Logs for a critical subnet and sends them to CloudWatch Logs. Six months later, an auditor asks why flow log records show the "REJECT" action for traffic between two instances that should be able to communicate. Which resource is most likely responsible for the REJECT action recorded in the flow log?',
    options: [
      { id: 'a', text: 'A network ACL or security group denying the traffic' },
      { id: 'b', text: 'An S3 bucket policy' },
      { id: 'c', text: 'An IAM permissions boundary' },
      { id: 'd', text: 'A KMS key policy' },
    ],
    correctAnswers: ['a'],
    explanation:
      'VPC Flow Log REJECT entries indicate traffic was denied at the network layer, either by a security group or a network ACL rule, since flow logs specifically capture accept/reject decisions on IP traffic. Bucket policies, permissions boundaries, and KMS key policies operate at the application/API layer, not network packet filtering, so they are not recorded in flow logs.',
  },

  // ---------------------------------------------------------------------
  // Infrastructure Security (is-001..is-013)
  // ---------------------------------------------------------------------
  {
    id: 'is-001',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A company runs a fleet of EC2 instances in private subnets that need to call the Amazon S3 and DynamoDB APIs without traversing the public internet or requiring a NAT gateway. What is the most cost-effective solution?',
    options: [
      { id: 'a', text: 'Configure a gateway VPC endpoint for S3 and DynamoDB' },
      { id: 'b', text: 'Deploy a NAT gateway in each private subnet' },
      { id: 'c', text: 'Create an interface VPC endpoint (PrivateLink) for S3 and DynamoDB' },
      { id: 'd', text: 'Attach an internet gateway to the private subnets' },
    ],
    correctAnswers: ['a'],
    explanation:
      'S3 and DynamoDB support gateway VPC endpoints, which route traffic privately via route table entries at no additional hourly or data processing cost, unlike interface endpoints (which incur hourly and per-GB charges) or NAT gateways (which incur both). Attaching an internet gateway would expose the subnet to the internet, defeating the purpose.',
  },
  {
    id: 'is-002',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'Which statement correctly describes the difference between security groups and network ACLs in a VPC?',
    options: [
      { id: 'a', text: 'Security groups are stateful and evaluate all rules; network ACLs are stateless and evaluate rules in numbered order' },
      { id: 'b', text: 'Security groups are stateless; network ACLs are stateful' },
      { id: 'c', text: 'Both are stateless and require explicit outbound allow rules for return traffic' },
      { id: 'd', text: 'Network ACLs apply to individual instances; security groups apply to entire subnets' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Security groups are stateful (return traffic is automatically allowed) and operate at the instance/ENI level evaluating all applicable allow rules, while network ACLs are stateless (return traffic must be explicitly allowed) and apply at the subnet level, evaluating numbered rules in order until a match is found.',
  },
  {
    id: 'is-003',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A web application behind an Application Load Balancer is experiencing repeated SQL injection attempts from a range of IP addresses. What is the most effective AWS-native control to block these requests before they reach the application?',
    options: [
      { id: 'a', text: 'AWS WAF with a rule group that includes SQL injection protection, associated with the ALB' },
      { id: 'b', text: 'A network ACL blocking inbound port 443' },
      { id: 'c', text: 'AWS Shield Standard' },
      { id: 'd', text: 'Amazon Inspector' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS WAF operates at Layer 7 and can inspect HTTP request content, including managed rule groups that detect SQL injection patterns, and block matching requests before they reach the ALB target. Shield Standard protects against network/transport-layer DDoS, not application-layer injection attacks, and Inspector performs vulnerability assessment rather than in-line traffic filtering.',
  },
  {
    id: 'is-004',
    domain: 'Infrastructure Security',
    questionType: 'multi',
    question:
      'A company wants to protect a public-facing web application from large-scale volumetric DDoS attacks and also get access to a 24/7 DDoS response team (DRT) and cost protection for scaling during an attack. Which TWO services/features are needed?',
    options: [
      { id: 'a', text: 'AWS Shield Advanced' },
      { id: 'b', text: 'AWS Business or Enterprise Support plan' },
      { id: 'c', text: 'AWS Shield Standard only' },
      { id: 'd', text: 'Amazon Macie' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'AWS Shield Advanced provides enhanced DDoS protection, cost protection for scaling charges incurred during an attack, and access to the Shield Response Team (SRT), but engaging the SRT directly requires a Business or Enterprise Support plan. Shield Standard (included free for all customers) only provides baseline network/transport layer protection without SRT access or cost protection, and Macie is unrelated to DDoS.',
  },
  {
    id: 'is-005',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A company needs to allow on-premises servers to securely connect to resources in a VPC without traversing the public internet, using a dedicated, private, high-bandwidth network connection. Which service should they use?',
    options: [
      { id: 'a', text: 'AWS Direct Connect' },
      { id: 'b', text: 'A site-to-site VPN over the internet' },
      { id: 'c', text: 'AWS PrivateLink' },
      { id: 'd', text: 'Amazon CloudFront' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Direct Connect establishes a dedicated private network connection between on-premises infrastructure and AWS, bypassing the public internet and offering consistent, high-bandwidth, low-latency connectivity. A site-to-site VPN still traverses the public internet (though encrypted), and PrivateLink connects VPCs/services to specific endpoints, not entire on-premises networks.',
  },
  {
    id: 'is-006',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A security engineer wants to ensure that EC2 instances in a VPC can only be launched into specific subnets and can never receive a public IP address, enforced automatically at launch time rather than through manual review. What is the best approach?',
    options: [
      { id: 'a', text: 'Use an SCP or IAM policy condition combined with subnet auto-assign public IP disabled, and deny ec2:RunInstances with associatePublicIpAddress=true' },
      { id: 'b', text: 'Manually review each launch in the console' },
      { id: 'c', text: 'Rely on GuardDuty to flag public instances after the fact' },
      { id: 'd', text: 'Enable AWS Config rules only, without any preventive control' },
    ],
    correctAnswers: ['a'],
    explanation:
      'A preventive IAM/SCP condition on the RunInstances API (checking the associatePublicIpAddress parameter) combined with disabling auto-assign public IP on the subnet blocks non-compliant launches before they succeed. GuardDuty and Config rules are detective controls that act after the fact, and manual review does not scale and is error-prone.',
  },
  {
    id: 'is-007',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'An organization wants to centrally manage and enforce consistent security group rules, network firewall policies, and WAF rule sets across hundreds of VPCs in an AWS Organization, with automatic enforcement on new accounts as they are created. Which service is purpose-built for this?',
    options: [
      { id: 'a', text: 'AWS Firewall Manager' },
      { id: 'b', text: 'AWS Config' },
      { id: 'c', text: 'Amazon Inspector' },
      { id: 'd', text: 'AWS Trusted Advisor' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Firewall Manager, integrated with AWS Organizations, allows central definition of WAF rule groups, AWS Network Firewall policies, and security group policies that are automatically applied across existing and newly created accounts/resources. Config can detect drift from a desired state but doesn\'t centrally push firewall/WAF policy in the same purpose-built way, and Inspector/Trusted Advisor serve different purposes.',
  },
  {
    id: 'is-008',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A company wants stateful, network-layer traffic filtering with intrusion prevention (IPS) capabilities, domain-name filtering, and centralized policy management across multiple VPCs, going beyond what security groups and NACLs provide. Which service should they deploy?',
    options: [
      { id: 'a', text: 'AWS Network Firewall' },
      { id: 'b', text: 'AWS WAF' },
      { id: 'c', text: 'Security groups with expanded rule sets' },
      { id: 'd', text: 'Amazon Route 53 Resolver DNS Firewall only' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Network Firewall provides stateful traffic inspection with Suricata-compatible IPS rules, domain-list filtering, and centralized policy management across VPCs, extending beyond simple allow/deny controls in security groups and NACLs. WAF operates at Layer 7 for web applications specifically, and DNS Firewall filters only DNS resolution requests, not general network traffic.',
  },
  {
    id: 'is-009',
    domain: 'Infrastructure Security',
    questionType: 'multi',
    question:
      'A three-tier web application has a public-facing ALB, an application tier of EC2 instances in private subnets, and an RDS database in isolated private subnets. Which TWO security group configurations correctly implement least privilege?',
    options: [
      { id: 'a', text: 'The application tier security group allows inbound traffic only from the ALB\'s security group on the application port' },
      { id: 'b', text: 'The RDS security group allows inbound traffic only from the application tier\'s security group on the database port' },
      { id: 'c', text: 'The RDS security group allows inbound traffic from 0.0.0.0/0 on the database port for simplicity' },
      { id: 'd', text: 'The application tier security group allows inbound traffic from 0.0.0.0/0 on all ports' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'Least privilege in a tiered architecture means each layer accepts traffic only from the security group of the layer directly in front of it (ALB to app tier, app tier to database), rather than opening ports to the entire internet, which would expose the app and database tiers unnecessarily.',
  },
  {
    id: 'is-010',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A company hosts a static website and API on AWS and wants to protect against Layer 3/4 and Layer 7 DDoS attacks while also caching content at edge locations globally to reduce origin load. Which combination of services provides this?',
    options: [
      { id: 'a', text: 'Amazon CloudFront with AWS Shield and AWS WAF' },
      { id: 'b', text: 'Amazon S3 Transfer Acceleration alone' },
      { id: 'c', text: 'A single NAT gateway in each region' },
      { id: 'd', text: 'AWS Direct Connect' },
    ],
    correctAnswers: ['a'],
    explanation:
      'CloudFront distributes and caches content at edge locations while natively integrating with Shield (network/transport-layer DDoS protection is automatically included, with Shield Advanced available for enhanced protection) and WAF (Layer 7 filtering), making this the correct combination. The other options do not provide edge caching combined with DDoS/WAF protection.',
  },
  {
    id: 'is-011',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A company wants to expose an internal microservice running in Account A\'s VPC to consumers in Account B\'s VPC without peering the VPCs, without exposing the service to the internet, and while overlapping CIDR ranges exist between the two VPCs. Which solution meets all these requirements?',
    options: [
      { id: 'a', text: 'AWS PrivateLink using a VPC endpoint service' },
      { id: 'b', text: 'VPC peering' },
      { id: 'c', text: 'A Transit Gateway with a shared route table' },
      { id: 'd', text: 'A public NLB with a security group restricted by IP' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS PrivateLink exposes a service via an endpoint service/interface endpoint without requiring full network-level connectivity (like peering or Transit Gateway), which is critical since it works even when the two VPCs have overlapping CIDR ranges. VPC peering and Transit Gateway require non-overlapping CIDRs to route correctly, and a public NLB would expose the service to the internet.',
  },
  {
    id: 'is-012',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'Amazon Inspector is enabled for an EC2 fleet and continuously reports a critical vulnerability in an installed package on several instances. What is the most effective long-term remediation approach?',
    options: [
      { id: 'a', text: 'Patch the vulnerable package via a Systems Manager Patch Manager baseline and redeploy from an updated, hardened AMI going forward' },
      { id: 'b', text: 'Suppress the finding in Inspector so it stops appearing' },
      { id: 'c', text: 'Add a security group rule blocking all inbound traffic to the instances' },
      { id: 'd', text: 'Disable Inspector scanning for those instances' },
    ],
    correctAnswers: ['a'],
    explanation:
      'The correct remediation for a vulnerable software package is to actually patch it, ideally through an automated patch baseline, and bake the fix into a golden AMI so future launches are not vulnerable. Suppressing or disabling the finding does not fix the underlying issue, and blocking inbound traffic may break the application without addressing the vulnerable package.',
  },
  {
    id: 'is-013',
    domain: 'Infrastructure Security',
    questionType: 'multi',
    question:
      'A company is designing a bastion-free architecture for administrative access to EC2 instances in private subnets. Which TWO AWS-native approaches eliminate the need for open inbound SSH/RDP ports and a traditional bastion host?',
    options: [
      { id: 'a', text: 'AWS Systems Manager Session Manager' },
      { id: 'b', text: 'EC2 Instance Connect Endpoint' },
      { id: 'c', text: 'Opening security group inbound rules for SSH from 0.0.0.0/0' },
      { id: 'd', text: 'Sharing a single SSH key pair across the team via email' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'Systems Manager Session Manager provides browser/CLI-based shell access over the SSM agent without any inbound ports open, and EC2 Instance Connect Endpoint allows SSH/RDP connectivity brokered through a VPC endpoint without exposing the instance directly or requiring a public IP/bastion. Opening SSH to 0.0.0.0/0 and sharing key pairs are anti-patterns that increase attack surface and violate credential hygiene.',
  },

  // ---------------------------------------------------------------------
  // Identity and Access Management (iam-002..iam-010)
  // ---------------------------------------------------------------------
  {
    id: 'iam-002',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A developer\'s IAM user has an attached identity-based policy granting s3:* on all resources, but the developer also has a permissions boundary that only allows s3:GetObject and s3:ListBucket. What is the developer\'s effective permission when attempting s3:PutObject?',
    options: [
      { id: 'a', text: 'Denied, because the permissions boundary does not include s3:PutObject' },
      { id: 'b', text: 'Allowed, because the identity-based policy grants s3:*' },
      { id: 'c', text: 'Allowed, because permissions boundaries only apply to roles, not users' },
      { id: 'd', text: 'Denied, because permissions boundaries always deny everything by default' },
    ],
    correctAnswers: ['a'],
    explanation:
      'A permissions boundary sets the maximum permissions an identity can have; the effective permissions are the intersection of the identity-based policy and the boundary. Since the boundary does not include s3:PutObject, the action is denied even though the identity policy allows it. Permissions boundaries apply to both users and roles.',
  },
  {
    id: 'iam-003',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A company wants to enforce that no IAM principal in any member account of its AWS Organization can ever disable GuardDuty or leave the organization, regardless of what IAM permissions are granted locally in that account. What should they use?',
    options: [
      { id: 'a', text: 'A Service Control Policy (SCP) at the appropriate OU that denies the relevant GuardDuty and Organizations actions' },
      { id: 'b', text: 'An IAM permissions boundary applied to every user individually' },
      { id: 'c', text: 'A resource-based policy on the GuardDuty detector' },
      { id: 'd', text: 'A CloudWatch alarm that notifies when GuardDuty is disabled' },
    ],
    correctAnswers: ['a'],
    explanation:
      'SCPs are organization-wide guardrails that set the maximum permissions available to every principal in affected accounts, including account root users and administrators, so a deny SCP is the only listed option that enforces this irrespective of local IAM permissions. Permissions boundaries only apply where explicitly attached to an identity and can be bypassed for identities without one; a CloudWatch alarm is detective, not preventive.',
  },
  {
    id: 'iam-004',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'An application running on an EC2 instance needs to call AWS APIs. What is the AWS-recommended way to provide it credentials, avoiding any hardcoded or long-lived secrets?',
    options: [
      { id: 'a', text: 'Attach an IAM role to the EC2 instance profile' },
      { id: 'b', text: 'Store an IAM user\'s access key and secret key in an environment variable' },
      { id: 'c', text: 'Hardcode the credentials in the application source code' },
      { id: 'd', text: 'Store the access key in a world-readable file on the instance' },
    ],
    correctAnswers: ['a'],
    explanation:
      'An IAM role attached via an instance profile provides temporary, automatically rotated credentials through the instance metadata service, eliminating the need for any long-lived, hardcoded, or manually managed secrets. The other options all involve long-lived credentials that create ongoing exposure risk.',
  },
  {
    id: 'iam-005',
    domain: 'Identity and Access Management',
    questionType: 'multi',
    question:
      'Which TWO statements about AWS IAM Identity Center (successor to AWS SSO) are correct?',
    options: [
      { id: 'a', text: 'It can federate with an external identity provider (e.g., Okta, Azure AD) via SAML 2.0' },
      { id: 'b', text: 'It provides centralized, temporary-credential-based access to multiple AWS accounts in an Organization from a single sign-in' },
      { id: 'c', text: 'It replaces the need for IAM roles entirely' },
      { id: 'd', text: 'It can only be used with a single AWS account, not an Organization' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'IAM Identity Center integrates with external IdPs via SAML for federated sign-in and provides users a portal to assume temporary, role-based access across multiple accounts in an AWS Organization from one login. It relies on IAM roles under the hood rather than replacing them, and it is specifically designed for multi-account Organizations, not limited to a single account.',
  },
  {
    id: 'iam-006',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A security team discovers that an S3 bucket policy grants public read access unintentionally. Which service can proactively identify resources shared with external entities (like public S3 buckets or IAM roles trusted by outside accounts) by analyzing resource-based policies?',
    options: [
      { id: 'a', text: 'IAM Access Analyzer' },
      { id: 'b', text: 'AWS CloudTrail' },
      { id: 'c', text: 'AWS Trusted Advisor cost checks' },
      { id: 'd', text: 'Amazon Macie' },
    ],
    correctAnswers: ['a'],
    explanation:
      'IAM Access Analyzer uses automated reasoning to analyze resource-based policies (S3 bucket policies, KMS key policies, IAM role trust policies, etc.) and identifies resources that are accessible from outside the account/organization zone of trust. CloudTrail records API activity after the fact rather than analyzing policy logic, and Macie focuses on sensitive data discovery, not access-path analysis.',
  },
  {
    id: 'iam-007',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A company wants federated employees authenticated by their corporate Active Directory to assume an IAM role in AWS with permissions scoped by their AD group membership, without creating individual IAM users. Which approach is most appropriate?',
    options: [
      { id: 'a', text: 'SAML 2.0 federation from AD FS to an IAM role, using a SAML assertion that maps AD groups to role session attributes' },
      { id: 'b', text: 'Create an individual IAM user for every AD user with matching passwords' },
      { id: 'c', text: 'Share a single IAM access key among all employees' },
      { id: 'd', text: 'Grant the root user credentials to the IT team' },
    ],
    correctAnswers: ['a'],
    explanation:
      'SAML 2.0 federation lets an on-premises identity provider like AD FS issue assertions that IAM trusts to grant temporary role credentials, and attributes in the assertion can be used to scope which role/permissions a session gets based on AD group membership, avoiding IAM user sprawl entirely. Creating IAM users per employee or sharing credentials both violate least-privilege and credential hygiene principles.',
  },
  {
    id: 'iam-008',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A Lambda function\'s execution role currently has AdministratorAccess. A security review flags this as excessive. What is the recommended process to right-size the role\'s permissions?',
    options: [
      { id: 'a', text: 'Use IAM Access Analyzer policy generation based on the CloudTrail activity of the role to generate a least-privilege policy, then test and refine it' },
      { id: 'b', text: 'Leave it as-is since Lambda roles are exempt from least privilege' },
      { id: 'c', text: 'Remove the role entirely so the function has no permissions' },
      { id: 'd', text: 'Grant PowerUserAccess instead, since it is "less" than admin' },
    ],
    correctAnswers: ['a'],
    explanation:
      'IAM Access Analyzer\'s policy generation feature reviews actual CloudTrail activity for a role over a chosen time period and proposes a least-privilege policy reflecting only the actions actually used, which the team can review and refine before applying — a scalable, evidence-based path to right-sizing. Removing the role would break the function, and PowerUserAccess is still far broader than the function likely needs.',
  },
  {
    id: 'iam-009',
    domain: 'Identity and Access Management',
    questionType: 'multi',
    question:
      'Which TWO of the following are effective ways to enforce multi-factor authentication (MFA) for AWS API and console access?',
    options: [
      { id: 'a', text: 'Require MFA in an IAM policy condition (aws:MultiFactorAuthPresent) attached to sensitive actions' },
      { id: 'b', text: 'Enable MFA delete on the root user and IAM users, and use an SCP to deny actions when MFA is not present' },
      { id: 'c', text: 'Disable CloudTrail so MFA usage cannot be tracked' },
      { id: 'd', text: 'Ask users to type their password twice' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'An IAM policy condition checking aws:MultiFactorAuthPresent can deny sensitive actions unless the caller authenticated with MFA, and this pattern can be enforced organization-wide via an SCP as an additional guardrail. Disabling CloudTrail undermines visibility (and is the opposite of a control), and typing a password twice provides no additional factor of authentication.',
  },
  {
    id: 'iam-010',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'An organization has hundreds of AWS accounts and wants new accounts to automatically receive a consistent, secure baseline of IAM guardrails, logging, and account structure (e.g., separate log archive and security accounts) as soon as they are created. Which service should they use to automate this multi-account setup?',
    options: [
      { id: 'a', text: 'AWS Control Tower' },
      { id: 'b', text: 'AWS IAM Access Analyzer' },
      { id: 'c', text: 'Amazon Cognito' },
      { id: 'd', text: 'AWS Certificate Manager' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Control Tower automates the setup of a secure, multi-account landing zone with pre-configured guardrails (implemented as SCPs and Config rules), a dedicated log archive account, and an audit/security account, and applies this baseline automatically to newly vended accounts via Account Factory. Access Analyzer, Cognito, and ACM serve narrower, unrelated purposes.',
  },

  // ---------------------------------------------------------------------
  // Data Protection (dp-002..dp-012)
  // ---------------------------------------------------------------------
  {
    id: 'dp-002',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company must ensure that a KMS customer managed key can never be used by any principal outside a specific list of IAM roles, even if someone attaches an overly permissive IAM policy to another role in the account. Where should this restriction be enforced?',
    options: [
      { id: 'a', text: 'In the KMS key policy, since it is the primary access control mechanism for a KMS key' },
      { id: 'b', text: 'Only in IAM policies attached to each role' },
      { id: 'c', text: 'In an S3 bucket policy' },
      { id: 'd', text: 'In a security group rule' },
    ],
    correctAnswers: ['a'],
    explanation:
      'A KMS key policy is the resource-based policy that always governs access to the key; unless the key policy explicitly grants access via IAM (through a statement delegating to IAM policies), IAM policies alone cannot grant access. Restricting principals in the key policy itself ensures no IAM policy elsewhere in the account can grant unauthorized access to the key.',
  },
  {
    id: 'dp-003',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company wants automatic annual rotation of a KMS customer managed key\'s cryptographic material without needing to update key ARNs, aliases, or references in applications. What should they configure?',
    options: [
      { id: 'a', text: 'Enable automatic key rotation on the customer managed KMS key' },
      { id: 'b', text: 'Manually create a new KMS key every year and update all application references' },
      { id: 'c', text: 'Use SSE-C with a rotating client-supplied key' },
      { id: 'd', text: 'Disable the key and create a new one annually' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Automatic key rotation for a symmetric customer managed KMS key rotates the underlying cryptographic material roughly every year while preserving the key ID/ARN, so no application changes are needed and old ciphertext remains decryptable. Manually creating new keys requires updating every reference and re-encrypting data, which is operationally burdensome.',
  },
  {
    id: 'dp-004',
    domain: 'Data Protection',
    questionType: 'multi',
    question:
      'A company wants to prevent accidental permanent deletion of sensitive data stored in S3, allowing recovery from overwrite or delete operations for at least 90 days. Which TWO S3 features should they enable?',
    options: [
      { id: 'a', text: 'S3 Versioning' },
      { id: 'b', text: 'A lifecycle rule or MFA Delete policy that protects/retains prior versions and requires MFA for permanent deletion' },
      { id: 'c', text: 'S3 Transfer Acceleration' },
      { id: 'd', text: 'S3 Intelligent-Tiering' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'S3 Versioning preserves every version of an object so an overwrite or delete creates a new version/delete marker rather than destroying data, and combining it with MFA Delete (or a lifecycle policy retaining noncurrent versions) protects against accidental or malicious permanent deletion. Transfer Acceleration speeds up uploads and Intelligent-Tiering optimizes storage cost — neither relates to deletion protection.',
  },
  {
    id: 'dp-005',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A data science team needs to discover and classify sensitive data such as PII and credit card numbers stored across dozens of S3 buckets, without manually writing pattern-matching scripts. Which AWS service is purpose-built for this?',
    options: [
      { id: 'a', text: 'Amazon Macie' },
      { id: 'b', text: 'AWS Config' },
      { id: 'c', text: 'Amazon Inspector' },
      { id: 'd', text: 'AWS Trusted Advisor' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Amazon Macie uses machine learning and managed data identifiers to automatically discover, classify, and report on sensitive data (like PII, credentials, and financial data) stored in S3 at scale. Config tracks resource configuration, Inspector assesses software vulnerabilities, and Trusted Advisor provides general best-practice checks — none perform content-based sensitive data classification.',
  },
  {
    id: 'dp-006',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'An application must encrypt data client-side before sending it to S3, so that AWS never has access to the plaintext data or the encryption key, and the company wants to use a managed library rather than build cryptographic code from scratch. What should they use?',
    options: [
      { id: 'a', text: 'The AWS Encryption SDK (or the S3 Encryption Client) with a key stored in KMS or managed entirely outside AWS' },
      { id: 'b', text: 'SSE-S3' },
      { id: 'c', text: 'SSE-KMS' },
      { id: 'd', text: 'S3 Bucket Keys' },
    ],
    correctAnswers: ['a'],
    explanation:
      'The AWS Encryption SDK (and the S3 Encryption Client) perform client-side encryption before data ever leaves the application, so AWS only ever receives ciphertext — this is true client-side encryption using a managed, audited library rather than custom crypto code. SSE-S3 and SSE-KMS are server-side encryption options where AWS handles the encryption operation and therefore has access to plaintext during processing; Bucket Keys are an SSE-KMS cost optimization.',
  },
  {
    id: 'dp-007',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company stores database credentials, API keys, and third-party tokens used by several applications, and wants automatic rotation on a schedule along with fine-grained IAM-based access control and audit logging of every retrieval. Which service is the best fit, rather than storing them as plaintext environment variables?',
    options: [
      { id: 'a', text: 'AWS Secrets Manager' },
      { id: 'b', text: 'AWS Systems Manager Parameter Store Standard tier only' },
      { id: 'c', text: 'A private S3 bucket' },
      { id: 'd', text: 'Hardcoded values in a Lambda deployment package' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Secrets Manager provides native automatic rotation (including built-in Lambda rotation functions for RDS, Redshift, and DocumentDB), fine-grained IAM/resource policies, and CloudTrail-logged access to every secret retrieval. Parameter Store Standard tier lacks built-in automatic rotation, and storing secrets in S3 or hardcoding them lacks rotation and creates significant exposure risk.',
  },
  {
    id: 'dp-008',
    domain: 'Data Protection',
    questionType: 'multi',
    question:
      'A company wants to ensure that data in transit between clients and their Application Load Balancer, as well as between the ALB and backend EC2 instances, is encrypted end-to-end using TLS. Which TWO configurations support this?',
    options: [
      { id: 'a', text: 'Terminate TLS at the ALB using an ACM certificate, and configure an HTTPS listener forwarding to instances' },
      { id: 'b', text: 'Configure the target group to use HTTPS health checks and listener protocol to the backend instances, re-encrypting traffic from the ALB to the targets' },
      { id: 'c', text: 'Use only HTTP throughout, relying on the VPC being private for security' },
      { id: 'd', text: 'Disable the ALB access logs to speed up TLS negotiation' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'True end-to-end encryption requires TLS termination (or pass-through) at the ALB with a valid certificate for the client-facing leg, and a second TLS connection from the ALB to the backend targets, which is achieved by setting the target group protocol to HTTPS. Relying solely on network isolation (HTTP everywhere) does not provide encryption in transit, and access logs have no relationship to TLS negotiation.',
  },
  {
    id: 'dp-009',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A financial services company must ensure that a specific KMS key can only be used to decrypt data when the request originates from within their corporate VPC, never from the public internet, even with valid IAM credentials. How can this be enforced?',
    options: [
      { id: 'a', text: 'Add a condition to the KMS key policy using aws:SourceVpce or aws:SourceVpc to restrict usage to requests through a specific VPC endpoint' },
      { id: 'b', text: 'Rely solely on IAM user passwords being strong' },
      { id: 'c', text: 'Enable S3 bucket versioning' },
      { id: 'd', text: 'Use SSE-S3 instead of SSE-KMS' },
    ],
    correctAnswers: ['a'],
    explanation:
      'A KMS key policy (or IAM policy) condition using aws:SourceVpce (specific VPC endpoint) or aws:SourceVpc restricts key usage to requests that traverse a designated VPC endpoint, effectively blocking use of the key from outside the corporate network even with otherwise-valid credentials. The other options do not enforce a network-origin restriction on key usage.',
  },
  {
    id: 'dp-010',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company operates in a regulated industry and must guarantee that certain highly sensitive data can only be decrypted using key material stored in single-tenant hardware security modules under their exclusive control, meeting FIPS 140-2 Level 3 validation, separate from AWS KMS\'s shared HSM fleet. Which service should they use?',
    options: [
      { id: 'a', text: 'AWS CloudHSM' },
      { id: 'b', text: 'AWS KMS with AWS managed keys' },
      { id: 'c', text: 'Amazon Macie' },
      { id: 'd', text: 'SSE-S3' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS CloudHSM provides single-tenant, customer-controlled FIPS 140-2 Level 3 validated hardware security modules where AWS has no access to key material, meeting the strictest regulatory and exclusivity requirements. KMS (even with customer managed keys) uses a multi-tenant HSM fleet managed by AWS, which does not meet a single-tenant, exclusive-control requirement.',
  },
  {
    id: 'dp-011',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company wants to grant a third-party SaaS vendor the ability to decrypt specific objects encrypted with a customer managed KMS key, without giving the vendor an IAM identity in the company\'s account. What is the standard approach?',
    options: [
      { id: 'a', text: 'Create a grant on the KMS key for the vendor\'s external AWS account/principal, scoped to specific operations' },
      { id: 'b', text: 'Share the company\'s root account credentials with the vendor' },
      { id: 'c', text: 'Email the plaintext KMS key material to the vendor' },
      { id: 'd', text: 'Make the KMS key policy allow "Principal": "*"' },
    ],
    correctAnswers: ['a'],
    explanation:
      'KMS grants allow delegated, scoped, and revocable access to specific cryptographic operations for a specified principal (including an external account), which is the standard controlled way to allow a third party limited use of a key without provisioning an IAM identity for them. Sharing root credentials, emailing key material, or opening the policy to "*" are all severe security anti-patterns.',
  },
  {
    id: 'dp-012',
    domain: 'Data Protection',
    questionType: 'multi',
    question:
      'A security team is reviewing an RDS database that stores customer PII. Which TWO controls should be implemented to protect this data both at rest and in transit?',
    options: [
      { id: 'a', text: 'Enable RDS encryption at rest using a KMS key' },
      { id: 'b', text: 'Enforce SSL/TLS connections to the database using a parameter group setting (e.g., rds.force_ssl) or require_secure_transport' },
      { id: 'c', text: 'Disable automated backups to reduce attack surface' },
      { id: 'd', text: 'Make the RDS instance publicly accessible for easier querying' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'Encryption at rest via a KMS-backed encrypted storage volume protects data on disk (and automated snapshots inherit encryption), while enforcing SSL/TLS connections protects data as it moves between the application and the database. Disabling backups removes a recovery safety net without improving security, and making the database publicly accessible directly increases exposure risk.',
  },

  // ---------------------------------------------------------------------
  // Management and Security Governance (msg-001..msg-009)
  // ---------------------------------------------------------------------
  {
    id: 'msg-001',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A company wants to prevent any account in a specific organizational unit (OU) from launching resources outside the us-east-1 and eu-west-1 regions, regardless of the IAM permissions granted within those accounts. What should they implement?',
    options: [
      { id: 'a', text: 'A Service Control Policy attached to the OU that denies actions unless the request region is in an allowed list' },
      { id: 'b', text: 'An IAM policy attached only to the root user' },
      { id: 'c', text: 'A CloudWatch alarm on region usage' },
      { id: 'd', text: 'A Trusted Advisor check' },
    ],
    correctAnswers: ['a'],
    explanation:
      'A Service Control Policy attached at the OU level, using a condition on aws:RequestedRegion, sets an organization-wide guardrail that denies actions in disallowed regions regardless of local IAM permissions, including for account administrators. IAM policies on the root user do not apply org-wide, and CloudWatch alarms/Trusted Advisor are detective rather than preventive.',
  },
  {
    id: 'msg-002',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A company needs to demonstrate to an auditor that a set of resources across multiple accounts continuously complies with a defined security baseline (e.g., encrypted EBS volumes, no public S3 buckets) and wants automated, ongoing compliance evaluation rather than periodic manual review. What should they deploy?',
    options: [
      { id: 'a', text: 'AWS Config Rules (potentially bundled as a conformance pack) with an aggregator across accounts' },
      { id: 'b', text: 'A quarterly manual spreadsheet audit' },
      { id: 'c', text: 'IAM Access Analyzer only' },
      { id: 'd', text: 'Amazon CloudWatch Synthetics canaries' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Config Rules continuously evaluate resource configurations against defined baselines, conformance packs bundle related rules for a compliance framework, and an aggregator provides a multi-account, multi-region compliance view — exactly the automated, ongoing evaluation needed for audit evidence. Manual spreadsheets are not continuous, and Access Analyzer/Synthetics address different concerns (external access analysis and endpoint monitoring, respectively).',
  },
  {
    id: 'msg-003',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'AWS Artifact is primarily used for which of the following purposes?',
    options: [
      { id: 'a', text: 'On-demand access to AWS compliance reports (e.g., SOC, PCI, ISO) and accepting agreements like the Business Associate Addendum' },
      { id: 'b', text: 'Storing customer application artifacts like container images' },
      { id: 'c', text: 'Running vulnerability scans on EC2 instances' },
      { id: 'd', text: 'Managing IAM policies' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Artifact is the self-service portal for downloading AWS compliance and security reports (SOC 1/2/3, PCI DSS, ISO certifications) and for reviewing/accepting agreements such as the HIPAA Business Associate Addendum (BAA), supporting the customer\'s own audit and compliance efforts. It does not store application artifacts, run scans, or manage IAM.',
  },
  {
    id: 'msg-004',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'Under the AWS Shared Responsibility Model, who is responsible for patching the underlying hypervisor and physical host infrastructure for Amazon EC2?',
    options: [
      { id: 'a', text: 'AWS, as part of "security of the cloud"' },
      { id: 'b', text: 'The customer, as part of "security in the cloud"' },
      { id: 'c', text: 'A shared responsibility split evenly between AWS and the customer for every layer' },
      { id: 'd', text: 'The customer\'s chosen third-party auditor' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS is responsible for "security of the cloud," which includes the physical infrastructure, host operating system, and hypervisor layer for EC2. The customer is responsible for "security in the cloud" — guest OS patching, application software, network/firewall configuration, and IAM — for infrastructure-as-a-service offerings like EC2.',
  },
  {
    id: 'msg-005',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A company wants newly created member accounts in its AWS Organization to automatically have specific preventive guardrails applied (e.g., "deny leaving the organization," "deny disabling GuardDuty") the moment the account is created, without manual follow-up steps. What is the best approach?',
    options: [
      { id: 'a', text: 'Attach the SCPs to the OU that new accounts are automatically placed into at creation time' },
      { id: 'b', text: 'Manually attach the SCP to each account after creation' },
      { id: 'c', text: 'Send an email reminder to attach the SCP' },
      { id: 'd', text: 'Rely on IAM policies configured by each account owner' },
    ],
    correctAnswers: ['a'],
    explanation:
      'By attaching SCPs to an OU and ensuring new accounts are vended into that OU by default (e.g., via Control Tower Account Factory or an automated account-vending pipeline), the guardrails apply immediately and automatically without manual, error-prone follow-up steps. Manual attachment or reminders introduce a window of non-compliance, and account-owner-configured IAM policies are not centrally enforced guardrails.',
  },
  {
    id: 'msg-006',
    domain: 'Management and Security Governance',
    questionType: 'multi',
    question:
      'Which TWO statements accurately describe AWS Organizations Service Control Policies (SCPs)?',
    options: [
      { id: 'a', text: 'SCPs set the maximum available permissions for an account but do not by themselves grant permissions' },
      { id: 'b', text: 'SCPs affect all IAM users and roles in the account, including the account root user' },
      { id: 'c', text: 'SCPs can grant permissions even if no IAM policy allows the action' },
      { id: 'd', text: 'SCPs apply only to IAM users, never to roles' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'SCPs act as a filter/ceiling on permissions — they never grant permissions on their own, only IAM/resource-based policies grant permissions — and they apply to every principal in the affected account, including the root user. An identity still needs an actual IAM allow to perform an action even if the SCP permits it, and SCPs apply to both users and roles.',
  },
  {
    id: 'msg-007',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A security team wants a single, centrally managed view of GuardDuty, Security Hub, and Detective findings and configuration across every account in a large AWS Organization, with the ability to designate one account to administer these services for all others without switching roles constantly. What AWS Organizations feature enables this?',
    options: [
      { id: 'a', text: 'Delegated administrator' },
      { id: 'b', text: 'Consolidated billing only' },
      { id: 'c', text: 'Cross-account IAM roles created manually in each account' },
      { id: 'd', text: 'AWS Budgets' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Organizations supports designating a delegated administrator account for security services like GuardDuty, Security Hub, Macie, and Detective, allowing that account to centrally manage configuration and view findings across all member accounts without needing to assume a role into each one individually. Consolidated billing addresses cost management only, and manually created cross-account roles do not provide the native centralized administration these services offer.',
  },
  {
    id: 'msg-008',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A company is preparing for a PCI DSS audit and wants to quickly check their AWS environment against a pre-built collection of AWS Config rules mapped to PCI DSS requirements, rather than manually selecting each individual rule. What should they use?',
    options: [
      { id: 'a', text: 'An AWS Config conformance pack for PCI DSS' },
      { id: 'b', text: 'AWS Budgets' },
      { id: 'c', text: 'Amazon CloudWatch Logs Insights' },
      { id: 'd', text: 'AWS Cost Explorer' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS Config conformance packs are pre-built (or custom) collections of Config rules and remediation actions, including sample packs aligned to common frameworks like PCI DSS, that can be deployed as a single unit across an account or organization for compliance evaluation. Budgets, Logs Insights, and Cost Explorer are unrelated to compliance rule evaluation.',
  },
  {
    id: 'msg-009',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'Under the AWS Shared Responsibility Model, for a fully managed service like Amazon RDS, which of the following remains the customer\'s responsibility?',
    options: [
      { id: 'a', text: 'Configuring security groups, database-level user accounts/permissions, and enabling encryption options' },
      { id: 'b', text: 'Patching the underlying database engine binaries entirely' },
      { id: 'c', text: 'Replacing failed physical disks' },
      { id: 'd', text: 'Managing the physical data center security' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Even for managed services like RDS, the customer remains responsible for configuring network access controls (security groups), managing database-level users/permissions, and choosing to enable features like encryption at rest and in transit. AWS handles underlying engine patching orchestration (though the customer selects maintenance windows), physical hardware maintenance, and data center security as part of its "security of the cloud" responsibilities.',
  },
]
