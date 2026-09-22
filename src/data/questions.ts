import type { Question } from '@/types/quiz'

export const questions: Question[] = [
  // ---------------------------------------------------------------------
  // Threat Detection and Incident Response (td-001..td-009)
  // ---------------------------------------------------------------------
  {
    id: 'td-001',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A media streaming startup runs a fleet of EC2 instances, some recently migrated to Graviton processors to cut compute costs by roughly 20%. GuardDuty raises a finding of type Backdoor:EC2/C&CActivity.B!DNS on one instance, indicating it is communicating with known command-and-control infrastructure. The instance is currently serving live production traffic and cannot be taken offline for a lengthy scan. The security team needs to determine whether the attached EBS volumes contain malware with the least operational overhead and without impacting the running workload.',
    options: [
      { id: 'a', text: 'Use Amazon Inspector\'s network reachability analysis to inspect the instance' },
      { id: 'b', text: 'Enable GuardDuty Malware Protection for EC2, which snapshots the attached EBS volumes and scans them agentlessly' },
      { id: 'c', text: 'Install a third-party EDR agent on the instance and run a full on-host scan' },
      { id: 'd', text: 'Open a case in Amazon Detective to review the instance\'s finding history' },
    ],
    correctAnswers: ['b'],
    explanation:
      'GuardDuty Malware Protection for EC2 automatically snapshots the volumes attached to an implicated instance and scans them agentlessly, adding no load to the running workload. Installing an EDR agent is a technically valid way to find malware, but it requires deploying new software and consumes host resources on a live production instance, violating the "least operational overhead / no impact" constraint; Inspector assesses vulnerabilities and network reachability rather than malware, and Detective visualizes existing findings rather than scanning for malware.',
  },
  {
    id: 'td-002',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A logistics company\'s SOC receives a GuardDuty finding that an EC2 instance handling shipment-tracking data was likely compromised via a web application vulnerability. The instance is tagged with a cost-allocation tag showing it costs $0.42/hour to run, a detail the FinOps team flagged in an unrelated report. The responder must preserve evidence, including RAM contents where possible, and cut the instance off from the rest of the network as quickly as possible, and the instance must not be powered off because a memory-resident implant is suspected.',
    options: [
      { id: 'a', text: 'Immediately terminate the instance and restore the application from the last known-good AMI' },
      { id: 'b', text: 'Stop the instance to freeze it in its current state before investigating' },
      { id: 'c', text: 'Take an EBS snapshot of the attached volumes, then move the instance\'s network interface to an isolated security group with no inbound or outbound rules' },
      { id: 'd', text: 'Reboot the instance and monitor GuardDuty until the finding clears' },
    ],
    correctAnswers: ['c'],
    explanation:
      'Snapshotting the volumes preserves disk evidence, and moving the ENI to an isolated security group with no rules contains the instance at the network layer without powering it off, preserving RAM contents. Stopping the instance sounds like it "freezes" the situation, but it deallocates the underlying host and destroys volatile memory; terminating destroys evidence outright, and rebooting risks triggering anti-forensic or destructive behavior in the implant.',
  },
  {
    id: 'td-003',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A fleet of EC2 instances in an Auto Scaling group shares a single IAM role. GuardDuty raises UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS for the temporary credentials associated with one specific instance in that fleet. The security team must invalidate the exfiltrated credentials immediately, without disrupting the dozens of other healthy instances currently relying on the same IAM role.',
    options: [
      { id: 'a', text: 'Delete the IAM role used by the Auto Scaling group' },
      { id: 'b', text: 'Stop or terminate the affected EC2 instance' },
      { id: 'c', text: 'Detach and reattach the instance profile on the Auto Scaling group\'s launch template' },
      { id: 'd', text: 'Use IAM\'s revoke active sessions capability on the role to deny requests using credentials issued before the current time' },
    ],
    correctAnswers: ['d'],
    explanation:
      'Revoking active sessions attaches a policy denying any request using credentials issued before now, immediately invalidating the exfiltrated session while the role stays intact so other instances simply obtain fresh credentials. Stopping or terminating only the affected instance sounds like it removes the threat, but temporary credentials already exfiltrated off-box remain valid elsewhere until they naturally expire; deleting or reattaching the role disrupts the entire fleet unnecessarily.',
  },
  {
    id: 'td-004',
    domain: 'Threat Detection and Incident Response',
    questionType: 'multi',
    question:
      'A team wants a GuardDuty finding to automatically trigger a Lambda remediation function within seconds, and specifically wants to avoid building and maintaining a Lambda that polls the GuardDuty API on a schedule to check for new findings. Select the TWO event-driven (non-polling) mechanisms that satisfy this.',
    options: [
      { id: 'a', text: 'A CloudWatch cron-scheduled Lambda that calls GetFindings every 5 minutes' },
      { id: 'b', text: 'An EventBridge rule matching GuardDuty finding events, targeting the remediation Lambda directly' },
      { id: 'c', text: 'AWS Security Hub custom actions combined with an EventBridge rule that targets the Lambda' },
      { id: 'd', text: 'AWS Trusted Advisor scheduled refresh notifications' },
    ],
    correctAnswers: ['b', 'c'],
    explanation:
      'GuardDuty findings are published natively to EventBridge, so a rule can invoke the Lambda directly, and findings forwarded to Security Hub can trigger the same Lambda via a custom action plus an EventBridge rule. The scheduled polling Lambda would technically work but is exactly the polling-based approach the team wants to avoid, and Trusted Advisor is unrelated to GuardDuty findings.',
  },
  {
    id: 'td-005',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A company runs a separate on-premises SIEM with a 2 TB/day ingestion capacity, a detail that has no bearing on which AWS service centralizes findings within AWS itself. The security team wants a single, prioritized view of findings from GuardDuty, Inspector, Macie, and supported third-party tools normalized into the AWS Security Finding Format (ASFF), without building custom ETL to pull from each service\'s own API.',
    options: [
      { id: 'a', text: 'AWS Security Hub, configured to ingest findings from GuardDuty, Inspector, Macie, and third-party partners in ASFF' },
      { id: 'b', text: 'AWS Systems Manager OpsCenter' },
      { id: 'c', text: 'An AWS Config aggregator across the organization' },
      { id: 'd', text: 'A set of custom CloudWatch dashboards fed by Lambda functions polling each service\'s API' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Security Hub natively aggregates and normalizes findings from GuardDuty, Inspector, Macie, and supported partners into ASFF without custom integration work. OpsCenter aggregates operational items rather than security findings, a Config aggregator consolidates configuration compliance rather than security findings, and the custom dashboard approach is exactly the bespoke ETL the team wants to avoid.',
  },
  {
    id: 'td-006',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A security team wants to detect anomalous S3 access patterns, such as access from a Tor exit node, by analyzing behavior rather than data content, and explicitly does not want to run Macie\'s sensitive-data classification jobs since the team only cares about access behavior, not what the data contains.',
    options: [
      { id: 'a', text: 'Enable the AWS Config recorder scoped to S3 buckets' },
      { id: 'b', text: 'Enable GuardDuty S3 Protection to analyze CloudTrail S3 data events for anomalous access' },
      { id: 'c', text: 'Run Amazon Macie classification jobs against the buckets' },
      { id: 'd', text: 'Enable VPC Flow Logs on the VPC endpoint used to reach S3' },
    ],
    correctAnswers: ['b'],
    explanation:
      'GuardDuty S3 Protection ingests CloudTrail S3 data events to flag behavioral anomalies like access from suspicious IP infrastructure, without inspecting the data itself. Macie would technically flag some risk indicators, but it does so through content classification, which the team explicitly ruled out; Config tracks configuration rather than access patterns, and Flow Logs on the endpoint capture only network metadata, not S3 API-level behavior.',
  },
  {
    id: 'td-007',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'A team already pays for a CloudTrail Lake subscription used for a separate compliance-reporting workflow. During an active investigation, an analyst wants to visually pivot across the relationships between IAM roles, EC2 instances, and API calls surrounding a GuardDuty finding, without writing custom SQL against raw event history.',
    options: [
      { id: 'a', text: 'AWS Config\'s resource configuration timeline' },
      { id: 'b', text: 'CloudTrail Lake, writing hand-crafted SQL queries against the event data store' },
      { id: 'c', text: 'Amazon Detective\'s behavior graph, built from VPC Flow Logs, CloudTrail, and GuardDuty findings' },
      { id: 'd', text: 'The AWS X-Ray service map for the application' },
    ],
    correctAnswers: ['c'],
    explanation:
      'Detective automatically builds a graph model from multiple log sources and lets an analyst visually pivot through entities and timelines without writing queries. CloudTrail Lake could technically answer many of the same questions, but only by writing and maintaining custom SQL, which the analyst wants to avoid; Config tracks configuration history and X-Ray traces application requests, neither of which models security entity relationships.',
  },
  {
    id: 'td-008',
    domain: 'Threat Detection and Incident Response',
    questionType: 'multi',
    question:
      'GuardDuty raises UnauthorizedAccess:IAMUser/MaliciousIPCaller.Custom for an IAM user whose credentials are believed compromised. The response must not disable the organization\'s centralized CloudTrail trail, since doing so would blind the security team to further attacker activity. Select the TWO actions that should be part of the response.',
    options: [
      { id: 'a', text: 'Grant the principal AdministratorAccess so the security team can investigate using its exact permission set' },
      { id: 'b', text: 'Disable the organization\'s CloudTrail trail to prevent the attacker from generating more logged actions' },
      { id: 'c', text: 'Rotate or revoke the compromised credentials and terminate any active sessions immediately' },
      { id: 'd', text: 'Attach an explicit-deny policy to the principal, or disable its access keys, to contain it while the investigation continues' },
    ],
    correctAnswers: ['c', 'd'],
    explanation:
      'Containing a compromised identity means invalidating the leaked credentials/sessions and cutting off its ability to act, which (c) and (d) accomplish without touching logging. Disabling the trail is explicitly ruled out by the stated constraint and destroys the team\'s own visibility, and granting more privileges is the opposite of containment.',
  },
  {
    id: 'td-009',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'After containing a compromise, a security team wants to check whether other instances in a fleet share the same exploitable, unpatched package that likely enabled the initial breach. The fleet spans two regions and is billed largely under a Savings Plan covering 70% of usage, a detail unrelated to the security decision. The team wants continuous, low-overhead vulnerability and network-reachability assessment across EC2 and ECR without deploying a separate third-party scanning agent.',
    options: [
      { id: 'a', text: 'Deploy a third-party CVE scanner agent to every instance via Systems Manager' },
      { id: 'b', text: 'Use AWS Config rules to check installed package versions' },
      { id: 'c', text: 'Rely solely on GuardDuty Malware Protection findings' },
      { id: 'd', text: 'Enable Amazon Inspector, which uses the existing SSM Agent to continuously scan EC2 instances and ECR images for known CVEs and network reachability issues' },
    ],
    correctAnswers: ['d'],
    explanation:
      'Inspector reuses the SSM Agent already present on managed instances to continuously assess CVEs and network exposure without deploying a new agent. A third-party scanner could work but adds a new agent and vendor to operate, violating the low-overhead constraint; Config isn\'t a CVE-aware vulnerability scanner, and GuardDuty Malware Protection detects malware, not unpatched software vulnerabilities.',
  },

  // ---------------------------------------------------------------------
  // Security Logging and Monitoring (slm-001..slm-012)
  // ---------------------------------------------------------------------
  {
    id: 'slm-001',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A healthcare company must retain CloudTrail logs for 7 years and guarantee they cannot be deleted or altered by anyone, including the account\'s own root user, until the retention period lapses. The logging bucket sits in the same account as production workloads, which are separately backed up nightly to EBS snapshots for an unrelated disaster-recovery purpose. Which configuration meets the tamper-proofing requirement?',
    options: [
      { id: 'a', text: 'Enable S3 Object Lock in compliance mode on the CloudTrail destination bucket with a 7-year retention period' },
      { id: 'b', text: 'Apply a bucket policy that denies s3:DeleteObject to every principal except a designated administrators group' },
      { id: 'c', text: 'Enable S3 Versioning alone on the bucket' },
      { id: 'd', text: 'Copy the logs nightly to an EBS volume attached to a stopped EC2 instance' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Object Lock in compliance mode enforces WORM protection that not even the root user can override until the retention period expires. A deny bucket policy sounds protective, but anyone able to modify IAM or the bucket policy itself (including the excluded administrators) can still ultimately remove the protection; versioning alone still allows a sufficiently privileged principal to permanently delete versions, and EBS on a stopped instance is neither durable nor tamper-proof.',
  },
  {
    id: 'slm-002',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A team is investigating whether a specific IAM role called GetObject and PutObject against a bucket of order invoices. CloudTrail is already enabled with the default trail, which also separately streams to a third-party SIEM billed per GB ingested, a cost detail unrelated to this investigation. Which CloudTrail capability, once enabled, captures this object-level activity?',
    options: [
      { id: 'a', text: 'CloudTrail Insights, since it detects unusual account activity' },
      { id: 'b', text: 'CloudTrail data events scoped to the S3 bucket' },
      { id: 'c', text: 'CloudTrail management events, which are enabled by default' },
      { id: 'd', text: 'CloudTrail Lake\'s default dashboard view' },
    ],
    correctAnswers: ['b'],
    explanation:
      'Data events record object-level (data-plane) API activity such as GetObject/PutObject and must be explicitly enabled per resource. Insights sounds relevant since it flags unusual activity, but it analyzes management-event call volume/error-rate anomalies, not individual object-level calls; management events cover control-plane operations like CreateBucket, not GetObject/PutObject, and CloudTrail Lake\'s dashboard is a query interface, not a distinct capture mechanism.',
  },
  {
    id: 'slm-003',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A security engineer discovers CloudTrail logging was disabled in one member account of a 40-account Organization, apparently to hide unauthorized IAM changes. The management account separately has an AWS Budgets alert configured for spend above $50,000/month, unrelated to this incident. The engineer wants a control that prevents any member account, including its own administrators, from disabling organization-wide logging going forward.',
    options: [
      { id: 'a', text: 'Ask each account owner to manually re-enable CloudTrail and commit not to disable it again' },
      { id: 'b', text: 'Enable AWS Config in every account to detect when logging is disabled' },
      { id: 'c', text: 'Create an organization trail in the management account with "apply trail to all accounts" enabled, which member accounts cannot modify or disable locally' },
      { id: 'd', text: 'Enable GuardDuty in every member account to flag the change' },
    ],
    correctAnswers: ['c'],
    explanation:
      'An organization trail applied to all accounts is centrally enforced and cannot be altered or disabled by member-account principals. Config would detect the drift, but only after the fact, which does not prevent it as required; manual promises are unenforceable, and GuardDuty does not control or protect CloudTrail configuration.',
  },
  {
    id: 'slm-004',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A compliance team wants to know within minutes if someone calls StopLogging or DeleteTrail against the organization\'s central CloudTrail trail. The team separately reviews Cost Explorer weekly as part of a routine, unrelated FinOps ritual. What is the most direct way to get near-real-time alerting on this specific event?',
    options: [
      { id: 'a', text: 'Wait for the next AWS Config compliance evaluation cycle to flag the drift' },
      { id: 'b', text: 'Review Cost Explorer reports for anomalies during the weekly review' },
      { id: 'c', text: 'Enable S3 Storage Lens on the log bucket' },
      { id: 'd', text: 'Create a CloudWatch metric filter and alarm on the CloudTrail log group matching StopLogging/DeleteTrail events, notifying via SNS' },
    ],
    correctAnswers: ['d'],
    explanation:
      'A metric filter on the CloudTrail-fed CloudWatch Logs group combined with an alarm and SNS notification delivers near-real-time alerting on the specific API calls. Config would eventually catch the drift, but its evaluation cadence is not immediate; Storage Lens and Cost Explorer address storage analytics and cost, not this security event.',
  },
  {
    id: 'slm-005',
    domain: 'Security Logging and Monitoring',
    questionType: 'multi',
    question:
      'A retailer\'s security team suspects a compromised host inside a VPC is exfiltrating data via DNS tunneling to an external domain while also probing internal hosts on non-standard ports. The team already has AWS Config enabled to track EC2 configuration drift, which will not directly help with this investigation. Select the TWO log sources that should be enabled.',
    options: [
      { id: 'a', text: 'IAM Access Analyzer external access findings' },
      { id: 'b', text: 'VPC Flow Logs, to see IP-level traffic patterns and non-standard port activity between hosts' },
      { id: 'c', text: 'AWS Trusted Advisor security checks' },
      { id: 'd', text: 'Route 53 Resolver query logging, to see DNS queries made from within the VPC, including tunneling-style lookups' },
    ],
    correctAnswers: ['b', 'd'],
    explanation:
      'Flow Logs expose the unusual port-scanning traffic pattern and Resolver query logs expose the DNS queries needed to spot tunneling/exfiltration, together covering both suspected behaviors. Access Analyzer and Trusted Advisor address external resource exposure and best-practice checks, neither of which surfaces network traffic or DNS query content.',
  },
  {
    id: 'slm-006',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A security analyst needs to run ad hoc SQL queries across a full year of CloudTrail event history to trace a slow-moving reconnaissance campaign, without provisioning or managing an Athena table, a Glue crawler, or an S3 lifecycle policy. The team separately uses CloudWatch Logs Insights daily to monitor application error rates, an unrelated data source. Which capability best fits the analyst\'s need?',
    options: [
      { id: 'a', text: 'CloudTrail Lake, which stores events in a managed, queryable event data store supporting SQL-based queries over a configurable retention window' },
      { id: 'b', text: 'CloudWatch Logs Insights run against the raw CloudTrail S3 bucket' },
      { id: 'c', text: 'AWS Config\'s advanced query feature' },
      { id: 'd', text: 'S3 Select run against each log file individually' },
    ],
    correctAnswers: ['a'],
    explanation:
      'CloudTrail Lake is a managed, SQL-queryable event data store purpose-built for this kind of historical analysis without separate Athena/Glue infrastructure. S3 Select can technically query object content, but only one object at a time, making ad hoc analysis across a year of files impractical; Logs Insights queries log groups rather than S3 objects, and Config\'s advanced queries operate on configuration state, not CloudTrail events.',
  },
  {
    id: 'slm-007',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A compliance officer must determine exactly which IAM principal, source IP, and API operations were used against a specific KMS key over the last 90 days, across the management account and every linked member account. The company also runs weekly Macie scans against several S3 buckets for PII, a program unrelated to this specific request. Where should the officer look first?',
    options: [
      { id: 'a', text: 'VPC Flow Logs for the subnets hosting the calling application' },
      { id: 'b', text: 'CloudTrail event history filtered to the KMS event source, correlated across accounts via an organization trail or CloudTrail Lake' },
      { id: 'c', text: 'Amazon Macie findings for the relevant buckets' },
      { id: 'd', text: 'AWS Config\'s resource configuration timeline for the key' },
    ],
    correctAnswers: ['b'],
    explanation:
      'CloudTrail records every KMS API call along with the calling principal, source IP, and parameters, which is exactly what a key-usage audit requires. Config\'s timeline shows configuration changes to the key itself but not who invoked which cryptographic operation, VPC Flow Logs capture only network metadata, and Macie is unrelated to key-usage auditing.',
  },
  {
    id: 'slm-008',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A security team wants to be notified via SNS the moment an S3 bucket\'s configuration drifts out of compliance with a rule requiring public access to be blocked. The team already publishes a monthly conformance pack compliance score to a leadership dashboard, a lagging aggregate metric rather than an alert. What should they configure for near-real-time notification of this specific change?',
    options: [
      { id: 'a', text: 'A Config resource inventory export to S3, reviewed daily' },
      { id: 'b', text: 'A Config aggregator dashboard for the organization' },
      { id: 'c', text: 'An AWS Config Rule for the bucket setting, combined with an EventBridge rule matching its compliance-change event, targeting an SNS topic' },
      { id: 'd', text: 'The existing conformance pack compliance score, reviewed monthly' },
    ],
    correctAnswers: ['c'],
    explanation:
      'A Config Rule paired with an EventBridge rule on compliance-change events, targeting SNS, delivers near-real-time alerting on the specific drift. The monthly score is explicitly described as lagging, and the inventory export and aggregator dashboard are passive reporting tools rather than alerting mechanisms.',
  },
  {
    id: 'slm-009',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A security team operating a multi-account Organization wants CloudWatch Logs events from dozens of accounts to reach their external SIEM within seconds of being written, not batched hourly. The company also uses a Config aggregator to centralize compliance data, an unrelated reporting need. What AWS-native mechanism should stream the log events?',
    options: [
      { id: 'a', text: 'A scheduled Lambda function that exports CloudWatch Logs to S3 every 15 minutes' },
      { id: 'b', text: 'AWS Config forwarding rules' },
      { id: 'c', text: 'Manually downloading logs via the console daily' },
      { id: 'd', text: 'A CloudWatch Logs subscription filter delivering matching log events to Kinesis Data Streams or Kinesis Data Firehose in near real time' },
    ],
    correctAnswers: ['d'],
    explanation:
      'A subscription filter streaming to Kinesis is the standard near-real-time forwarding pattern to an external SIEM. A scheduled export Lambda could work, but it batches on a fixed interval rather than streaming continuously; Config has no log-forwarding capability, and manual downloads are neither timely nor scalable.',
  },
  {
    id: 'slm-010',
    domain: 'Security Logging and Monitoring',
    questionType: 'multi',
    question:
      'A security architect is designing centralized logging for a 200-account Organization ahead of a SOC 2 audit. Engineering leadership has separately asked for an initiative to cut EC2 costs by 10% through Savings Plans, unrelated to this logging design. Select the TWO recommended practices.',
    options: [
      { id: 'a', text: 'Deliver logs from every member account to a dedicated, tightly access-restricted logging account' },
      { id: 'b', text: 'Store logs only in the account that generated them, to simplify IAM' },
      { id: 'c', text: 'Enable monitoring (e.g., CloudTrail data events or S3 server access logging) on the central log bucket itself, to detect unauthorized access to the logs' },
      { id: 'd', text: 'Grant every engineer read/write access to the central log bucket so they can self-serve troubleshooting' },
    ],
    correctAnswers: ['a', 'c'],
    explanation:
      'Centralizing logs into a dedicated, restricted account reduces blast radius if a workload account is compromised, and monitoring access to the log bucket itself closes the loop on tampering detection. Keeping logs only in the source account undermines availability during an incident in that account, and broad engineer write access to the central bucket defeats the purpose of restricting it.',
  },
  {
    id: 'slm-011',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'A team wants to understand both the functional difference between a CloudTrail management event and a CloudTrail Insight event, to decide whether enabling Insights would help detect a spike in IAM policy changes, and the correct billing model for management events ahead of a budget review.',
    options: [
      { id: 'a', text: 'Management events log control-plane API calls as they occur, while Insight events separately analyze that activity to flag anomalies such as unusual API call volume or error-rate spikes; one copy of management events is delivered free to one trail per region, with additional trails, data events, and Insights events billed separately' },
      { id: 'b', text: 'Insight events are free while management events always incur cost regardless of configuration' },
      { id: 'c', text: 'There is no meaningful difference; both simply log that an API call occurred' },
      { id: 'd', text: 'Management events only cover S3 API calls, while Insight events cover every AWS service' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Management events are the raw record of control-plane calls, while Insights performs separate anomaly analysis on top of that activity; AWS delivers one free copy of management events to one trail per region, and bills separately for additional trails, data events, and Insights. The other options invert or misstate both the functional distinction and the billing model.',
  },
  {
    id: 'slm-012',
    domain: 'Security Logging and Monitoring',
    questionType: 'single',
    question:
      'An auditor reviewing VPC Flow Logs six months after they were enabled on a critical subnet notices repeated REJECT entries for traffic between two instances that application owners insist should communicate freely. The subnet\'s route table has not changed during that period, and the instances\' IAM roles have AdministratorAccess, which the auditor initially suspected was the cause. Which resource is actually responsible for a REJECT action recorded in a VPC Flow Log?',
    options: [
      { id: 'a', text: 'An S3 bucket policy attached to an unrelated bucket' },
      { id: 'b', text: 'A security group or network ACL denying the traffic at the network layer' },
      { id: 'c', text: 'The instances\' IAM role permissions, such as the AdministratorAccess policy mentioned' },
      { id: 'd', text: 'A KMS key policy applied to an encrypted EBS volume' },
    ],
    correctAnswers: ['b'],
    explanation:
      'Flow Log REJECT entries specifically reflect network-layer accept/reject decisions made by security groups or NACLs. AdministratorAccess sounds like a strong candidate since it was the auditor\'s first suspicion, but IAM permissions govern API-level authorization, not packet-level filtering, and neither a bucket policy nor a KMS key policy affects network traffic recorded in flow logs.',
  },

  // ---------------------------------------------------------------------
  // Infrastructure Security (is-001..is-013)
  // ---------------------------------------------------------------------
  {
    id: 'is-001',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A fintech company runs EC2 instances in private subnets that must call the S3 and DynamoDB APIs to process settlement files, never traversing the public internet. The workload handles roughly 4 million requests per day, a volume detail with no bearing on which connectivity option is appropriate. Leadership wants this connectivity to add the least possible ongoing AWS cost.',
    options: [
      { id: 'a', text: 'Deploy a NAT gateway in each private subnet' },
      { id: 'b', text: 'Create interface VPC endpoints (PrivateLink) for S3 and DynamoDB' },
      { id: 'c', text: 'Configure gateway VPC endpoints for S3 and DynamoDB' },
      { id: 'd', text: 'Attach an internet gateway to the private subnets and restrict traffic with security groups' },
    ],
    correctAnswers: ['c'],
    explanation:
      'Gateway VPC endpoints for S3 and DynamoDB route traffic privately via route table entries with no hourly or per-GB charge. Interface endpoints would also keep traffic private, but they bill hourly per endpoint per AZ plus data processing, making them the costlier of the two valid private options; NAT gateways add both hourly and per-GB charges, and attaching an internet gateway defeats the no-internet requirement entirely.',
  },
  {
    id: 'is-002',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'In a VPC that also happens to have S3 Transfer Acceleration enabled for an unrelated upload pipeline, a network engineer observes that return traffic to an external client is evaluated rule-by-rule in numbered order at the subnet boundary for both directions, while traffic between two instances in the same subnet is automatically allowed back once an initial rule permits it, with no explicit return rule needed. Which statement correctly explains this behavior?',
    options: [
      { id: 'a', text: 'Security groups are stateless; network ACLs are stateful' },
      { id: 'b', text: 'Both controls are stateless and require explicit outbound allow rules for return traffic' },
      { id: 'c', text: 'Network ACLs apply to individual instances while security groups apply to entire subnets' },
      { id: 'd', text: 'Security groups are stateful and evaluate all applicable allow rules at the instance/ENI level, while network ACLs are stateless and evaluate numbered rules in order at the subnet level' },
    ],
    correctAnswers: ['d'],
    explanation:
      'Security groups automatically permit return traffic (stateful) at the ENI level, while NACLs require explicit rules for both directions (stateless) and are evaluated in numbered order at the subnet level, exactly matching the observed behavior. The other options reverse or misassign these properties.',
  },
  {
    id: 'is-003',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'An application behind an ALB is receiving repeated SQL injection attempts from a rotating range of source IPs. A marketing team separately manages a CloudFront distribution for static assets, unrelated to this incident. The security team wants to block the malicious requests before they reach the application, with the least ongoing operational overhead, rather than building and maintaining custom detection logic themselves.',
    options: [
      { id: 'a', text: 'Associate AWS WAF with the ALB and enable a managed rule group that includes SQL injection protection' },
      { id: 'b', text: 'Write a custom Lambda@Edge function that inspects each request body for SQL injection patterns' },
      { id: 'c', text: 'Enable AWS Shield Standard on the ALB' },
      { id: 'd', text: 'Add a network ACL rule blocking inbound port 443 from the observed IP ranges' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS WAF\'s managed rule groups provide maintained SQL injection detection with minimal ongoing effort. A custom Lambda@Edge inspector could technically work, but it requires the team to build and maintain their own detection logic, violating the low-overhead constraint; Shield Standard addresses network/transport-layer DDoS, not Layer 7 content inspection, and blocking specific IPs at the NACL doesn\'t scale against rotating source addresses and blocks all traffic from them, not just malicious requests.',
  },
  {
    id: 'is-004',
    domain: 'Infrastructure Security',
    questionType: 'multi',
    question:
      'A gaming company bracing for a launch-day traffic surge wants strong protection against large-scale volumetric DDoS attacks, direct access to AWS\'s 24/7 DDoS Response Team during an active attack, and cost protection for scaling charges an attack might cause. The company currently has AWS Basic Support, which includes no technical account manager. Select the TWO things required to obtain all of the stated capabilities.',
    options: [
      { id: 'a', text: 'AWS Shield Advanced, subscribed on the relevant resources' },
      { id: 'b', text: 'AWS Shield Standard only, which is included automatically for all customers' },
      { id: 'c', text: 'Amazon Macie enabled on the account' },
      { id: 'd', text: 'An AWS Business or Enterprise Support plan, required to directly engage the Shield Response Team' },
    ],
    correctAnswers: ['a', 'd'],
    explanation:
      'Shield Advanced provides the enhanced protection and cost protection, but direct engagement with the Shield Response Team additionally requires a Business or Enterprise Support plan. Shield Standard alone provides only baseline network/transport-layer protection with no DRT access or cost protection, and Macie is unrelated to DDoS mitigation.',
  },
  {
    id: 'is-005',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A manufacturing company wants its on-premises factory-floor systems to reach VPC resources over a dedicated, private, high-bandwidth connection that avoids the public internet entirely, rather than an encrypted tunnel that still rides over it. The company\'s marketing site is served through CloudFront, unrelated to this connectivity requirement.',
    options: [
      { id: 'a', text: 'AWS PrivateLink, provisioned as an interface endpoint' },
      { id: 'b', text: 'AWS Direct Connect' },
      { id: 'c', text: 'A site-to-site VPN over the public internet' },
      { id: 'd', text: 'Amazon CloudFront with a custom origin' },
    ],
    correctAnswers: ['b'],
    explanation:
      'Direct Connect provides a dedicated private link between on-premises infrastructure and AWS that never traverses the public internet. A site-to-site VPN would also connect the two networks and encrypts the traffic, but it still rides over the public internet, which the requirement explicitly rules out; PrivateLink connects to specific services rather than an entire on-prem network, and CloudFront is a CDN, not a private network link.',
  },
  {
    id: 'is-006',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A security engineer wants to guarantee that EC2 instances in a shared VPC can never receive a public IP address, enforced automatically the moment someone attempts a non-compliant launch, rather than caught afterward. The team already has a Slack alert wired to GuardDuty findings, a separate detective workflow.',
    options: [
      { id: 'a', text: 'Rely on GuardDuty to flag any instance that received a public IP after the fact' },
      { id: 'b', text: 'Enable an AWS Config rule that flags noncompliant instances during the next evaluation cycle' },
      { id: 'c', text: 'Disable auto-assign public IP on the relevant subnets and add an IAM/SCP deny condition on ec2:RunInstances checking the associatePublicIpAddress parameter' },
      { id: 'd', text: 'Require manual console review of every launch configuration before approval' },
    ],
    correctAnswers: ['c'],
    explanation:
      'Disabling auto-assign public IP at the subnet level combined with a preventive deny condition on the launch API blocks non-compliant launches before they succeed. GuardDuty and Config are both detective controls that act only after the resource already exists, and manual review does not scale and is error-prone.',
  },
  {
    id: 'is-007',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'An enterprise with 300+ accounts under one Organization wants a single team to centrally define WAF rule groups, Network Firewall policies, and security group policies, automatically applied to every existing VPC and any newly vended account, without manually redeploying policy each time. The team separately reviews Trusted Advisor cost checks weekly, which won\'t help here.',
    options: [
      { id: 'a', text: 'AWS Config, using conformance packs deployed via StackSets' },
      { id: 'b', text: 'Amazon Inspector configured at the organization level' },
      { id: 'c', text: 'AWS Trusted Advisor' },
      { id: 'd', text: 'AWS Firewall Manager, integrated with AWS Organizations' },
    ],
    correctAnswers: ['d'],
    explanation:
      'Firewall Manager is purpose-built to centrally define and automatically enforce WAF, Network Firewall, and security group policies across existing and newly created accounts/resources. Config conformance packs can detect and remediate drift from a desired state, but they aren\'t the purpose-built mechanism for pushing and enforcing firewall/WAF policy the way Firewall Manager is; Inspector and Trusted Advisor serve unrelated purposes.',
  },
  {
    id: 'is-008',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A company wants stateful, network-layer traffic filtering with intrusion prevention capabilities and domain-name filtering across multiple VPCs, centrally managed from one policy, going beyond what security groups and NACLs provide. The team already has Route 53 Resolver DNS Firewall enabled for a narrower, unrelated use case of blocking known malware domains at the DNS layer only.',
    options: [
      { id: 'a', text: 'AWS Network Firewall, with Suricata-compatible IPS rule groups and domain-list filtering, centrally managed via Firewall Manager' },
      { id: 'b', text: 'Expanding existing security group rule sets to cover more ports and protocols' },
      { id: 'c', text: 'Relying solely on the existing Route 53 Resolver DNS Firewall configuration' },
      { id: 'd', text: 'AWS WAF associated with each VPC\'s resources' },
    ],
    correctAnswers: ['a'],
    explanation:
      'Network Firewall provides stateful, IPS-capable traffic inspection and domain filtering with centralized policy across VPCs. The existing DNS Firewall setup sounds like it already covers domain filtering, but it only inspects DNS resolution, not general network traffic or intrusion attempts; security groups don\'t provide IPS or domain filtering, and WAF operates at Layer 7 for web applications specifically, not general network traffic.',
  },
  {
    id: 'is-009',
    domain: 'Infrastructure Security',
    questionType: 'multi',
    question:
      'A three-tier web application has a public ALB, an application tier of EC2 instances in private subnets, and an RDS database in isolated subnets. The team is separately migrating the RDS engine to a different compatible engine for feature reasons unrelated to network security. Select the TWO security group configurations that correctly implement least privilege across the tiers.',
    options: [
      { id: 'a', text: 'The application tier\'s security group allows inbound traffic only from the ALB\'s security group on the application port' },
      { id: 'b', text: 'The RDS security group allows inbound traffic only from the application tier\'s security group on the database port' },
      { id: 'c', text: 'The RDS security group allows inbound traffic from 0.0.0.0/0 on the database port, for simpler troubleshooting' },
      { id: 'd', text: 'The application tier\'s security group allows inbound traffic from 0.0.0.0/0 on all ports, to avoid blocking legitimate clients' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'Least privilege in a tiered architecture means each layer accepts traffic only from the security group of the layer directly in front of it. Opening the RDS or application tier to 0.0.0.0/0 would technically avoid connectivity problems, but it unnecessarily exposes both tiers to the entire internet.',
  },
  {
    id: 'is-010',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A retailer hosts a static storefront and API and wants protection against both Layer 3/4 and Layer 7 DDoS attacks while caching content at edge locations globally to reduce origin load during flash sales. The team separately runs Direct Connect to a co-located data center for an unrelated internal analytics pipeline. Which combination satisfies the caching-plus-DDoS requirement with the least custom infrastructure to build?',
    options: [
      { id: 'a', text: 'A fleet of self-managed NAT gateways with Auto Scaling to absorb traffic spikes' },
      { id: 'b', text: 'Amazon CloudFront with AWS Shield (automatically included) and AWS WAF associated with the distribution' },
      { id: 'c', text: 'Amazon S3 Transfer Acceleration alone' },
      { id: 'd', text: 'AWS Direct Connect extended to carry all customer traffic' },
    ],
    correctAnswers: ['b'],
    explanation:
      'CloudFront provides global edge caching while natively integrating with Shield (automatic baseline protection) and WAF (Layer 7 filtering) with no custom infrastructure to build. NAT gateways with Auto Scaling could absorb some load but provide neither caching nor DDoS/WAF protection and require significant custom scaling logic; Transfer Acceleration speeds uploads only, and Direct Connect isn\'t a public-facing solution.',
  },
  {
    id: 'is-011',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'Company A wants to expose an internal microservice to consumers in Company B\'s VPC, but the two VPCs have overlapping CIDR ranges from a historical M&A situation, and Company A does not want the service exposed to the public internet. Company B separately uses a Transit Gateway for an unrelated set of VPCs with non-overlapping CIDRs. Which solution meets Company A\'s requirements despite the CIDR overlap?',
    options: [
      { id: 'a', text: 'VPC peering between the two VPCs' },
      { id: 'b', text: 'Adding both VPCs to Company B\'s existing Transit Gateway' },
      { id: 'c', text: 'AWS PrivateLink, using a VPC endpoint service published by Company A and consumed via an interface endpoint in Company B\'s VPC' },
      { id: 'd', text: 'A public Network Load Balancer with a security group restricted by source IP' },
    ],
    correctAnswers: ['c'],
    explanation:
      'PrivateLink exposes a service through an endpoint service without requiring full network-level routing, so it works even with overlapping CIDRs. VPC peering and Transit Gateway attachment both require non-overlapping CIDRs to route correctly, and a public NLB, even with IP restrictions, still exposes the service to the internet.',
  },
  {
    id: 'is-012',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'Amazon Inspector continuously reports a critical CVE in an OpenSSL package installed on several dozen EC2 instances tagged for an unrelated internal cost-allocation project. The security team wants a fix that eliminates the vulnerability for both the running fleet and every future instance launched from the same baseline, not a temporary workaround.',
    options: [
      { id: 'a', text: 'Suppress the finding in Inspector so the dashboard no longer shows it as outstanding' },
      { id: 'b', text: 'Add a security group rule blocking all inbound traffic to the affected instances' },
      { id: 'c', text: 'Disable Inspector scanning for the affected instances' },
      { id: 'd', text: 'Patch the vulnerable package via a Systems Manager Patch Manager baseline, then rebuild the golden AMI so future launches include the fix' },
    ],
    correctAnswers: ['d'],
    explanation:
      'Actually patching the package and baking the fix into the golden AMI addresses both the current fleet and future launches. Blocking all inbound traffic sounds like a reasonable containment step, but it doesn\'t remediate the vulnerable package and likely breaks the application; suppressing the finding or disabling scanning only hides the problem without fixing it.',
  },
  {
    id: 'is-013',
    domain: 'Infrastructure Security',
    questionType: 'multi',
    question:
      'A company is redesigning administrative access to EC2 instances in private subnets, aiming to eliminate open inbound SSH/RDP ports and retire its legacy bastion host, whose security group currently allows SSH from a fixed corporate office IP range being decommissioned as the company moves to a fully remote workforce. Select the TWO AWS-native approaches that achieve this.',
    options: [
      { id: 'a', text: 'Temporarily open the bastion\'s security group to 0.0.0.0/0 during the office decommission' },
      { id: 'b', text: 'AWS Systems Manager Session Manager, using the SSM Agent and IAM policies rather than inbound network ports' },
      { id: 'c', text: 'EC2 Instance Connect Endpoint, brokering SSH/RDP connectivity through a VPC endpoint without a public IP or bastion' },
      { id: 'd', text: 'Share a single SSH key pair across the remote team via a shared password manager entry' },
    ],
    correctAnswers: ['b', 'c'],
    explanation:
      'Session Manager and EC2 Instance Connect Endpoint both provide administrative access without any open inbound SSH/RDP port or a traditional bastion. Opening SSH to 0.0.0.0/0 and sharing a single key pair both increase attack surface and violate credential hygiene rather than eliminating it.',
  },

  // ---------------------------------------------------------------------
  // Identity and Access Management (iam-001..iam-010)
  // ---------------------------------------------------------------------
  {
    id: 'iam-001',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A contractor\'s IAM user has an identity-based policy granting s3:* on all resources to speed up onboarding, and separately has a permissions boundary attached that allows only s3:GetObject and s3:ListBucket, per the company\'s standard contractor baseline. The contractor\'s laptop is also enrolled in an MDM policy requiring full-disk encryption, an unrelated device-security control. What is the effective result when the contractor attempts s3:PutObject?',
    options: [
      { id: 'a', text: 'Denied, because effective permissions are the intersection of the identity-based policy and the permissions boundary, and the boundary does not include s3:PutObject' },
      { id: 'b', text: 'Allowed, because the identity-based policy grants s3:* and boundaries only restrict roles, not users' },
      { id: 'c', text: 'Allowed, because permissions boundaries are advisory and not enforced by IAM' },
      { id: 'd', text: 'Denied, because permissions boundaries deny every action by default regardless of any policy' },
    ],
    correctAnswers: ['a'],
    explanation:
      'A permissions boundary caps the maximum permissions an identity can have; the effective permission is the intersection of the identity policy and the boundary, and since the boundary excludes PutObject, the action is denied. Boundaries apply to both users and roles and are strictly enforced, not advisory, and they don\'t "deny everything by default" — they simply cap what the identity policy would otherwise allow.',
  },
  {
    id: 'iam-002',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A security team wants a guarantee that no principal in any member account of its Organization — including that account\'s own root user or an administrator who grants themselves AdministratorAccess — can ever disable GuardDuty or cause the account to leave the Organization. The team already has a CloudWatch alarm that emails them whenever GuardDuty coverage drops in any account, alerting them after the fact.',
    options: [
      { id: 'a', text: 'An IAM permissions boundary applied to every user and role individually' },
      { id: 'b', text: 'A Service Control Policy attached at the appropriate OU, denying the relevant GuardDuty and Organizations actions, since SCPs apply to every principal in affected accounts including the root user' },
      { id: 'c', text: 'The existing CloudWatch alarm, since it already provides visibility' },
      { id: 'd', text: 'A resource-based policy directly on the GuardDuty detector resource' },
    ],
    correctAnswers: ['b'],
    explanation:
      'SCPs are organization-wide guardrails that cap permissions for every principal in an affected account, including root and self-escalated administrators. A permissions boundary sounds similarly restrictive, but it only applies to identities it is explicitly attached to, and a role without one (or a new AdministratorAccess grant) would bypass it entirely; the CloudWatch alarm is detective, not preventive, and GuardDuty detectors don\'t support this kind of resource-based policy.',
  },
  {
    id: 'iam-003',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A developer deploying an application to EC2 needs to call several AWS APIs and wants to avoid any hardcoded or long-lived secret, with credentials that rotate automatically and require no application-level rotation logic. The application separately writes logs to a local file rotated daily by logrotate, an unrelated detail.',
    options: [
      { id: 'a', text: 'Store an IAM user\'s long-term access key and secret key as an environment variable set at instance launch' },
      { id: 'b', text: 'Hardcode the credentials directly in the application\'s source repository' },
      { id: 'c', text: 'Attach an IAM role to the EC2 instance profile, so the application retrieves short-lived, auto-rotated credentials from instance metadata' },
      { id: 'd', text: 'Store an IAM user\'s access key in AWS Secrets Manager and have the application fetch and cache it at startup' },
    ],
    correctAnswers: ['c'],
    explanation:
      'An instance profile role provides temporary, automatically rotated credentials with no application-side rotation logic and no long-lived secret at all. Secrets Manager can rotate secrets on a schedule, but storing an IAM user\'s access key there still means managing a long-lived credential as a secret, rather than eliminating long-lived credentials the way an instance role does; environment variables and hardcoded values are both long-lived and exposed.',
  },
  {
    id: 'iam-004',
    domain: 'Identity and Access Management',
    questionType: 'multi',
    question:
      'A company migrating from a legacy home-grown SSO portal is evaluating AWS IAM Identity Center for centralized access to its 60-account Organization. One engineer claims it will let them delete all IAM roles entirely, while another is unsure whether it works with their existing Okta deployment. Select the TWO correct statements about IAM Identity Center.',
    options: [
      { id: 'a', text: 'It replaces the need for IAM roles entirely' },
      { id: 'b', text: 'It can only be used with a single AWS account, not an Organization' },
      { id: 'c', text: 'It can federate with an external identity provider such as Okta or Azure AD via SAML 2.0' },
      { id: 'd', text: 'It provides centralized, temporary-credential-based access to multiple accounts in an Organization from a single sign-in, built on top of IAM roles' },
    ],
    correctAnswers: ['c', 'd'],
    explanation:
      'IAM Identity Center federates with external IdPs via SAML and grants users temporary, role-based access across multiple accounts in an Organization from one sign-in. It relies on IAM roles under the hood rather than replacing them, and it is specifically designed for multi-account Organizations, not a single account.',
  },
  {
    id: 'iam-005',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'During an unrelated cost review that also flagged an oversized RDS instance, a security team discovers an S3 bucket policy grants public read access. They want a service that proactively and continuously analyzes resource-based policies account-wide — S3 bucket policies, KMS key policies, IAM role trust policies — to flag anything accessible from outside their zone of trust, rather than waiting to stumble onto issues during unrelated reviews.',
    options: [
      { id: 'a', text: 'AWS CloudTrail event history' },
      { id: 'b', text: 'AWS Trusted Advisor cost-optimization checks' },
      { id: 'c', text: 'Amazon Macie' },
      { id: 'd', text: 'IAM Access Analyzer' },
    ],
    correctAnswers: ['d'],
    explanation:
      'Access Analyzer uses automated reasoning over resource-based policies to continuously flag external accessibility. CloudTrail records API activity after the fact rather than analyzing policy logic, Trusted Advisor\'s cost checks are what surfaced the unrelated RDS finding and don\'t analyze access paths, and Macie focuses on sensitive-data discovery rather than access-path analysis.',
  },
  {
    id: 'iam-006',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A company wants employees authenticated by their on-premises Active Directory to assume an IAM role in AWS with permissions scoped according to their AD group membership, without creating individual IAM users for each employee. The company\'s helpdesk separately manages VPN client certificates for remote access, unrelated to this federation design.',
    options: [
      { id: 'a', text: 'SAML 2.0 federation from AD FS to an IAM role, using group/attribute mappings in the SAML assertion to scope the role session' },
      { id: 'b', text: 'Create a matching IAM user for every AD user with synchronized passwords' },
      { id: 'c', text: 'Share one IAM access key among the whole team' },
      { id: 'd', text: 'Distribute root user credentials to the helpdesk team for provisioning' },
    ],
    correctAnswers: ['a'],
    explanation:
      'SAML federation from an on-premises IdP like AD FS lets IAM trust externally issued assertions and scope the resulting role session using attributes such as AD group membership, avoiding IAM user sprawl entirely. Creating individual IAM users or sharing credentials both violate least-privilege and credential hygiene principles the requirement is trying to avoid.',
  },
  {
    id: 'iam-007',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A Lambda function\'s execution role currently has AdministratorAccess, flagged in a security review. The function also has a reserved concurrency setting of 5, an unrelated performance/cost configuration. The team wants to right-size the role\'s permissions based on the function\'s actual observed behavior, rather than guessing at a policy from documentation.',
    options: [
      { id: 'a', text: 'Remove the execution role entirely, leaving the function with no permissions' },
      { id: 'b', text: 'Use IAM Access Analyzer\'s policy generation feature, which reviews the role\'s actual CloudTrail activity over a chosen period and proposes a least-privilege policy to review and refine' },
      { id: 'c', text: 'Replace AdministratorAccess with PowerUserAccess, since it excludes some IAM/Organizations actions' },
      { id: 'd', text: 'Leave the policy as-is, since Lambda execution roles are commonly over-permissioned in practice' },
    ],
    correctAnswers: ['b'],
    explanation:
      'Access Analyzer\'s policy generation reviews actual CloudTrail activity to propose a least-privilege policy grounded in real usage. PowerUserAccess sounds like meaningful tightening since it excludes some IAM/Organizations actions, but it is still far broader than the function\'s actual observed needs and isn\'t evidence-based; removing the role breaks the function, and leaving it as-is ignores the review\'s finding.',
  },
  {
    id: 'iam-008',
    domain: 'Identity and Access Management',
    questionType: 'multi',
    question:
      'A company wants to require MFA for sensitive AWS API and console actions across its Organization, evaluated during a brainstorm that also included an unrelated proposal to shorten password rotation from 90 to 60 days. Select the TWO effective, AWS-native ways to enforce MFA.',
    options: [
      { id: 'a', text: 'Ask users to type their password twice during login' },
      { id: 'b', text: 'An IAM policy condition requiring aws:MultiFactorAuthPresent for sensitive actions' },
      { id: 'c', text: 'Shortening the password rotation period from 90 to 60 days' },
      { id: 'd', text: 'An SCP that denies sensitive actions when aws:MultiFactorAuthPresent is false, enforced regardless of local IAM configuration' },
    ],
    correctAnswers: ['b', 'd'],
    explanation:
      'A condition on aws:MultiFactorAuthPresent in an IAM policy enforces MFA for the actions it covers, and an equivalent SCP condition extends that enforcement org-wide regardless of local IAM configuration. Shortening password rotation is an unrelated password-hygiene change, not an MFA control, and typing a password twice adds no additional authentication factor.',
  },
  {
    id: 'iam-009',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'An organization vending its 50th AWS account wants every new account to automatically receive a consistent security baseline — guardrails, centralized logging, a dedicated audit/security account structure — the moment it\'s created, without a manual setup checklist, after an incident where a new account sat unprotected for two days. The team is separately evaluating a third-party CSPM tool from AWS Marketplace, an undecided, unrelated initiative.',
    options: [
      { id: 'a', text: 'AWS IAM Access Analyzer, run manually after each new account is created' },
      { id: 'b', text: 'Amazon Cognito' },
      { id: 'c', text: 'AWS Control Tower\'s Account Factory, which automates a secure multi-account landing zone with guardrails applied to newly vended accounts' },
      { id: 'd', text: 'AWS Certificate Manager' },
    ],
    correctAnswers: ['c'],
    explanation:
      'Control Tower\'s Account Factory automates the consistent baseline (guardrails, logging, account structure) at account creation, closing exactly the two-day exposure window described. Access Analyzer run manually still leaves a gap before it\'s executed, and Cognito and ACM serve unrelated purposes (application user pools and certificate issuance, respectively).',
  },
  {
    id: 'iam-010',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A security engineer at Company A needs to grant Company A\'s application, running as an IAM role, read access to S3 buckets owned by Company B, without Company B provisioning any IAM users, sharing access keys, or having to create and maintain a new IAM role for Company A to assume. Company B separately enforces S3 Object Lock on those buckets for retention reasons, unrelated to this access design. Which approach best satisfies this, with the least ongoing credential management overhead?',
    options: [
      { id: 'a', text: 'Company B creates an IAM user scoped to the buckets and shares its long-term access key with Company A' },
      { id: 'b', text: 'Company B creates an IAM role with a trust policy allowing Company A\'s account to assume it, and Company A calls sts:AssumeRole before each access' },
      { id: 'c', text: 'Company B temporarily disables the buckets\' Block Public Access setting so Company A\'s application can reach them without any explicit grant' },
      { id: 'd', text: 'Company B\'s bucket policy grants access directly to Company A\'s specific IAM role ARN as principal, requiring no new role creation or key sharing by Company B' },
    ],
    correctAnswers: ['d'],
    explanation:
      'A resource-based bucket policy naming Company A\'s role ARN as principal grants cross-account access directly, with no long-lived key and no new role for Company B to create or maintain. The cross-account role-assumption pattern is also a valid, credential-free approach in general, but it requires Company B to create and operate a new IAM role, which the stated constraint rules out; sharing an access key is long-lived, and disabling Block Public Access exposes the data publicly rather than scoping it to Company A.',
  },

  // ---------------------------------------------------------------------
  // Data Protection (dp-001..dp-012)
  // ---------------------------------------------------------------------
  {
    id: 'dp-001',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A payments company storing transaction receipts in S3 needs encryption where AWS manages the durability and availability of the key material, while the company retains control over the key\'s rotation policy and key policy, and can audit every cryptographic operation via CloudTrail. The bucket also has S3 Intelligent-Tiering enabled for cost optimization, unrelated to the encryption decision. The company also has a strict internal policy against ever handling raw key material directly.',
    options: [
      { id: 'a', text: 'SSE-KMS using a customer managed key' },
      { id: 'b', text: 'SSE-S3' },
      { id: 'c', text: 'SSE-C, supplying a customer-provided key on every request' },
      { id: 'd', text: 'Client-side encryption with a key generated and stored entirely outside AWS' },
    ],
    correctAnswers: ['a'],
    explanation:
      'SSE-KMS with a customer managed key lets AWS store the key material while the customer controls the key policy, rotation, and gets per-key CloudTrail visibility into every use. SSE-S3 is also AWS-managed, but it uses AWS-owned keys with no customer-controlled key policy or dedicated audit trail; SSE-C and client-side encryption both require the company to handle raw key material directly, which its internal policy forbids.',
  },
  {
    id: 'dp-002',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A security team must guarantee that a KMS customer managed key can never be used by any principal outside a specific list of IAM roles, even if a future overly permissive IAM policy is mistakenly attached to some other role in the account. The account also uses Config conformance packs to monitor unrelated S3 public-access settings. Given that IAM policies elsewhere in the account cannot be fully trusted to stay correctly scoped, where must this restriction ultimately be enforced?',
    options: [
      { id: 'a', text: 'Solely in IAM policies attached to each of the approved roles' },
      { id: 'b', text: 'In the KMS key policy, which is the primary, always-consulted access control mechanism for the key' },
      { id: 'c', text: 'In an S3 bucket policy referencing the key ARN' },
      { id: 'd', text: 'In a security group rule limiting network access to the KMS endpoint' },
    ],
    correctAnswers: ['b'],
    explanation:
      'The key policy is always consulted for any use of a KMS key; restricting principals there closes the gap regardless of what IAM policies exist elsewhere. IAM policies alone sound sufficient since they normally scope access, but they cannot grant access to a key unless the key policy itself delegates to IAM, so a mistaken IAM grant elsewhere has no effect if the key policy doesn\'t allow it; a bucket policy controls the bucket, not the key, and a security group has no bearing on KMS API authorization.',
  },
  {
    id: 'dp-003',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company wants a KMS customer managed key\'s cryptographic material to rotate automatically on a roughly annual cadence without updating the key\'s ARN, alias, or any application reference, and without re-encrypting previously encrypted data. The team separately debated renaming an S3 bucket for an unrelated rebranding effort.',
    options: [
      { id: 'a', text: 'Manually create a brand-new KMS key every year and update every application reference to the new key ARN' },
      { id: 'b', text: 'Use SSE-C with a client-supplied key that the application rotates itself on a cron job' },
      { id: 'c', text: 'Enable automatic key rotation on the customer managed KMS key' },
      { id: 'd', text: 'Disable the key annually and create a replacement key under the same alias' },
    ],
    correctAnswers: ['c'],
    explanation:
      'Automatic key rotation rotates the underlying material roughly yearly while preserving the key ID/ARN and keeping old ciphertext decryptable, requiring no application changes. Manually creating new keys requires updating every reference and re-encrypting data, and disabling the key blocks use of everything it previously encrypted; SSE-C would push key rotation logic onto the application itself.',
  },
  {
    id: 'dp-004',
    domain: 'Data Protection',
    questionType: 'multi',
    question:
      'A media company wants to protect archival video assets in S3 from accidental permanent deletion or overwrite, with the ability to recover a prior object state for at least 90 days even if someone with valid delete permissions removes it. The bucket also has cross-region replication configured for disaster recovery, which by itself does not protect against a delete replicating to the second region too. Select the TWO S3 features that should be enabled.',
    options: [
      { id: 'a', text: 'S3 Versioning, so a delete creates a delete marker rather than destroying the prior object version' },
      { id: 'b', text: 'S3 Transfer Acceleration, to speed up uploads of new assets' },
      { id: 'c', text: 'S3 Object Lock in governance mode with a 90-day retention period on object versions' },
      { id: 'd', text: 'S3 Intelligent-Tiering, to automatically move older assets to cheaper storage classes' },
    ],
    correctAnswers: ['a', 'c'],
    explanation:
      'Versioning ensures deletes and overwrites create new versions/markers rather than destroying data, and Object Lock in governance mode prevents those versions from being removed until the retention period elapses, together meeting the 90-day recovery requirement. Transfer Acceleration and Intelligent-Tiering address upload speed and storage cost respectively, neither related to deletion protection.',
  },
  {
    id: 'dp-005',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A data science team must discover and classify sensitive data such as PII and payment card numbers scattered across dozens of S3 buckets accumulated over several years, using managed, ML-based data identifiers rather than custom regex scripts. The team also uses Amazon SageMaker for unrelated model training work.',
    options: [
      { id: 'a', text: 'AWS Config, using custom rules that check bucket tags' },
      { id: 'b', text: 'Amazon Inspector, configured for S3 targets' },
      { id: 'c', text: 'AWS Trusted Advisor\'s security checks' },
      { id: 'd', text: 'Amazon Macie, using its managed data identifiers to automatically discover and classify sensitive data across the buckets' },
    ],
    correctAnswers: ['d'],
    explanation:
      'Macie uses machine learning and managed data identifiers built specifically for discovering and classifying sensitive data at scale in S3. Config tracks configuration rather than inspecting object content, Inspector assesses compute/container vulnerabilities rather than S3 content, and Trusted Advisor provides general best-practice checks with no content classification.',
  },
  {
    id: 'dp-006',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A healthcare application must encrypt data client-side before it leaves the application, so AWS never has access to the plaintext, using an audited, managed cryptographic library rather than custom encryption code. The application already uses SSE-S3 on a separate, lower-sensitivity logging bucket, which does not meet this new requirement.',
    options: [
      { id: 'a', text: 'The AWS Encryption SDK (or the Amazon S3 Encryption Client), generating data keys via KMS but performing the encryption locally before upload' },
      { id: 'b', text: 'SSE-KMS on the destination bucket' },
      { id: 'c', text: 'SSE-S3, matching what\'s used on the existing logging bucket' },
      { id: 'd', text: 'S3 Bucket Keys' },
    ],
    correctAnswers: ['a'],
    explanation:
      'The AWS Encryption SDK performs encryption locally before data leaves the application, using an audited library rather than custom cryptography, so AWS only ever receives ciphertext. SSE-KMS still has AWS perform the encryption operation server-side and therefore has access to plaintext during the request, which fails the requirement even though it is a managed KMS-backed option; SSE-S3 has the same server-side issue with even less key control, and Bucket Keys are a cost optimization for SSE-KMS, not an independent encryption mechanism.',
  },
  {
    id: 'dp-007',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A platform team manages database credentials, API keys, and OAuth tokens for several microservices and wants automatic rotation on a schedule, fine-grained IAM-based access control per secret, and CloudTrail-logged visibility into every retrieval. The team currently bakes some of these as plaintext environment variables into container images and is separately evaluating a switch from Docker Compose to a different local dev tool, unrelated to this decision.',
    options: [
      { id: 'a', text: 'AWS Systems Manager Parameter Store, Standard tier, storing values as SecureString parameters' },
      { id: 'b', text: 'AWS Secrets Manager, which provides built-in automatic rotation, per-secret resource policies, and CloudTrail logging of every access' },
      { id: 'c', text: 'Continuing to bake plaintext values into the container image' },
      { id: 'd', text: 'A private S3 bucket holding a JSON file of all the credentials' },
    ],
    correctAnswers: ['b'],
    explanation:
      'Secrets Manager natively supports scheduled rotation (including built-in rotation Lambdas for several database engines), per-secret access policies, and CloudTrail logging. Parameter Store SecureString parameters are also encrypted with KMS and support IAM policies, but the Standard tier lacks built-in automatic rotation, which the requirement specifically calls for; plaintext in images and a shared S3 file both lack rotation and audit granularity.',
  },
  {
    id: 'dp-008',
    domain: 'Data Protection',
    questionType: 'multi',
    question:
      'A company wants data in transit between clients and its Application Load Balancer, and separately between the ALB and backend EC2 targets, encrypted end-to-end using TLS. The backend fleet also runs a sidecar log shipper unrelated to this requirement. Select the TWO configurations needed.',
    options: [
      { id: 'a', text: 'Terminate TLS at the ALB using an ACM-issued certificate on an HTTPS listener' },
      { id: 'b', text: 'Use HTTP throughout, relying on the VPC\'s private addressing for security' },
      { id: 'c', text: 'Disable ALB access logging to reduce the number of TLS handshakes required' },
      { id: 'd', text: 'Set the target group\'s protocol to HTTPS so the ALB re-encrypts traffic to the backend EC2 targets' },
    ],
    correctAnswers: ['a', 'd'],
    explanation:
      'True end-to-end encryption requires TLS termination at the ALB for the client-facing leg and a second TLS connection (HTTPS target group) from the ALB to the backend targets. Relying on network isolation alone provides no encryption in transit, and access logging has no relationship to TLS negotiation.',
  },
  {
    id: 'dp-009',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A financial services company must ensure a specific KMS key can only be used to decrypt data when the request originates from within their corporate VPC via a specific VPC endpoint, never directly over the public internet, even with otherwise-valid IAM credentials. The compliance team separately reviews SOC 2 reports annually via AWS Artifact, unrelated to enforcing this restriction.',
    options: [
      { id: 'a', text: 'Rely on strong IAM user passwords' },
      { id: 'b', text: 'Enable S3 versioning on the bucket holding the encrypted objects' },
      { id: 'c', text: 'Add a condition to the KMS key policy (or an IAM policy) using aws:SourceVpce or aws:SourceVpc to restrict key usage to requests through a specific VPC endpoint' },
      { id: 'd', text: 'Switch from SSE-KMS to SSE-S3 for the affected objects' },
    ],
    correctAnswers: ['c'],
    explanation:
      'A key policy or IAM condition on aws:SourceVpce/aws:SourceVpc restricts key usage to requests traversing the designated VPC endpoint, blocking use from outside the corporate network even with valid credentials. Versioning has no bearing on KMS usage restrictions, strong passwords don\'t enforce network origin, and SSE-S3 doesn\'t support key policies or conditions of this kind at all.',
  },
  {
    id: 'dp-010',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A regulated financial company must guarantee that certain highly sensitive key material lives exclusively in single-tenant, customer-controlled hardware security modules validated to FIPS 140-2 Level 3, separate from any AWS-operated multi-tenant HSM fleet, with no AWS operational access to the material. The company already uses AWS KMS customer managed keys for less-sensitive workloads, which don\'t meet this stricter exclusivity bar.',
    options: [
      { id: 'a', text: 'AWS KMS with AWS managed keys' },
      { id: 'b', text: 'AWS KMS with customer managed keys' },
      { id: 'c', text: 'Amazon Macie' },
      { id: 'd', text: 'AWS CloudHSM, providing dedicated, single-tenant FIPS 140-2 Level 3 validated HSMs under the customer\'s exclusive control' },
    ],
    correctAnswers: ['d'],
    explanation:
      'CloudHSM provides single-tenant hardware exclusively under customer control, meeting the strictest exclusivity and validation requirement. KMS with customer managed keys sounds like it satisfies the bar since the customer controls the key policy and rotation, but the underlying HSMs are still part of AWS\'s shared, multi-tenant fleet; AWS managed keys offer even less customer control, and Macie is unrelated to key management.',
  },
  {
    id: 'dp-011',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company wants to let a third-party SaaS vendor decrypt specific objects encrypted with a customer managed KMS key, without provisioning any IAM identity for the vendor in the company\'s own account, and wants the access to be easily revocable later without editing the key policy. The vendor separately requested a copy of the company\'s SOC 2 report, an unrelated administrative request handled through AWS Artifact.',
    options: [
      { id: 'a', text: 'Create a KMS grant on the key for the vendor\'s external AWS account/principal, scoped to specific operations, which can later be retired independently of the key policy' },
      { id: 'b', text: 'Add the vendor\'s AWS account as a full principal in the key policy with kms:* permissions' },
      { id: 'c', text: 'Email the vendor the key\'s plaintext key material' },
      { id: 'd', text: 'Set the key policy\'s principal to "*"' },
    ],
    correctAnswers: ['a'],
    explanation:
      'A KMS grant delegates scoped, revocable access to an external principal for specific operations, and can be retired independently without touching the key policy. Adding the vendor directly to the key policy would technically grant access without creating an IAM identity, but it is far broader than needed and requires editing (and later re-editing) the key policy itself to revoke, which is clunkier than a grant; emailing key material or opening the policy to any principal are severe anti-patterns.',
  },
  {
    id: 'dp-012',
    domain: 'Data Protection',
    questionType: 'multi',
    question:
      'A security team reviewing an RDS instance storing customer PII learns it was provisioned three years ago, before a formal encryption standard existed, and separately learns its maintenance window is Sunday 3-4am UTC, unrelated to this review. Select the TWO controls that should be implemented to protect this data both at rest and in transit.',
    options: [
      { id: 'a', text: 'Enable encryption at rest on the RDS instance (via a snapshot-restore to an encrypted copy, since encryption cannot be toggled on an existing unencrypted instance) using a KMS key' },
      { id: 'b', text: 'Enforce SSL/TLS connections to the database via a parameter group setting such as rds.force_ssl or require_secure_transport' },
      { id: 'c', text: 'Disable automated backups to reduce the attack surface' },
      { id: 'd', text: 'Make the RDS instance publicly accessible so the security team can query it directly for the review' },
    ],
    correctAnswers: ['a', 'b'],
    explanation:
      'Encryption at rest (achieved via snapshot-and-restore for an already-unencrypted instance, since it cannot be enabled in place) protects data on disk, and enforcing SSL/TLS protects it in transit. Disabling backups removes a recovery safety net without improving security, and making the instance publicly accessible directly increases exposure rather than reducing it.',
  },

  // ---------------------------------------------------------------------
  // Management and Security Governance (msg-001..msg-009)
  // ---------------------------------------------------------------------
  {
    id: 'msg-001',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A company wants to guarantee that no account in its "Sandbox" organizational unit can ever launch resources outside us-east-1 and eu-west-1, regardless of what IAM permissions a developer grants themselves within those accounts, after a recent audit found a developer with broad IAM permissions in a sandbox account. Sandbox OU accounts are also subject to a $500/month AWS Budgets alert, an unrelated cost-control mechanism.',
    options: [
      { id: 'a', text: 'An IAM policy attached only to each account\'s root user' },
      { id: 'b', text: 'A Service Control Policy attached to the Sandbox OU that denies actions unless aws:RequestedRegion is in the allowed list' },
      { id: 'c', text: 'The existing AWS Budgets alert, tightened to also flag unusual regions' },
      { id: 'd', text: 'A CloudWatch alarm that notifies when a resource is created outside the allowed regions' },
    ],
    correctAnswers: ['b'],
    explanation:
      'An SCP at the OU level with a region condition is enforced for every principal in the account regardless of locally granted IAM permissions, exactly closing the gap the audit found. A CloudWatch alarm would notify after the fact rather than prevent the launch, and Budgets alerts on spend, not region of resource creation; an IAM policy on the root user doesn\'t constrain other principals in the account.',
  },
  {
    id: 'msg-002',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A company must demonstrate to an external auditor that resources across 30 accounts continuously comply with a security baseline (encrypted EBS volumes, no public S3 buckets), wanting ongoing, automated evaluation rather than the quarterly manual spreadsheet review the compliance team currently maintains, which also separately tracks unrelated software license counts.',
    options: [
      { id: 'a', text: 'Continue the quarterly manual spreadsheet review, done more carefully' },
      { id: 'b', text: 'IAM Access Analyzer alone' },
      { id: 'c', text: 'AWS Config Rules, potentially packaged as a conformance pack, with a multi-account aggregator' },
      { id: 'd', text: 'Amazon CloudWatch Synthetics canaries' },
    ],
    correctAnswers: ['c'],
    explanation:
      'Config Rules continuously evaluate resource configuration, conformance packs bundle rules for a baseline, and an aggregator gives a multi-account view, together providing the continuous automated evidence an auditor needs. A more careful manual review is still not continuous, Access Analyzer addresses external accessibility rather than general configuration compliance, and Synthetics canaries monitor endpoint availability, not resource configuration.',
  },
  {
    id: 'msg-003',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A compliance officer, who also manages the team\'s AWS Marketplace software subscriptions as an unrelated procurement task, needs on-demand access to AWS\'s SOC 2 and ISO 27001 reports for a customer security questionnaire, and separately needs to review and accept the HIPAA Business Associate Addendum before processing certain healthcare workloads.',
    options: [
      { id: 'a', text: 'AWS Marketplace' },
      { id: 'b', text: 'AWS Config' },
      { id: 'c', text: 'Amazon Inspector' },
      { id: 'd', text: 'AWS Artifact, for on-demand access to AWS compliance reports and for reviewing/accepting agreements like the BAA' },
    ],
    correctAnswers: ['d'],
    explanation:
      'Artifact is the self-service portal for AWS compliance reports and for reviewing/accepting agreements such as the BAA. Marketplace is the unrelated procurement task mentioned in the scenario, Config tracks resource configuration rather than compliance documentation, and Inspector performs vulnerability scanning.',
  },
  {
    id: 'msg-004',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'During a shared-responsibility training session, a new cloud engineer asks who patches the underlying hypervisor and physical host infrastructure for the company\'s EC2 fleet, while the company\'s guest-OS patch compliance is separately tracked at 94% via Systems Manager Patch Manager, an unrelated internal metric. Who is responsible for the hypervisor/host layer?',
    options: [
      { id: 'a', text: 'AWS, as part of "security of the cloud"' },
      { id: 'b', text: 'The customer, as part of "security in the cloud"' },
      { id: 'c', text: 'A 50/50 split between AWS and the customer for every layer of EC2' },
      { id: 'd', text: 'The customer\'s third-party auditor' },
    ],
    correctAnswers: ['a'],
    explanation:
      'AWS is responsible for "security of the cloud," including the physical infrastructure and hypervisor layer for EC2. The customer is responsible for "security in the cloud" — guest OS patching (like the 94% metric mentioned), applications, and IAM — which is a distinct and separate layer from the hypervisor/host infrastructure.',
  },
  {
    id: 'msg-005',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A company wants every newly created member account to automatically receive preventive guardrails — "deny leaving the organization," "deny disabling GuardDuty" — the instant the account is created, with zero manual follow-up, after an incident where a new account sat unprotected for two days. The IT helpdesk separately tracks account provisioning tickets in Jira, unrelated to guardrail enforcement.',
    options: [
      { id: 'a', text: 'Manually attach the relevant SCPs to each account right after creation, tracked via the Jira ticket' },
      { id: 'b', text: 'Attach the SCPs to the OU that new accounts are automatically placed into at creation time' },
      { id: 'c', text: 'Send an automated Jira reminder to attach the SCP within 24 hours of account creation' },
      { id: 'd', text: 'Rely on each account owner to configure equivalent IAM policies locally' },
    ],
    correctAnswers: ['b'],
    explanation:
      'Attaching SCPs to the OU that accounts are automatically vended into means the guardrails apply immediately and automatically, with no manual step. A same-day or 24-hour manual follow-up still leaves exactly the kind of exposure window that caused the original incident, and account-owner-configured IAM policies aren\'t centrally enforced guardrails.',
  },
  {
    id: 'msg-006',
    domain: 'Management and Security Governance',
    questionType: 'multi',
    question:
      'During a security architecture review, one engineer claims SCPs can grant new permissions on their own, another claims they don\'t apply to the account\'s root user, and a third mentions they\'re unrelated to the company\'s separate Config conformance pack rollout. Select the TWO statements about SCPs that are actually correct.',
    options: [
      { id: 'a', text: 'SCPs can grant permissions even when no IAM or resource-based policy allows the action' },
      { id: 'b', text: 'SCPs set the maximum available permissions for an account but never grant permissions by themselves — an IAM/resource policy must still separately allow the action' },
      { id: 'c', text: 'SCPs affect every principal in the affected account, including the account\'s root user' },
      { id: 'd', text: 'SCPs apply only to IAM users and never to roles' },
    ],
    correctAnswers: ['b', 'c'],
    explanation:
      'SCPs act only as a permissions ceiling — they never grant access on their own — and they apply to every principal in the account, including root. An identity still needs an actual IAM allow even where the SCP permits it, and SCPs apply to both users and roles, not users alone.',
  },
  {
    id: 'msg-007',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A security team in a 120-account Organization wants one centrally designated account to configure and view GuardDuty, Security Hub, and Detective findings across every member account, without assuming a separate IAM role into each account individually every time. The management account separately handles consolidated billing, which addresses cost visibility but not this administration need.',
    options: [
      { id: 'a', text: 'Consolidated billing, extended to cover security dashboards' },
      { id: 'b', text: 'Manually created cross-account IAM roles in every one of the 120 accounts' },
      { id: 'c', text: 'Designating a delegated administrator account within AWS Organizations for GuardDuty, Security Hub, and Detective' },
      { id: 'd', text: 'AWS Budgets, configured with account groupings' },
    ],
    correctAnswers: ['c'],
    explanation:
      'A delegated administrator account provides native, centralized configuration and viewing of findings across all member accounts without per-account role assumption. Manually created cross-account roles would technically allow access, but still require assuming a different role in each of the 120 accounts one at a time, rather than one unified administrative view; consolidated billing and Budgets address cost, not security administration.',
  },
  {
    id: 'msg-008',
    domain: 'Management and Security Governance',
    questionType: 'single',
    question:
      'A company preparing for a PCI DSS audit wants to quickly evaluate its environment against a pre-built collection of Config rules mapped to PCI DSS requirements, rather than manually researching and selecting each rule individually. The finance team is separately reviewing Cost Explorer data to forecast next quarter\'s spend, an unrelated exercise happening the same week.',
    options: [
      { id: 'a', text: 'AWS Cost Explorer, filtered to security-tagged resources' },
      { id: 'b', text: 'AWS Budgets' },
      { id: 'c', text: 'Amazon CloudWatch Logs Insights' },
      { id: 'd', text: 'An AWS Config conformance pack for PCI DSS, deploying the mapped rules as a single unit' },
    ],
    correctAnswers: ['d'],
    explanation:
      'A conformance pack bundles Config rules mapped to a framework like PCI DSS and deploys them as one unit, avoiding manual rule-by-rule selection. Cost Explorer is the tool used for the unrelated finance forecast mentioned in the scenario, and Budgets and Logs Insights are unrelated to compliance rule evaluation.',
  },
  {
    id: 'msg-009',
    domain: 'Management and Security Governance',
    questionType: 'multi',
    question:
      'A team managing a fully managed RDS database storing customer PII is clarifying, ahead of a shared-responsibility training refresh, which duties remain theirs versus AWS\'s. The database runs on a Multi-AZ deployment for high availability, a resiliency configuration that does not change who is responsible for which security controls. Select the TWO items that remain the customer\'s responsibility.',
    options: [
      { id: 'a', text: 'Replacing failed physical disks underlying the RDS instance' },
      { id: 'b', text: 'Patching the underlying database engine\'s operating system/host infrastructure entirely' },
      { id: 'c', text: 'Configuring security groups and database-level user accounts/permissions for the RDS instance' },
      { id: 'd', text: 'Choosing to enable encryption at rest and enforcing SSL/TLS for connections' },
    ],
    correctAnswers: ['c', 'd'],
    explanation:
      'Even for a fully managed service, the customer configures network access controls and database-level users, and chooses to enable encryption and enforce TLS. AWS handles physical hardware maintenance and the bulk of underlying host/engine patching orchestration for a managed service like RDS, even though Multi-AZ changes availability characteristics, not this responsibility split.',
  },
]
