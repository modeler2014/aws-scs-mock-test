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
      'A media streaming startup runs a fleet of roughly 200 EC2 instances behind an Application Load Balancer, with a subset recently migrated to Graviton processors as part of a cost initiative projected to cut compute spend by roughly 20% over the next fiscal year. Amazon GuardDuty, which has been enabled across the account for the past eight months with S3 Protection and EKS Protection also turned on, raises a finding of type Backdoor:EC2/C&CActivity.B!DNS on one specific instance in the fleet, indicating that instance is issuing DNS lookups consistent with communication to known command-and-control infrastructure. The instance is currently serving live production video-transcoding traffic for several thousand concurrent viewers and cannot be taken offline or have its workload drained for a lengthy scan without triggering visible service degradation. The security team has been asked to determine, as quickly as possible and with the least operational overhead, whether the EBS volumes attached to that instance actually contain malware, without disrupting the workload currently running on it.',
    options: [
      {
        id: 'a',
        text: 'Run Amazon Inspector\'s network reachability analysis against the instance to determine whether any of its open ports are reachable from the internet, and treat any reachable path as evidence of the malware\'s presence.',
      },
      {
        id: 'b',
        text: 'Enable GuardDuty Malware Protection for EC2 on the finding, which takes point-in-time EBS snapshots of the volumes attached to the implicated instance and scans them agentlessly in an isolated environment without installing anything on the running instance or interrupting its workload.',
      },
      {
        id: 'c',
        text: 'Install a third-party endpoint detection and response (EDR) agent onto the running instance via Systems Manager and immediately kick off a full on-host disk scan while the instance keeps serving live transcoding traffic.',
      },
      {
        id: 'd',
        text: 'Open a new case in Amazon Detective scoped to the instance\'s entity profile and review its historical finding and API-call timeline to infer, from past behavior alone, whether the volumes currently contain malware.',
      },
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
      'A logistics company\'s SOC receives a GuardDuty finding indicating that an EC2 instance handling shipment-tracking data was likely compromised through a vulnerability in a web application framework running on it. The instance is tagged with a cost-allocation tag showing it costs $0.42/hour to run, a detail the FinOps team separately flagged in a chargeback report earlier that week. Threat intelligence shared by the vendor suggests the specific malware family involved is known to inject itself into running processes and avoid writing persistent artifacts to disk, meaning any evidence may exist only in volatile memory. The responder has been told to preserve all available evidence, including RAM contents where possible, and to sever the instance\'s network connectivity from the rest of the environment as quickly as possible, and has been explicitly instructed that the instance must not be powered off under any circumstances because a memory-resident implant is suspected and powering off would destroy the only copy of that evidence.',
    options: [
      {
        id: 'a',
        text: 'Immediately terminate the instance to stop any further malicious activity, then restore the shipment-tracking application from the most recent known-good AMI in the golden-image pipeline.',
      },
      {
        id: 'b',
        text: 'Stop the instance through the EC2 console or API to freeze its current disk and configuration state before beginning any further investigation steps.',
      },
      {
        id: 'c',
        text: 'Take an EBS snapshot of every volume attached to the instance to preserve disk-level evidence, then detach the instance\'s elastic network interface (or move it into an isolated security group with no inbound or outbound rules) so the instance is cut off from the network while remaining powered on.',
      },
      {
        id: 'd',
        text: 'Reboot the instance to clear any in-memory malicious hooks and then monitor GuardDuty over the following hours to confirm whether the finding stops recurring.',
      },
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
      'A fleet of roughly 60 EC2 instances inside an Auto Scaling group spans two Availability Zones and shares a single IAM role attached via an instance profile defined in the launch template. That same fleet also emits custom CloudWatch metrics tracking p99 request latency, which the SRE team dashboards separately as part of a performance-optimization initiative launched last quarter. GuardDuty raises the finding UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS, indicating that the temporary security credentials issued to one specific instance in that fleet were observed being used from an IP address outside of AWS, meaning they were likely copied off the instance and are now in an attacker\'s possession. The security team has been told to invalidate the exfiltrated credentials immediately, without disrupting the dozens of other healthy instances in the same Auto Scaling group that are currently relying on the same shared IAM role to serve production traffic.',
    options: [
      {
        id: 'a',
        text: 'Delete the IAM role that is attached to the Auto Scaling group\'s launch template, removing the role from every instance profile that currently references it.',
      },
      {
        id: 'b',
        text: 'Stop the one specific EC2 instance that triggered the finding, on the assumption that halting that instance also invalidates any credentials it previously obtained.',
      },
      {
        id: 'c',
        text: 'Detach the instance profile from the Auto Scaling group\'s launch template configuration and then immediately reattach a newly created instance profile referencing the same underlying role.',
      },
      {
        id: 'd',
        text: 'Use IAM\'s revoke-active-sessions capability on the shared role, which attaches an inline policy denying any request made using session credentials issued before the current timestamp, without deleting or modifying the role\'s permission set itself.',
      },
    ],
    correctAnswers: ['d'],
    explanation:
      'Revoking active sessions attaches a policy denying any request using credentials issued before now, immediately invalidating the exfiltrated session while the role stays intact so other instances simply obtain fresh credentials. Stopping the affected instance sounds like it removes the threat, but temporary credentials already exfiltrated off-box remain valid elsewhere until they naturally expire regardless of the source instance\'s power state; deleting or reattaching the role disrupts the entire fleet unnecessarily.',
  },
  {
    id: 'td-004',
    domain: 'Threat Detection and Incident Response',
    questionType: 'multi',
    question:
      'A security automation team wants a GuardDuty finding to automatically trigger a Lambda-based remediation function within seconds of the finding being generated, so that containment steps like isolating a security group or revoking credentials happen without a human in the loop for the initial response. The team has explicitly stated they want to avoid building and operating a Lambda function that polls the GuardDuty ListFindings/GetFindings API on a fixed schedule to check whether anything new has appeared, since that approach was tried previously on a different project and proved both slow to detect new findings and expensive to run continuously. They have also ruled out any design that depends on a human periodically checking a dashboard before remediation begins. Select the TWO event-driven (non-polling) mechanisms that satisfy the stated requirement.',
    options: [
      {
        id: 'a',
        text: 'Configure a CloudWatch Events (or EventBridge) cron-scheduled rule that invokes a Lambda function every 5 minutes, and have that Lambda call GetFindings against the GuardDuty API to check for anything new since its last run.',
      },
      {
        id: 'b',
        text: 'Create an EventBridge rule with an event pattern matching GuardDuty finding events published to the default event bus, and configure the remediation Lambda function directly as that rule\'s target so it is invoked the moment a matching finding is emitted.',
      },
      {
        id: 'c',
        text: 'Forward GuardDuty findings into AWS Security Hub, define a Security Hub custom action on the relevant finding types, and pair that custom action with an EventBridge rule whose target is the same remediation Lambda function.',
      },
      {
        id: 'd',
        text: 'Subscribe to AWS Trusted Advisor\'s scheduled weekly refresh notifications and have the remediation Lambda triggered whenever a new Trusted Advisor check result is published.',
      },
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
      'A company operates a separate, self-hosted on-premises SIEM with a contracted 2 TB/day log-ingestion capacity that the infrastructure team is proud of. The security team currently has GuardDuty, Inspector, and Macie each running independently, and each surfaces its own findings in its own separate console with its own severity scale, which has made it difficult to get one prioritized view of risk across all three. They want a single pane of glass that ingests and normalizes findings from GuardDuty, Inspector, Macie, and any supported third-party partner tools into the common AWS Security Finding Format (ASFF), without the team having to write and maintain custom extract-transform-load logic that calls each service\'s own API separately and reconciles the results itself.',
    options: [
      {
        id: 'a',
        text: 'AWS Security Hub, configured to automatically ingest and normalize findings from GuardDuty, Inspector, Macie, and supported third-party partner integrations into the common ASFF schema for unified, prioritized viewing.',
      },
      {
        id: 'b',
        text: 'AWS Systems Manager OpsCenter, used to aggregate operational issues (OpsItems) raised across the fleet into a single console for tracking and remediation.',
      },
      {
        id: 'c',
        text: 'An AWS Config aggregator configured at the organization level to consolidate resource configuration-compliance data from every member account into one view.',
      },
      {
        id: 'd',
        text: 'A custom set of CloudWatch dashboards populated by several Lambda functions, each written to poll one of GuardDuty\'s, Inspector\'s, or Macie\'s APIs on a schedule and push the results into shared metrics.',
      },
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
      'A consumer-electronics retailer stores order records, invoices, and high-resolution product images spread across roughly 40 separate S3 buckets, several of which were created by different teams over the years with inconsistent naming conventions. The company\'s e-commerce platform recently shipped a new wishlist feature that increased average page load time by about 150 milliseconds, a front-end performance detail the platform team is tracking closely this quarter. The security team wants to detect anomalous S3 access patterns — for example, API calls originating from an IP address associated with a known Tor exit node, or access at an unusual hour from a geography the account has never operated in — by analyzing behavioral signals around who is calling the S3 API and from where, rather than by inspecting what the objects themselves actually contain. They have explicitly said they do not want to run Macie\'s sensitive-data classification jobs against these buckets for this particular requirement, since the team only cares about access behavior right now, not the contents of the data, and running classification jobs across all 40 buckets would add scanning cost and time on top of that.',
    options: [
      {
        id: 'a',
        text: 'Enable the AWS Config recorder scoped specifically to S3 bucket resources so that any change to bucket configuration is captured in a compliance timeline.',
      },
      {
        id: 'b',
        text: 'Enable GuardDuty S3 Protection, which analyzes the CloudTrail S3 data-event stream to flag behaviorally anomalous access such as API calls from suspicious IP infrastructure like known Tor exit nodes, without inspecting the contents of the objects themselves.',
      },
      {
        id: 'c',
        text: 'Run Amazon Macie classification jobs against all 40 buckets to scan the objects\' contents for sensitive data and flag buckets containing PII or payment card data.',
      },
      {
        id: 'd',
        text: 'Enable VPC Flow Logs on the VPC endpoint used to reach S3, capturing accepted and rejected connection metadata for traffic flowing to that endpoint.',
      },
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
      'A team already pays for a CloudTrail Lake subscription that is primarily used to satisfy a separate quarterly compliance-reporting workflow requiring a handful of predefined SQL queries against a full year of event history. During an active investigation into a GuardDuty finding involving suspicious API activity, an analyst wants to visually pivot back and forth across the relationships between the IAM roles involved, the EC2 instances they were used from, and the sequence of API calls made around the time of the finding, ideally following those connections outward several hops to see what else those same roles and instances touched, without hand-writing new SQL against raw event history each time a new question comes up mid-investigation.',
    options: [
      {
        id: 'a',
        text: 'Open AWS Config\'s resource configuration timeline for the relevant IAM role and EC2 instances to review how their configuration attributes changed over time.',
      },
      {
        id: 'b',
        text: 'Use the existing CloudTrail Lake subscription and write additional hand-crafted SQL queries against the event data store each time the analyst needs to explore a new relationship between a role, an instance, and an API call.',
      },
      {
        id: 'c',
        text: 'Open the relevant entities in Amazon Detective\'s behavior graph, which is automatically built from VPC Flow Logs, CloudTrail management events, and GuardDuty findings, and lets the analyst visually pivot across linked roles, instances, and API activity without writing queries.',
      },
      {
        id: 'd',
        text: 'Review the AWS X-Ray service map for the application to trace how requests flowed between its internal services around the time of the finding.',
      },
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
      'GuardDuty raises the finding UnauthorizedAccess:IAMUser/MaliciousIPCaller.Custom for a specific IAM user whose access keys are believed to have been compromised after appearing in calls from an IP address on the team\'s custom threat list. The IAM user in question belongs to a marketing analytics team that normally generates a weekly ad-spend report, a routine business function the team runs every Monday morning. The incident-response runbook explicitly states that whatever response is taken must not disable the organization\'s centralized CloudTrail trail, since doing so would blind the security team to any further attacker activity across the rest of the environment while the investigation is ongoing. Select the TWO actions that should be part of the response to this specific finding.',
    options: [
      {
        id: 'a',
        text: 'Attach the AdministratorAccess managed policy to the compromised principal so the security team can investigate using exactly the same permission set the attacker had, rather than a separate investigative role.',
      },
      {
        id: 'b',
        text: 'Disable the organization\'s centralized CloudTrail trail entirely, on the reasoning that this prevents the attacker from generating any further logged API activity while the investigation proceeds.',
      },
      {
        id: 'c',
        text: 'Rotate the IAM user\'s access keys by creating a new key pair and deactivating (or deleting) the compromised pair, immediately invalidating the credentials the attacker was using.',
      },
      {
        id: 'd',
        text: 'Attach an explicit-deny policy directly to the compromised principal that blocks all actions for that identity while the investigation continues, without touching the role\'s existing permission grants.',
      },
    ],
    correctAnswers: ['c', 'd'],
    explanation:
      'Containing a compromised identity means invalidating the leaked credentials and separately cutting off its ability to act, which rotating the access keys (c) and attaching an explicit-deny policy (d) accomplish without touching logging. Disabling the trail is explicitly ruled out by the stated constraint and destroys the team\'s own visibility, and granting more privileges is the opposite of containment.',
  },
  {
    id: 'td-009',
    domain: 'Threat Detection and Incident Response',
    questionType: 'single',
    question:
      'After containing an initial compromise traced back to an outdated, exploitable library on one EC2 instance, a security team wants to check whether any other instances across the fleet share that same vulnerable, unpatched package, since it likely provided the initial foothold the attacker used. The fleet spans two AWS regions and is billed largely under a Compute Savings Plan covering about 70% of overall usage, a cost-allocation detail noted in last month\'s finance review. The team wants continuous, low-overhead vulnerability and network-reachability assessment across both the EC2 fleet and the container images stored in ECR, without deploying and separately operating a new third-party scanning agent across every instance.',
    options: [
      {
        id: 'a',
        text: 'Deploy a third-party CVE-scanning agent to every instance in both regions using Systems Manager Run Command, and schedule it to re-scan on a recurring basis.',
      },
      {
        id: 'b',
        text: 'Write AWS Config rules that inspect the installed package inventory reported by the SSM Agent and flag instances whose package versions drift from an approved baseline.',
      },
      {
        id: 'c',
        text: 'Rely solely on the malware-specific findings already produced by GuardDuty Malware Protection to infer which other instances share the vulnerable package.',
      },
      {
        id: 'd',
        text: 'Enable Amazon Inspector, which reuses the SSM Agent already installed on managed instances to continuously assess both EC2 instances and ECR container images for known CVEs and network-reachability exposure, without installing a separate scanning agent.',
      },
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
      'A healthcare company is required by a regulatory retention mandate to keep its CloudTrail logs for 7 years and must be able to prove to an external auditor that those logs cannot be deleted or altered by anyone, including the AWS account\'s own root user, before that 7-year retention period lapses. The S3 bucket that stores those logs sits in the same account as the company\'s production workloads, which are separately backed up nightly to EBS snapshots as part of a disaster-recovery process that the infrastructure team maintains on its own separate schedule. Which configuration actually meets the stated tamper-proofing and immutability requirement for the retention period?',
    options: [
      {
        id: 'a',
        text: 'Enable S3 Object Lock in compliance mode on the CloudTrail destination bucket with a 7-year retention period applied to each object version, which prevents deletion or modification of locked versions by any principal, including the root user, until the retention period expires.',
      },
      {
        id: 'b',
        text: 'Apply a bucket policy statement that denies the s3:DeleteObject action to every principal except a designated administrators IAM group, who would still retain the ability to remove objects.',
      },
      {
        id: 'c',
        text: 'Enable S3 Versioning alone on the bucket, without pairing it with any object-lock or retention configuration, so that deletions create new delete-marker versions.',
      },
      {
        id: 'd',
        text: 'Copy the CloudTrail log files nightly onto an EBS volume that stays attached to an EC2 instance kept in the stopped state between copy operations.',
      },
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
      'A team is investigating whether a specific IAM role called GetObject and PutObject against a particular S3 bucket that stores order invoices, after noticing unexplained changes to several invoice files. CloudTrail is already enabled account-wide via the default trail, which separately streams a copy of its events to a third-party SIEM that the company is billed for per gigabyte ingested, a cost detail the team reviews during its monthly vendor-spend check. Which CloudTrail capability, once specifically enabled for this bucket, would actually capture that object-level GetObject/PutObject activity?',
    options: [
      {
        id: 'a',
        text: 'CloudTrail Insights, on the reasoning that it is designed to detect unusual account activity and would therefore surface this behavior automatically.',
      },
      {
        id: 'b',
        text: 'CloudTrail data events explicitly scoped to the S3 bucket in question, which record data-plane object-level operations such as GetObject and PutObject once turned on for that resource.',
      },
      {
        id: 'c',
        text: 'CloudTrail management events, which are enabled by default on every trail and record control-plane operations such as creating or configuring a bucket.',
      },
      {
        id: 'd',
        text: 'CloudTrail Lake\'s default dashboard view, which presents summary visualizations over whatever event data has already been ingested into the event data store.',
      },
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
      'A security engineer discovers that CloudTrail logging had been disabled in one member account within a 40-account AWS Organization, apparently as a deliberate step to hide a series of unauthorized IAM policy changes made in that account over the preceding week. The Organization\'s management account separately has an AWS Budgets alert configured to notify finance whenever monthly spend exceeds $50,000, a cost-monitoring control configured by the finance team. Having remediated the immediate issue, the engineer now wants a control that prevents any member account — including that account\'s own local administrators — from ever disabling organization-wide CloudTrail logging again, going forward, across all 40 accounts.',
    options: [
      {
        id: 'a',
        text: 'Ask each of the 40 account owners individually to manually re-enable CloudTrail in their account and verbally commit not to disable it again in the future.',
      },
      {
        id: 'b',
        text: 'Enable AWS Config in every member account with a managed rule that evaluates whether CloudTrail logging is currently enabled, alerting whenever it detects that logging has been turned off.',
      },
      {
        id: 'c',
        text: 'Create an organization trail in the management account with the "apply trail to all accounts" setting enabled, which centrally enforces logging across every member account in a way that local account administrators cannot modify or disable.',
      },
      {
        id: 'd',
        text: 'Enable GuardDuty in every member account so that any future attempt to disable CloudTrail is flagged as a finding shortly after it occurs.',
      },
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
      'A compliance team wants to know within minutes, rather than hours, whenever anyone calls the StopLogging or DeleteTrail API operations against the organization\'s central CloudTrail trail, since either call would blind the security function to further activity. That same team separately reviews Cost Explorer reports every week as part of a routine weekly FinOps ritual. What is the most direct AWS-native way to get near-real-time alerting specifically for these two API calls?',
    options: [
      {
        id: 'a',
        text: 'Wait for the next scheduled AWS Config compliance evaluation cycle to run and flag the resulting configuration drift on the trail resource.',
      },
      {
        id: 'b',
        text: 'Review Cost Explorer reports for unusual patterns during the team\'s existing weekly cost-review meeting and raise anything that looks unusual.',
      },
      {
        id: 'c',
        text: 'Enable S3 Storage Lens on the bucket that stores the CloudTrail log files, to get usage and activity metrics about that bucket.',
      },
      {
        id: 'd',
        text: 'Create a CloudWatch Logs metric filter matching StopLogging and DeleteTrail events in the CloudTrail-fed log group, attach a CloudWatch alarm to that metric, and have the alarm publish to an SNS topic that notifies the team immediately.',
      },
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
      'A retailer\'s security team suspects that a compromised host inside one of their VPCs is exfiltrating customer data using DNS tunneling to an external domain the host has never contacted before, and separately appears to be probing other internal hosts on a range of non-standard, high-numbered ports that don\'t correspond to any of the retailer\'s known applications. The team already has AWS Config enabled account-wide to track EC2 configuration drift as part of a separate compliance initiative. Select the TWO log sources that should be enabled to investigate both suspected behaviors.',
    options: [
      {
        id: 'a',
        text: 'IAM Access Analyzer external access findings, which identify resource-based policies granting access to principals outside the account or organization.',
      },
      {
        id: 'b',
        text: 'VPC Flow Logs, capturing accepted and rejected IP-level traffic metadata between hosts so that connections to unusual, non-standard ports between internal instances become visible.',
      },
      {
        id: 'c',
        text: 'AWS Trusted Advisor security checks, which surface general best-practice recommendations such as overly permissive security groups or unused access keys.',
      },
      {
        id: 'd',
        text: 'Route 53 Resolver query logging, capturing every DNS query made from within the VPC, including the unusually formed, high-frequency subdomain lookups characteristic of DNS tunneling.',
      },
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
      'A security analyst needs to run ad hoc SQL queries against a full year of CloudTrail event history in order to trace the timeline of a slow-moving reconnaissance campaign that appears to have unfolded over several months, and has been told explicitly not to provision or manage an Athena table, a Glue crawler, or an S3 lifecycle policy just to support this one investigation. The team separately relies on CloudWatch Logs Insights every day to monitor application error rates emitted by their microservices. Which capability best fits the analyst\'s stated need here?',
    options: [
      {
        id: 'a',
        text: 'CloudTrail Lake, which stores ingested events in a managed, SQL-queryable event data store with a configurable retention window, without requiring the analyst to separately provision or manage Athena, Glue, or S3 lifecycle infrastructure.',
      },
      {
        id: 'b',
        text: 'CloudWatch Logs Insights, pointed at the raw CloudTrail log files sitting in the S3 destination bucket rather than at a CloudWatch Logs log group.',
      },
      {
        id: 'c',
        text: 'AWS Config\'s advanced query feature, which runs SQL-like queries against the current and historical configuration state of resources rather than against CloudTrail API event records.',
      },
      {
        id: 'd',
        text: 'S3 Select, run individually against each CloudTrail log file object stored in the bucket, one file at a time.',
      },
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
      'A compliance officer must determine, for an upcoming audit, exactly which IAM principal, which source IP address, and which specific API operations were used against one particular customer-managed KMS key over the trailing 90 days, and needs that picture to span both the management account and every one of the linked member accounts in the Organization. The company also runs weekly Amazon Macie scans against several S3 buckets to look for exposed PII, a separate program run by the data-governance team. Where should the officer look first to answer this question?',
    options: [
      {
        id: 'a',
        text: 'VPC Flow Logs for the subnets hosting the application that calls the key, which record IP-level connection metadata rather than the specific KMS API operations invoked.',
      },
      {
        id: 'b',
        text: 'CloudTrail event history filtered to the KMS event source, correlated across the management account and every member account either through an organization trail or by querying CloudTrail Lake, which together record every principal, source IP, and API operation performed against the key.',
      },
      {
        id: 'c',
        text: 'Amazon Macie findings for whichever S3 buckets the weekly scans cover, which describe discovered sensitive-data types rather than KMS key usage.',
      },
      {
        id: 'd',
        text: 'AWS Config\'s resource configuration timeline for the key, which records changes to the key\'s own configuration (such as its key policy or rotation setting) rather than who invoked cryptographic operations against it.',
      },
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
      'A security team wants to be notified through SNS the moment any S3 bucket in the account drifts out of compliance with a rule requiring that public access remain blocked on every bucket, so they can respond before the exposure lingers. The same team already publishes a monthly conformance-pack compliance score to a leadership dashboard, but that score is explicitly described internally as a lagging, aggregate metric rather than something anyone monitors for individual, near-real-time events. What should the team configure specifically to get near-real-time notification of this particular kind of configuration change?',
    options: [
      {
        id: 'a',
        text: 'A Config resource inventory export delivered to S3 on a schedule, which the team would then review manually once a day.',
      },
      {
        id: 'b',
        text: 'A Config aggregator dashboard scoped to the whole organization, summarizing compliance state across every linked account.',
      },
      {
        id: 'c',
        text: 'An AWS Config rule evaluating the bucket\'s public-access-block setting, paired with an EventBridge rule matching that rule\'s compliance-change events, targeting an SNS topic that notifies the team as soon as the state changes.',
      },
      {
        id: 'd',
        text: 'The existing monthly conformance-pack compliance score, reviewed as part of the leadership dashboard cadence rather than on any faster schedule.',
      },
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
      'A security team operating a multi-account Organization spanning several dozen accounts wants CloudWatch Logs events generated across every one of those accounts to reach their external SIEM within seconds of being written, rather than being batched together and delivered on an hourly schedule as the current stopgap process does. The company also maintains a Config aggregator to centralize compliance data from across the Organization, a separate reporting capability the team set up last year. What AWS-native mechanism should be used to stream these log events with the least delay?',
    options: [
      {
        id: 'a',
        text: 'A scheduled Lambda function, triggered every 15 minutes, that exports the contents of relevant CloudWatch Logs log groups to an S3 bucket for later pickup.',
      },
      {
        id: 'b',
        text: 'AWS Config forwarding rules, configured to relay compliance evaluation results toward the external SIEM endpoint.',
      },
      {
        id: 'c',
        text: 'Manually downloading the relevant CloudWatch Logs data through the AWS Management Console once each day and uploading it to the SIEM.',
      },
      {
        id: 'd',
        text: 'A CloudWatch Logs subscription filter configured on each relevant log group, delivering matching log events to Kinesis Data Streams or Kinesis Data Firehose in near real time for onward delivery to the external SIEM.',
      },
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
      'A security architect is designing a centralized logging strategy for a 200-account AWS Organization ahead of an upcoming SOC 2 audit that will specifically scrutinize log integrity and access controls around the logging pipeline itself. Engineering leadership has separately kicked off an initiative to cut overall EC2 spend by 10% through broader adoption of Savings Plans, a cost-optimization effort running on a similar timeline. Select the TWO recommended practices for this logging design.',
    options: [
      {
        id: 'a',
        text: 'Deliver logs from every member account into a single, dedicated logging account whose access is tightly restricted to a small set of security personnel, separate from the accounts that generated the logs.',
      },
      {
        id: 'b',
        text: 'Store each account\'s logs only within that same account, on the reasoning that keeping logs local simplifies the IAM policies needed to manage access to them.',
      },
      {
        id: 'c',
        text: 'Enable monitoring on the central log bucket itself — for example, S3 server access logging or CloudTrail data events scoped to that bucket — specifically to detect unauthorized access attempts against the logs.',
      },
      {
        id: 'd',
        text: 'Grant every engineer in the organization read/write access to the central logging account\'s bucket so that any of them can self-serve troubleshooting without opening a request to the security team.',
      },
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
      'A logistics company\'s cloud team is preparing materials for an upcoming budget review that will also cover a separate $12,000/month spend on a data-warehousing service, and as part of that review they want to understand precisely how CloudTrail management events are billed. Separately, on the same team, a security analyst wants to know whether turning on CloudTrail Insights would help detect a recent spike in IAM policy changes that appear to have occurred outside normal business hours. Both of these separate questions ultimately hinge on understanding what actually distinguishes a plain CloudTrail management event from a CloudTrail Insight event, both functionally and in terms of billing.',
    options: [
      {
        id: 'a',
        text: 'Management events log control-plane API calls as they occur, while Insight events separately analyze that underlying activity to flag anomalies such as unusual API call volume or error-rate spikes; AWS delivers one copy of management events free to one trail per region, while additional trails, data events, and Insights events are each billed separately.',
      },
      {
        id: 'b',
        text: 'Insight events are always free of charge, while management events always incur a cost regardless of how the trail is configured or how many copies are delivered.',
      },
      {
        id: 'c',
        text: 'There is no meaningful functional or billing difference between the two; both simply log the fact that some API call occurred, with identical detail.',
      },
      {
        id: 'd',
        text: 'Management events only ever cover S3 API calls, while Insight events cover activity from every other AWS service besides S3.',
      },
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
      'An auditor reviewing VPC Flow Logs roughly six months after they were first enabled on a critical subnet notices a pattern of repeated REJECT entries recorded for traffic flowing between two specific instances that the application owners insist should be able to communicate freely with each other. The subnet\'s route table has not been modified at all during that six-month period, and both instances\' IAM roles are attached with the AdministratorAccess managed policy, which the auditor initially suspected might somehow be the cause of the rejected traffic. Which resource is actually responsible for producing a REJECT action recorded in a VPC Flow Log entry?',
    options: [
      {
        id: 'a',
        text: 'An S3 bucket policy attached to a completely unrelated bucket elsewhere in the account.',
      },
      {
        id: 'b',
        text: 'A security group or network ACL that is denying the traffic at the network layer, based on its configured inbound or outbound rule evaluation for that traffic.',
      },
      {
        id: 'c',
        text: 'The instances\' attached IAM role permissions, such as the AdministratorAccess policy the auditor initially suspected of causing the rejection.',
      },
      {
        id: 'd',
        text: 'A KMS key policy applied to an encrypted EBS volume attached to one of the two instances.',
      },
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
      'A fintech company runs a fleet of EC2 instances inside private subnets with no route to an internet gateway, and those instances must call the S3 and DynamoDB APIs to process end-of-day settlement files without that traffic ever traversing the public internet. The workload currently handles roughly 4 million API requests per day. Leadership has stated the connectivity solution chosen must add the least possible ongoing AWS cost, given that both major private-connectivity options under consideration would technically satisfy the "never touches the public internet" requirement.',
    options: [
      {
        id: 'a',
        text: 'Deploy a NAT gateway in each of the private subnets so that outbound calls to S3 and DynamoDB route through the NAT gateway toward the AWS public service endpoints.',
      },
      {
        id: 'b',
        text: 'Create interface VPC endpoints, backed by AWS PrivateLink, for both the S3 and DynamoDB service APIs, so that traffic reaches each service through an elastic network interface provisioned inside the VPC.',
      },
      {
        id: 'c',
        text: 'Configure gateway VPC endpoints for both S3 and DynamoDB, which add prefix-list-based route table entries directing traffic to each service privately with no hourly or per-gigabyte endpoint charge.',
      },
      {
        id: 'd',
        text: 'Attach an internet gateway to the private subnets and rely on security group rules to restrict which sources can reach the instances, while allowing outbound internet-routed calls to S3 and DynamoDB.',
      },
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
      'A network engineer at a logistics company is troubleshooting connectivity inside a VPC that also happens to have S3 Transfer Acceleration enabled for an upload pipeline used by a different internal team. While comparing the two network-layer controls that protect a particular subnet, the engineer observes that return traffic destined for an external client is evaluated rule-by-rule, in numbered order, at the subnet boundary for both the inbound and outbound direction independently, whereas traffic flowing between two instances that sit in the same subnet is automatically permitted back once some initial rule allows the outbound leg, with no separate explicit return-traffic rule required at all. The engineer also notices that the VPC\'s DHCP option set had been customized about six months earlier to support an internal DNS requirement. Which statement correctly explains what the engineer is seeing?',
    options: [
      {
        id: 'a',
        text: 'Security groups are stateless devices, while network ACLs are the stateful control that automatically tracks and permits return traffic.',
      },
      {
        id: 'b',
        text: 'Both controls being described are actually stateless, and each therefore requires an explicit outbound allow rule to be defined before return traffic will be permitted.',
      },
      {
        id: 'c',
        text: 'Network ACLs apply individually to specific EC2 instances, while security groups apply broadly to every instance within an entire subnet.',
      },
      {
        id: 'd',
        text: 'Security groups are stateful and automatically evaluate all applicable allow rules at the instance/ENI level, permitting return traffic without an explicit rule, while network ACLs are stateless and evaluate their numbered rules in order at the subnet level, requiring explicit rules for both directions.',
      },
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
      'An application sitting behind an Application Load Balancer has been receiving a steady stream of SQL injection attempts originating from a constantly rotating range of source IP addresses, none of which repeats often enough to make IP-based blocking practical on its own. A marketing team separately manages a CloudFront distribution used to serve static marketing assets, running on infrastructure independent of the affected ALB. The security team wants to block the malicious requests before they ever reach the application, and specifically wants a solution with the least ongoing operational overhead, rather than a path that requires them to design, build, and continuously maintain custom pattern-detection logic of their own.',
    options: [
      {
        id: 'a',
        text: 'Associate an AWS WAF web ACL with the ALB and enable one of the AWS-managed rule groups that already includes maintained SQL injection detection signatures, updated by AWS over time.',
      },
      {
        id: 'b',
        text: 'Write and deploy a custom Lambda@Edge function that inspects the body of every incoming request for patterns the team believes are indicative of SQL injection, and continues refining that detection logic as new patterns emerge.',
      },
      {
        id: 'c',
        text: 'Enable AWS Shield Standard on the ALB, relying on its automatic protection against common network and transport-layer (Layer 3/4) DDoS attack vectors.',
      },
      {
        id: 'd',
        text: 'Add a network ACL rule at the subnet level that blocks inbound traffic on port 443 from each of the specific source IP ranges observed making the malicious requests so far.',
      },
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
      'A gaming company bracing for a launch-day traffic surge wants three things simultaneously: strong protection against large-scale volumetric DDoS attacks targeting their public-facing infrastructure, direct access to AWS\'s dedicated 24/7 DDoS Response Team (DRT) they can engage during an active attack, and financial cost protection against the scaling charges that a large-scale attack against their Auto Scaling infrastructure might otherwise cause them to incur. The company currently operates under an AWS Basic Support plan, which does not include a technical account manager or any elevated support-case response times. Select the TWO things that are actually required, together, to obtain all of the stated capabilities.',
    options: [
      {
        id: 'a',
        text: 'A subscription to AWS Shield Advanced, applied to the relevant public-facing resources such as the ALB, CloudFront distribution, or Elastic IP addresses.',
      },
      {
        id: 'b',
        text: 'AWS Shield Standard only, relying on the baseline protection that is included automatically at no additional cost for every AWS customer.',
      },
      {
        id: 'c',
        text: 'AWS WAF configured with a rate-based rule that limits the number of requests permitted per source IP address over a rolling time window.',
      },
      {
        id: 'd',
        text: 'An upgrade from AWS Basic Support to an AWS Business or Enterprise Support plan, which is required in order to directly engage the Shield Response Team during an active attack.',
      },
    ],
    correctAnswers: ['a', 'd'],
    explanation:
      'Shield Advanced provides the enhanced protection and cost protection, but direct engagement with the Shield Response Team additionally requires a Business or Enterprise Support plan. Shield Standard alone provides only baseline network/transport-layer protection with no DRT access or cost protection, and a WAF rate-based rule can throttle abusive request patterns at Layer 7, but by itself provides neither Shield Response Team engagement nor the scaling-cost protection the requirement calls for.',
  },
  {
    id: 'is-005',
    domain: 'Infrastructure Security',
    questionType: 'single',
    question:
      'A manufacturing company wants its on-premises factory-floor control systems to reach specific resources inside a VPC over a dedicated, private, consistently high-bandwidth physical connection that avoids the public internet entirely, rather than relying on an encrypted tunnel that, despite being encrypted, still physically rides over the shared public internet to get there. The same company\'s public marketing website is served through a CloudFront distribution, a completely separate piece of infrastructure serving the company\'s public marketing traffic.',
    options: [
      {
        id: 'a',
        text: 'AWS PrivateLink, provisioned as an interface endpoint that connects to a specific published service rather than to the on-premises network as a whole.',
      },
      {
        id: 'b',
        text: 'AWS Direct Connect, which establishes a dedicated, private physical network connection between the on-premises facility and an AWS Direct Connect location that never traverses the public internet.',
      },
      {
        id: 'c',
        text: 'A site-to-site VPN connection that encrypts traffic between the on-premises network and the VPC but still transmits that encrypted traffic over the shared public internet.',
      },
      {
        id: 'd',
        text: 'Amazon CloudFront configured with a custom origin pointing at resources inside the VPC, used as a content-delivery layer rather than a private network link.',
      },
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
      'A security engineer wants an ironclad guarantee that EC2 instances launched anywhere in a shared VPC can never receive a public IP address, with that guarantee enforced automatically the instant someone attempts a non-compliant launch, rather than a control that only catches the violation sometime after the instance is already running. The team already has a Slack alert wired up to fire whenever GuardDuty raises a relevant finding, which fires a notification shortly after GuardDuty raises a matching finding.',
    options: [
      {
        id: 'a',
        text: 'Rely on GuardDuty to flag, sometime after the fact, any instance that ends up receiving a public IP address once it has already launched.',
      },
      {
        id: 'b',
        text: 'Enable an AWS Config rule that evaluates instance configuration and flags any noncompliant instance during the rule\'s next scheduled evaluation cycle.',
      },
      {
        id: 'c',
        text: 'Disable the auto-assign public IP setting on every relevant subnet in the VPC, and additionally add an IAM or SCP deny condition on the ec2:RunInstances action that checks the associatePublicIpAddress request parameter, blocking non-compliant launch requests outright.',
      },
      {
        id: 'd',
        text: 'Require a manual console review by a security team member of every proposed launch configuration before it is approved and executed.',
      },
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
      'An enterprise operating more than 300 accounts under one AWS Organization wants a single central team to define WAF rule groups, Network Firewall policies, and standard security group configurations exactly once, and have those policies automatically applied both to every existing VPC across the estate and to any newly vended account going forward, without the central team having to manually redeploy the same policy set into each new environment as it appears. That same central team separately reviews AWS Trusted Advisor cost-optimization checks every week, a routine led by a different member of the team.',
    options: [
      {
        id: 'a',
        text: 'AWS Config, using conformance packs deployed through CloudFormation StackSets to detect and, where remediation actions are configured, correct drift from a defined baseline.',
      },
      {
        id: 'b',
        text: 'Amazon Inspector configured at the AWS Organizations level, delegating an administrator account to view vulnerability findings across every member account.',
      },
      {
        id: 'c',
        text: 'AWS Trusted Advisor, relying on its existing set of best-practice checks across cost, performance, security, and fault tolerance.',
      },
      {
        id: 'd',
        text: 'AWS Firewall Manager, integrated with AWS Organizations, to centrally define and automatically enforce WAF rule groups, Network Firewall policies, and security group policies across both existing accounts/VPCs and any newly created ones.',
      },
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
      'A company wants stateful, network-layer traffic filtering that includes intrusion prevention capabilities and domain-name-based filtering, applied consistently across multiple VPCs from a single centrally managed policy, going meaningfully beyond what security groups and network ACLs are capable of providing on their own. The team already has Route 53 Resolver DNS Firewall enabled to block a specific list of known malware domains, strictly at the DNS-resolution layer and nowhere else in the traffic path.',
    options: [
      {
        id: 'a',
        text: 'AWS Network Firewall, configured with Suricata-compatible intrusion-prevention rule groups and domain-list filtering, with policy centrally managed across VPCs through AWS Firewall Manager.',
      },
      {
        id: 'b',
        text: 'Expanding the existing security group rule sets on the affected VPCs to cover a broader range of ports and protocols than they currently allow.',
      },
      {
        id: 'c',
        text: 'Continuing to rely solely on the existing Route 53 Resolver DNS Firewall configuration to cover this broader traffic-inspection requirement as well.',
      },
      {
        id: 'd',
        text: 'AWS WAF, associated directly with each VPC\'s application resources, to provide Layer 7 web-application filtering across the environment.',
      },
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
      'A three-tier web application consists of a public-facing Application Load Balancer, an application tier made up of EC2 instances sitting in private subnets, and an RDS database instance placed in a further isolated set of subnets with no route to the internet at all. The team responsible for this application is separately migrating the RDS engine to a different, compatible database engine for feature-parity reasons decided independently by the database team. Select the TWO security group configurations that correctly implement least privilege across these three tiers.',
    options: [
      {
        id: 'a',
        text: 'The application tier\'s security group is configured to allow inbound traffic only from the ALB\'s security group, and only on the specific application port the app listens on.',
      },
      {
        id: 'b',
        text: 'The RDS security group is configured to allow inbound traffic only from the application tier\'s security group, and only on the specific database port the engine listens on.',
      },
      {
        id: 'c',
        text: 'The RDS security group is configured to allow inbound traffic from 0.0.0.0/0 on the database port, on the reasoning that this makes troubleshooting connectivity issues simpler for the team.',
      },
      {
        id: 'd',
        text: 'The application tier\'s security group is configured to allow inbound traffic from 0.0.0.0/0 across all ports, so that no legitimate client request is ever accidentally blocked.',
      },
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
      'A retailer hosting a static storefront and a backend API wants protection against both Layer 3/4 and Layer 7 DDoS attacks, while also caching content at edge locations around the world to reduce the load hitting the origin during high-traffic flash sales. The same team separately runs an AWS Direct Connect connection to a co-located data center that supports a separate internal analytics pipeline. Which combination of services satisfies both the caching requirement and the DDoS-protection requirement while requiring the least amount of custom infrastructure for the team to build and maintain?',
    options: [
      {
        id: 'a',
        text: 'A self-managed fleet of NAT gateways placed behind an Auto Scaling group configured to add capacity automatically in response to traffic spikes.',
      },
      {
        id: 'b',
        text: 'Amazon CloudFront as the content-delivery layer, with AWS Shield automatically included for baseline DDoS protection and AWS WAF associated with the distribution for Layer 7 filtering.',
      },
      {
        id: 'c',
        text: 'Amazon S3 Transfer Acceleration alone, relying on its accelerated upload path to help the origin keep up during flash sales.',
      },
      {
        id: 'd',
        text: 'AWS Direct Connect, extended and reconfigured to carry all public customer-facing traffic in addition to its existing internal analytics workload.',
      },
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
      'Company A wants to expose one specific internal microservice so that consumers inside Company B\'s VPC can reach it, but the two companies\' VPCs happen to have overlapping CIDR ranges as a leftover artifact of a historical merger-and-acquisition situation, and Company A has stated firmly that it does not want the microservice exposed to the public internet under any circumstances. Company B separately uses an AWS Transit Gateway to interconnect a set of its own VPCs that all have non-overlapping CIDR ranges. Which solution meets Company A\'s requirements despite that CIDR overlap?',
    options: [
      {
        id: 'a',
        text: 'VPC peering established directly between Company A\'s and Company B\'s VPCs, routing traffic between them based on their respective CIDR ranges.',
      },
      {
        id: 'b',
        text: 'Adding both Company A\'s and Company B\'s VPCs as attachments to Company B\'s existing Transit Gateway, so traffic routes between them through that shared hub.',
      },
      {
        id: 'c',
        text: 'AWS PrivateLink, where Company A publishes a VPC endpoint service backed by its internal microservice, and Company B\'s VPC consumes that service through an interface endpoint, without either company needing full network-level routing between the two VPCs.',
      },
      {
        id: 'd',
        text: 'A public-facing Network Load Balancer in front of the microservice, with a security group restricted to allow traffic only from Company B\'s known source IP ranges.',
      },
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
      'Amazon Inspector has been continuously reporting a critical-severity CVE in a particular version of an OpenSSL package installed on several dozen EC2 instances, all of which happen to be tagged for an internal cost-allocation project. The security team wants a fix that permanently eliminates the vulnerability both for the instances currently running in the fleet and for every future instance launched from the same golden-image baseline, rather than a stopgap that only reduces exposure temporarily until the underlying package is eventually addressed.',
    options: [
      {
        id: 'a',
        text: 'Suppress the finding directly within Amazon Inspector\'s console so that it no longer appears in the dashboard as an outstanding, unresolved item.',
      },
      {
        id: 'b',
        text: 'Add a security group rule that blocks all inbound traffic to the affected instances, cutting off any potential path an attacker could use to reach the vulnerable OpenSSL package.',
      },
      {
        id: 'c',
        text: 'Disable Amazon Inspector scanning specifically for the affected instances so the finding stops being generated against them going forward.',
      },
      {
        id: 'd',
        text: 'Patch the vulnerable OpenSSL package on the running fleet using a Systems Manager Patch Manager patch baseline, and then rebuild the golden AMI so that every future instance launched from that baseline already includes the fix.',
      },
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
      'A company is redesigning how administrators reach EC2 instances sitting in private subnets, with the explicit goals of eliminating every open inbound SSH and RDP port across the fleet and retiring its legacy bastion host entirely. That bastion host\'s security group currently allows inbound SSH only from a fixed corporate office IP range that is now being decommissioned as the company transitions to a fully remote workforce with no single office network to anchor a source-IP allowlist against. Select the TWO AWS-native approaches that achieve both stated goals.',
    options: [
      {
        id: 'a',
        text: 'Temporarily open the bastion host\'s security group to allow inbound SSH from 0.0.0.0/0 during the period while the office network is being decommissioned, to avoid locking anyone out.',
      },
      {
        id: 'b',
        text: 'AWS Systems Manager Session Manager, which uses the SSM Agent already present on managed instances together with IAM policies to authorize interactive sessions, without requiring any inbound network port to be opened on the instance.',
      },
      {
        id: 'c',
        text: 'An EC2 Instance Connect Endpoint, which brokers SSH and RDP connectivity to instances through a VPC endpoint, without the instance needing a public IP address or a traditional bastion host in the path.',
      },
      {
        id: 'd',
        text: 'Generate a single shared SSH key pair for the whole remote team and distribute it through a shared entry in a password manager so everyone can continue accessing instances the same way as before.',
      },
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
      'A contractor\'s IAM user has an identity-based policy attached that grants s3:* on all resources ("Resource": "*"), added specifically to speed up onboarding during the contractor\'s first week, and separately has a permissions boundary attached that allows only the s3:GetObject and s3:ListBucket actions, matching the company\'s standard contractor baseline that security requires for every external contractor account. The contractor\'s laptop is also enrolled in an MDM policy that requires full-disk encryption, a device-security control enforced by the company\'s MDM policy. What is the effective, actual result when the contractor\'s IAM user attempts to call s3:PutObject against a bucket it otherwise has network access to?',
    options: [
      {
        id: 'a',
        text: 'The call is denied, because effective permissions are the intersection of what the identity-based policy allows and what the permissions boundary allows, and since the boundary does not include s3:PutObject, that intersection excludes it.',
      },
      {
        id: 'b',
        text: 'The call is allowed, because the identity-based policy grants s3:* and permissions boundaries are a construct that only applies to IAM roles, never to IAM users.',
      },
      {
        id: 'c',
        text: 'The call is allowed, because permissions boundaries are an advisory, documentation-only construct in IAM and are not actually enforced during authorization evaluation.',
      },
      {
        id: 'd',
        text: 'The call is denied, because attaching any permissions boundary to a principal causes that principal to be denied every action by default, regardless of what its identity-based policy separately allows.',
      },
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
      'A security team at a 25-account AWS Organization wants an absolute guarantee that no principal in any member account — including that account\'s own root user, and including an administrator who grants themselves the AdministratorAccess managed policy after the fact — can ever disable GuardDuty in that account or cause the account to leave the Organization entirely. This requirement follows a recent incident in which a departing contractor briefly retained elevated IAM access in one member account for several hours after their offboarding ticket was supposedly closed. The team already has a CloudWatch alarm configured to email them whenever GuardDuty coverage drops in any account, which only ever alerts them after the fact once coverage has already lapsed. The team separately runs a monthly access-review meeting attended by each account\'s application owner, a recurring item on the team\'s governance calendar.',
    options: [
      {
        id: 'a',
        text: 'An IAM permissions boundary applied individually to every IAM user and role across all 25 accounts, capping what each of them is permitted to do.',
      },
      {
        id: 'b',
        text: 'A Service Control Policy attached at the appropriate organizational unit that explicitly denies the relevant GuardDuty-disabling and Organizations-leaving actions, since SCPs are enforced against every principal in the affected accounts, including the account\'s own root user, regardless of what IAM policies exist locally.',
      },
      {
        id: 'c',
        text: 'The existing CloudWatch alarm that already emails the team whenever GuardDuty coverage drops in any account, since it provides ongoing visibility into the account\'s security posture.',
      },
      {
        id: 'd',
        text: 'A resource-based policy attached directly to the GuardDuty detector resource in each account, restricting which principals may modify or delete that detector.',
      },
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
      'A developer deploying a new application onto EC2 needs that application to call several AWS APIs, and has been told to avoid any hardcoded or long-lived secret entirely, using instead credentials that rotate automatically on their own schedule and require zero application-level rotation logic to be written or maintained. The application separately writes its own operational logs to a local file that gets rotated daily by logrotate on the instance, a routine logging detail configured by the application\'s original developer.',
    options: [
      {
        id: 'a',
        text: 'Create a long-term IAM user access key and secret key pair, and set them as an environment variable that gets populated at instance launch time via user data.',
      },
      {
        id: 'b',
        text: 'Hardcode the IAM user\'s access key and secret key directly into the application\'s source code repository so they are always available wherever the code is deployed.',
      },
      {
        id: 'c',
        text: 'Attach an IAM role to the EC2 instance profile, so the application retrieves short-lived, automatically rotated temporary credentials from the instance metadata service, with no long-lived secret ever stored anywhere.',
      },
      {
        id: 'd',
        text: 'Store a long-term IAM user\'s access key in AWS Secrets Manager and have the application fetch that access key and cache it locally at startup.',
      },
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
      'A company migrating away from a legacy, home-grown single-sign-on portal that has been built and maintained in-house for the past eight years is now evaluating AWS IAM Identity Center as the replacement for centralized access across its 60-account Organization. The overall migration project also includes retiring an old on-call paging tool in favor of a modern incident-management platform, a separate initiative running on roughly the same timeline. During a design review, one engineer claims that adopting IAM Identity Center will let the company delete every IAM role in every account entirely, while a second engineer isn\'t sure whether IAM Identity Center can federate with the company\'s existing Okta deployment at all. Select the TWO statements about IAM Identity Center that are actually correct.',
    options: [
      {
        id: 'a',
        text: 'IAM Identity Center replaces the need for IAM roles entirely, meaning every existing IAM role in every account can be deleted once it is adopted.',
      },
      {
        id: 'b',
        text: 'IAM Identity Center can only ever be used with a single, standalone AWS account, and has no support for use across an AWS Organization with multiple member accounts.',
      },
      {
        id: 'c',
        text: 'IAM Identity Center can federate with an external identity provider, such as the company\'s existing Okta deployment or Azure AD, using the SAML 2.0 protocol.',
      },
      {
        id: 'd',
        text: 'IAM Identity Center provides centralized, temporary-credential-based access to multiple accounts across an Organization from a single sign-in, and it is itself built on top of underlying IAM roles rather than replacing them.',
      },
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
      'During a routine cost review that also happened to flag an oversized, underutilized RDS instance elsewhere in the account, a security team stumbles onto an S3 bucket policy that grants public read access to an entire bucket. Rather than continuing to rely on stumbling across issues like this during routine reviews, the team now wants a service that proactively and continuously analyzes resource-based policies account-wide — covering S3 bucket policies, KMS key policies, and IAM role trust policies alike — and flags anything that is reachable from outside their defined zone of trust.',
    options: [
      {
        id: 'a',
        text: 'AWS CloudTrail event history, reviewed periodically to look for API calls that might indicate a resource-based policy was changed to grant broader access.',
      },
      {
        id: 'b',
        text: 'AWS Trusted Advisor\'s cost-optimization checks, the same category of check that surfaced the oversized RDS instance during that cost review.',
      },
      {
        id: 'c',
        text: 'Amazon Macie, applied across the account to continuously evaluate resource-based policies for external accessibility.',
      },
      {
        id: 'd',
        text: 'IAM Access Analyzer, which uses automated reasoning to continuously evaluate resource-based policies such as S3 bucket policies, KMS key policies, and IAM role trust policies, and flags any that grant access to a principal outside the account\'s defined zone of trust.',
      },
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
      'A company wants employees who are already authenticated against its on-premises Active Directory to be able to assume an IAM role in AWS, with the specific permissions of that role scoped according to which AD group the employee belongs to, and specifically without creating a separate, individual IAM user account for every single employee in the company. The company\'s helpdesk team separately manages VPN client certificates used for remote network access, a separate helpdesk responsibility handled by a different rotation of staff.',
    options: [
      {
        id: 'a',
        text: 'SAML 2.0 federation from an on-premises AD FS server to an IAM role, using group- or attribute-based mappings embedded in the SAML assertion to scope the permissions of each resulting role session according to AD group membership.',
      },
      {
        id: 'b',
        text: 'Create a matching IAM user account for every single Active Directory user, keeping each IAM user\'s password synchronized with that employee\'s AD password.',
      },
      {
        id: 'c',
        text: 'Share a single long-term IAM access key among the entire team, so everyone authenticates to AWS using the same set of credentials.',
      },
      {
        id: 'd',
        text: 'Distribute the AWS account\'s root user credentials to members of the helpdesk team so they can provision access for employees as requests come in.',
      },
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
      'A Lambda function\'s execution role currently has the AdministratorAccess managed policy attached to it, a configuration flagged during a recent internal security review. The same function has a reserved concurrency setting of 5, a performance-and-cost configuration that limits how many concurrent invocations it can have. The team now wants to right-size the role\'s permissions based on the function\'s actual, observed API behavior over some period of real operation, rather than guessing at an appropriate policy purely from reading service documentation.',
    options: [
      {
        id: 'a',
        text: 'Remove the execution role from the function entirely, leaving the Lambda function with no attached IAM role or permissions at all.',
      },
      {
        id: 'b',
        text: 'Use IAM Access Analyzer\'s policy generation feature, which reviews the role\'s actual recorded CloudTrail activity over a chosen historical period and proposes a least-privilege policy, grounded in that observed usage, for the team to review and refine before applying it.',
      },
      {
        id: 'c',
        text: 'Replace the AdministratorAccess policy with the AWS-managed PowerUserAccess policy instead, since PowerUserAccess excludes some IAM- and Organizations-related actions that AdministratorAccess includes.',
      },
      {
        id: 'd',
        text: 'Leave the function\'s current AdministratorAccess policy exactly as it is, on the reasoning that Lambda execution roles are commonly over-permissioned in practice across the industry anyway.',
      },
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
      'A company wants to require multi-factor authentication for a defined set of sensitive AWS API and console actions across its entire Organization, a requirement that emerged during a brainstorming session that also separately floated a proposal to shorten the password rotation interval from 90 days down to 60 days. Select the TWO effective, AWS-native ways to actually enforce MFA for those sensitive actions.',
    options: [
      {
        id: 'a',
        text: 'Ask users to type their password twice in a row during the console login flow, as a second confirmation step.',
      },
      {
        id: 'b',
        text: 'An IAM policy statement with a condition requiring aws:MultiFactorAuthPresent to be true before the sensitive actions covered by that policy are permitted.',
      },
      {
        id: 'c',
        text: 'Shortening the password rotation period across the Organization from 90 days down to 60 days, as was separately proposed during the same brainstorming session.',
      },
      {
        id: 'd',
        text: 'A Service Control Policy that denies the same sensitive actions whenever aws:MultiFactorAuthPresent evaluates to false, enforced organization-wide regardless of whatever local IAM policy configuration exists in each member account.',
      },
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
      'An organization that is about to vend its 50th AWS account wants every newly created account to automatically receive a consistent security baseline — including preventive guardrails, centralized logging configuration, and a dedicated audit/security account structure — the instant the account is created, with no manual setup checklist for anyone to follow. This follows a routine internal audit that found manual account-provisioning steps had been completed inconsistently across different engineering teams over the preceding year. The team is separately evaluating, on an undecided timeline, whether to also adopt a third-party CSPM tool available through AWS Marketplace.',
    options: [
      {
        id: 'a',
        text: 'AWS IAM Access Analyzer, run manually as a one-time check by a security engineer immediately after each new account is created.',
      },
      {
        id: 'b',
        text: 'AWS Organizations by itself, paired with a set of custom Lambda functions the team builds and maintains, triggered on account creation, deliberately without adopting AWS Control Tower.',
      },
      {
        id: 'c',
        text: 'AWS Control Tower\'s Account Factory, which automates the setup of a secure multi-account landing zone and applies the defined guardrails automatically to every newly vended account at the moment of creation.',
      },
      {
        id: 'd',
        text: 'AWS Service Catalog, publishing a self-service portfolio item that provisions a new account whenever someone submits a request through the catalog.',
      },
    ],
    correctAnswers: ['c'],
    explanation:
      'Control Tower\'s Account Factory automates the consistent baseline (guardrails, logging, account structure) the moment an account is created, closing exactly the inconsistency the audit found. A custom Lambda-based Organizations automation could technically replicate parts of this, but it means building and maintaining that automation themselves rather than using an already-automated, purpose-built landing zone; Service Catalog can standardize self-service provisioning, but it applies a catalog item on request rather than automatically applying guardrails the instant an account is vended; and Access Analyzer run manually still leaves a gap before someone executes it.',
  },
  {
    id: 'iam-010',
    domain: 'Identity and Access Management',
    questionType: 'single',
    question:
      'A security engineer at Company A needs to grant an application running as an IAM role in Company A\'s account read access to a set of S3 buckets that are owned and managed by Company B, under the specific constraint that Company B must not have to provision any IAM users, share any long-term access keys, or create and continually maintain a brand-new IAM role purely so Company A can assume it. Company B separately enforces S3 Object Lock on those buckets for its own retention-compliance reasons. Which approach best satisfies all of the stated constraints while adding the least ongoing credential-management overhead for Company B?',
    options: [
      {
        id: 'a',
        text: 'Company B creates a dedicated IAM user scoped to the relevant buckets and shares that IAM user\'s long-term access key directly with Company A.',
      },
      {
        id: 'b',
        text: 'Company B creates a new IAM role with a trust policy allowing Company A\'s account to assume it, and Company A\'s application calls sts:AssumeRole to obtain temporary credentials before each access to the buckets.',
      },
      {
        id: 'c',
        text: 'Company B temporarily disables the Block Public Access setting on the affected buckets so that Company A\'s application can reach the objects without any explicit access grant being configured at all.',
      },
      {
        id: 'd',
        text: 'Company B\'s S3 bucket policy grants access directly to Company A\'s specific IAM role ARN as the named principal, which requires no new IAM role creation and no key sharing on Company B\'s part at all.',
      },
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
      'A payments company storing transaction receipts in S3 needs an encryption approach where AWS manages the underlying durability and availability of the cryptographic key material itself, while the company retains full control over the key\'s rotation policy and key policy, and can audit every single cryptographic operation performed against that key through CloudTrail. The bucket in question also has S3 Intelligent-Tiering enabled to optimize storage cost across access tiers, a configuration the storage team set up last quarter. The company additionally maintains a strict internal policy that forbids its own engineers from ever handling raw key material directly, under any circumstances.',
    options: [
      {
        id: 'a',
        text: 'SSE-KMS using a customer managed KMS key, where the company defines and controls the key policy and rotation setting while AWS KMS itself stores and protects the underlying key material.',
      },
      {
        id: 'b',
        text: 'SSE-S3, which encrypts objects using keys that are fully owned and managed by AWS with no customer-controlled key policy exposed at all.',
      },
      {
        id: 'c',
        text: 'SSE-C, where the company supplies its own encryption key as part of every single S3 request, and AWS does not store that key at all after the request completes.',
      },
      {
        id: 'd',
        text: 'Client-side encryption using a key that is generated and stored entirely outside of any AWS service, managed independently by the company\'s own key-management infrastructure.',
      },
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
      'A security team must guarantee that a particular KMS customer managed key can never be used by any principal outside of a specific, pre-approved list of IAM roles, even in the scenario where some future overly permissive IAM policy is mistakenly attached to an entirely different role somewhere else in the account. The account also uses AWS Config conformance packs to monitor a separate set of S3 public-access settings. Given that IAM policies elsewhere in the account cannot be fully trusted to always remain correctly scoped over time, where must this restriction ultimately be enforced to hold regardless of what any other IAM policy in the account says?',
    options: [
      {
        id: 'a',
        text: 'Solely within the IAM policies attached to each of the specific approved roles, with no corresponding restriction placed on the key itself.',
      },
      {
        id: 'b',
        text: 'In the KMS key policy, which is the primary access-control document that is always consulted for any attempted use of that specific key, regardless of what IAM policies exist elsewhere in the account.',
      },
      {
        id: 'c',
        text: 'In an S3 bucket policy that references the KMS key\'s ARN, restricting which principals may use that key when accessing objects in that particular bucket.',
      },
      {
        id: 'd',
        text: 'In a security group rule that limits network-level access to the regional KMS service endpoint from specific subnets.',
      },
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
      'A company wants a KMS customer managed key\'s underlying cryptographic material to rotate automatically on a roughly annual cadence, without ever having to update the key\'s ARN, its alias, or any application configuration that references it, and critically without needing to re-encrypt any of the data that was previously encrypted under that key. The team separately spent some time debating whether to rename an S3 bucket as part of a rebranding effort, a discussion held during a separate planning meeting.',
    options: [
      {
        id: 'a',
        text: 'Manually create a brand-new KMS key every year and update every single application reference throughout the environment to point at the new key\'s ARN.',
      },
      {
        id: 'b',
        text: 'Use SSE-C with a client-supplied encryption key that the application itself is responsible for rotating on its own recurring cron-scheduled job.',
      },
      {
        id: 'c',
        text: 'Enable automatic key rotation directly on the customer managed KMS key, which rotates the underlying cryptographic material on approximately a yearly basis while preserving the same key ID and ARN and keeping previously encrypted data decryptable without any re-encryption.',
      },
      {
        id: 'd',
        text: 'Disable the existing key once a year and create a brand-new replacement key registered under the exact same alias each time.',
      },
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
      'A media company wants to protect its archival video assets stored in S3 from accidental permanent deletion or overwrite, with the ability to recover a prior version of an object for at least 90 days even in the scenario where someone who legitimately holds valid delete permissions removes it. The bucket also has cross-region replication configured for disaster-recovery purposes, but that replication configuration by itself does nothing to stop a delete operation from simply replicating through to the second region as well. Select the TWO S3 features that should be enabled together to meet this recovery requirement.',
    options: [
      {
        id: 'a',
        text: 'S3 Versioning, so that a delete operation on a versioned object creates a delete marker rather than permanently destroying the prior version of that object.',
      },
      {
        id: 'b',
        text: 'S3 Transfer Acceleration, used to speed up the upload of newly created video assets into the bucket over long network distances.',
      },
      {
        id: 'c',
        text: 'S3 Object Lock configured in governance mode with a 90-day retention period applied to object versions, preventing those versions from being permanently removed until the retention period has elapsed.',
      },
      {
        id: 'd',
        text: 'S3 Intelligent-Tiering, which automatically moves older, less-frequently-accessed assets into cheaper storage classes over time.',
      },
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
      'A data science team must discover and classify sensitive data such as personally identifiable information and payment card numbers that are scattered across dozens of S3 buckets accumulated organically over several years of different projects, and has been asked to use managed, machine-learning-based data identifiers to do this rather than writing and maintaining a set of custom regular-expression scripts themselves. The same team separately uses Amazon SageMaker for a separate model-training workload.',
    options: [
      {
        id: 'a',
        text: 'AWS Config, using a custom rule that inspects the tags applied to each S3 bucket to infer whether it might contain sensitive data.',
      },
      {
        id: 'b',
        text: 'Amazon GuardDuty S3 Protection, which analyzes CloudTrail S3 data events for anomalous access patterns rather than examining the actual content of stored objects.',
      },
      {
        id: 'c',
        text: 'AWS Trusted Advisor\'s security checks, which surface general configuration best-practice findings rather than performing content-level data classification.',
      },
      {
        id: 'd',
        text: 'Amazon Macie, using its managed, machine-learning-based data identifiers to automatically discover and classify sensitive data such as PII and payment card numbers across all of the buckets.',
      },
    ],
    correctAnswers: ['d'],
    explanation:
      'Macie uses machine learning and managed data identifiers built specifically for discovering and classifying sensitive data at scale in S3. GuardDuty S3 Protection sounds like a strong S3-security candidate, but it flags anomalous access behavior rather than classifying what the data actually contains; Config tracks configuration rather than inspecting object content, and Trusted Advisor provides general best-practice checks with no content classification.',
  },
  {
    id: 'dp-006',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A healthcare application must encrypt sensitive patient data client-side before that data ever leaves the application, such that AWS never has access to the plaintext at any point, and the team has been told to use an audited, managed cryptographic library for this rather than writing custom encryption code of their own. The application already uses SSE-S3 on a separate, lower-sensitivity bucket used only for application logs, a configuration which does not meet this new, stricter requirement for the patient-data workload.',
    options: [
      {
        id: 'a',
        text: 'The AWS Encryption SDK (or the equivalent Amazon S3 Encryption Client), which generates data keys via KMS but performs the actual encryption operation locally within the application before the ciphertext is ever uploaded to S3.',
      },
      {
        id: 'b',
        text: 'SSE-KMS applied to the destination bucket, where the S3 service itself performs the encryption operation server-side using a KMS-backed key.',
      },
      {
        id: 'c',
        text: 'SSE-S3, matching the same server-side encryption approach already used on the existing, lower-sensitivity application-log bucket.',
      },
      {
        id: 'd',
        text: 'S3 Bucket Keys, a cost-optimization feature that reduces the number of calls made to KMS when SSE-KMS is already in use.',
      },
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
      'A platform team manages database credentials, third-party API keys, and OAuth tokens for a set of several dozen microservices, and wants a solution that provides automatic rotation on a defined schedule, fine-grained IAM-based access control on a per-secret basis, and CloudTrail-logged visibility into every single retrieval of any of those values. The team currently bakes some of these same secrets as plaintext environment variables directly into container images at build time, and is separately evaluating whether to switch from Docker Compose to a different local development orchestration tool for their laptops.',
    options: [
      {
        id: 'a',
        text: 'AWS Systems Manager Parameter Store, Standard tier, storing each value as a SecureString parameter encrypted with a KMS key and controlled via IAM policy.',
      },
      {
        id: 'b',
        text: 'AWS Secrets Manager, which provides built-in automatic rotation (including native rotation Lambda functions for several common database engines), per-secret resource policies for fine-grained access control, and CloudTrail logging of every access to a secret.',
      },
      {
        id: 'c',
        text: 'Continuing the current practice of baking plaintext secret values directly into the container image at build time, since that approach is already familiar to the team.',
      },
      {
        id: 'd',
        text: 'A private S3 bucket holding a single JSON file that contains all of the credentials for every microservice, accessed by each service at startup.',
      },
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
      'A company wants traffic encrypted end-to-end with TLS both between its clients and its public-facing Application Load Balancer, and separately between that ALB and the backend EC2 targets it forwards traffic to, so that no leg of the connection is ever transmitted in plaintext. The backend EC2 fleet also runs a sidecar log-shipping process on each instance, a component that runs independently of the ALB and target-group configuration. Select the TWO configurations needed to achieve this end-to-end TLS setup.',
    options: [
      {
        id: 'a',
        text: 'Terminate TLS at the ALB using a certificate issued by AWS Certificate Manager and bound to an HTTPS listener, so the client-facing leg of the connection is encrypted.',
      },
      {
        id: 'b',
        text: 'Use plain HTTP for the entire path from client to ALB to backend target, relying instead on the VPC\'s private IP addressing scheme to provide adequate security for the traffic.',
      },
      {
        id: 'c',
        text: 'Disable ALB access logging on the load balancer, in order to reduce the number of TLS handshakes the load balancer needs to perform per request.',
      },
      {
        id: 'd',
        text: 'Set the target group\'s protocol to HTTPS, so the ALB re-encrypts the traffic before forwarding it on to the backend EC2 targets, encrypting the second leg of the connection as well.',
      },
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
      'A financial services company must ensure that a specific KMS key can only ever be used to decrypt data when the decryption request originates from within their corporate VPC through one specific, designated VPC endpoint, and never directly over the public internet, even in a scenario where the requesting principal presents otherwise fully valid IAM credentials. The compliance team separately reviews the company\'s SOC 2 report once a year through AWS Artifact, an activity the compliance team runs each January.',
    options: [
      {
        id: 'a',
        text: 'Rely on requiring strong, complex passwords for the IAM users who are permitted to use the key.',
      },
      {
        id: 'b',
        text: 'Enable S3 versioning on the bucket that holds the objects encrypted with this key, to preserve prior object versions.',
      },
      {
        id: 'c',
        text: 'Add a condition to the KMS key policy (or an equivalent IAM policy) using the aws:SourceVpce or aws:SourceVpc condition key, restricting use of the key to requests that traverse the one specific, designated VPC endpoint.',
      },
      {
        id: 'd',
        text: 'Switch the affected objects from SSE-KMS to SSE-S3, which uses AWS-owned keys instead of a customer managed key with a configurable key policy.',
      },
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
      'A regulated financial company must guarantee that a particular category of highly sensitive key material lives exclusively inside single-tenant, customer-controlled hardware security modules that are validated to FIPS 140-2 Level 3. Those modules must be kept entirely separate from any AWS-operated, multi-tenant HSM fleet used elsewhere in the platform, with no AWS operational personnel able to access that material under any circumstances. The company already uses AWS KMS customer managed keys for a separate set of less-sensitive workloads, a configuration that does not meet this considerably stricter exclusivity requirement for the sensitive category of key material in question.',
    options: [
      {
        id: 'a',
        text: 'AWS KMS using AWS managed keys, where AWS itself both owns and fully manages the key\'s lifecycle and policy on the customer\'s behalf.',
      },
      {
        id: 'b',
        text: 'AWS KMS using customer managed keys, where the customer controls the key policy and rotation setting but the underlying key material still resides within AWS\'s own shared, multi-tenant HSM fleet.',
      },
      {
        id: 'c',
        text: 'AWS Certificate Manager, issuing a private certificate whose private key is generated and stored within AWS-managed infrastructure rather than in customer-exclusive hardware.',
      },
      {
        id: 'd',
        text: 'AWS CloudHSM, which provisions dedicated, single-tenant hardware security modules validated to FIPS 140-2 Level 3 that remain under the customer\'s exclusive administrative control, entirely separate from AWS KMS\'s shared HSM fleet.',
      },
    ],
    correctAnswers: ['d'],
    explanation:
      'CloudHSM provides single-tenant hardware exclusively under customer control, meeting the strictest exclusivity and validation requirement. KMS with customer managed keys sounds like it satisfies the bar since the customer controls the key policy and rotation, but the underlying HSMs are still part of AWS\'s shared, multi-tenant fleet; AWS managed keys offer even less customer control, and ACM issues and manages TLS certificates rather than providing dedicated, customer-exclusive HSMs for general-purpose decryption key material.',
  },
  {
    id: 'dp-011',
    domain: 'Data Protection',
    questionType: 'single',
    question:
      'A company wants to let a third-party SaaS vendor decrypt a specific set of objects that were encrypted using a customer managed KMS key, without provisioning any IAM identity for that vendor inside the company\'s own AWS account, and wants that access to be easily and independently revocable later without having to edit the key policy document itself. The vendor separately requested a copy of the company\'s SOC 2 report as part of its own vendor-onboarding process, a separate administrative request that the company handled through AWS Artifact.',
    options: [
      {
        id: 'a',
        text: 'Create a KMS grant on the key naming the vendor\'s external AWS account or principal, scoped to a specific set of allowed operations, which can later be retired independently of, and without needing to edit, the key policy itself.',
      },
      {
        id: 'b',
        text: 'Add the vendor\'s AWS account directly as a full principal statement in the key policy, granting it the kms:* action across every operation the key supports.',
      },
      {
        id: 'c',
        text: 'Email the vendor a copy of the key\'s raw plaintext key material so they can decrypt the objects using their own local cryptographic tooling.',
      },
      {
        id: 'd',
        text: 'Set the key policy\'s principal element to "*", allowing any AWS principal anywhere to use the key subject only to whatever other conditions are present.',
      },
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
      'A security team reviewing an RDS instance that stores customer PII learns that the instance was originally provisioned three years ago, before the company had adopted a formal encryption standard for new databases, and separately learns that its maintenance window is set to Sunday 3-4am UTC, a scheduling detail noted in the instance\'s tags. Select the TWO controls that should be implemented to protect this specific instance\'s data both at rest and in transit going forward.',
    options: [
      {
        id: 'a',
        text: 'Enable encryption at rest on the RDS instance by performing a snapshot of the existing instance and restoring that snapshot into a new, encrypted copy using a KMS key, since encryption cannot be toggled on directly for an already-running, unencrypted instance.',
      },
      {
        id: 'b',
        text: 'Enforce SSL/TLS for all connections to the database by setting the appropriate parameter group option, such as rds.force_ssl for certain engines or require_secure_transport for others.',
      },
      {
        id: 'c',
        text: 'Disable automated backups on the instance entirely, on the reasoning that this reduces the overall attack surface associated with the database.',
      },
      {
        id: 'd',
        text: 'Make the RDS instance publicly accessible over the internet so that the security team can connect to it directly from outside the VPC to carry out this review.',
      },
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
      'A company wants an absolute guarantee that no account inside its "Sandbox" organizational unit can ever launch resources in any AWS region outside of us-east-1 and eu-west-1, regardless of whatever IAM permissions a developer might grant themselves from within one of those sandbox accounts, following a recent audit that found a developer had accumulated broad, self-granted IAM permissions inside a sandbox account over several months. Accounts inside the Sandbox OU are also subject to a $500/month AWS Budgets alert, a separate cost-control mechanism the finance team put in place.',
    options: [
      {
        id: 'a',
        text: 'An IAM policy attached only to each affected account\'s root user, restricting which regions the root user specifically may launch resources in.',
      },
      {
        id: 'b',
        text: 'A Service Control Policy attached to the Sandbox OU that denies actions unless the aws:RequestedRegion condition key matches one of the two allowed regions, enforced for every principal in every account within that OU regardless of local IAM configuration.',
      },
      {
        id: 'c',
        text: 'The existing AWS Budgets alert for the Sandbox OU, tightened so that it also fires a notification whenever spend appears in an unusual region.',
      },
      {
        id: 'd',
        text: 'A CloudWatch alarm configured to notify the security team whenever a resource is created in a region outside of the two allowed regions.',
      },
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
      'A company must demonstrate to an external auditor that resources spread across 30 AWS accounts continuously comply with a defined security baseline — including requirements such as encrypted EBS volumes and no publicly accessible S3 buckets — and specifically wants ongoing, automated evaluation of that compliance state, rather than continuing with the quarterly manual spreadsheet review the compliance team currently maintains, a spreadsheet that also separately tracks an inventory of software license counts across the company.',
    options: [
      {
        id: 'a',
        text: 'Continue the existing quarterly manual spreadsheet review, simply performed with more care and attention to detail each quarter than before.',
      },
      {
        id: 'b',
        text: 'IAM Access Analyzer used on its own, without any additional service, as the sole mechanism for demonstrating this compliance to the auditor.',
      },
      {
        id: 'c',
        text: 'AWS Config Rules, potentially packaged together as a conformance pack, combined with a multi-account Config aggregator to give one consolidated compliance view across all 30 accounts.',
      },
      {
        id: 'd',
        text: 'Amazon CloudWatch Synthetics canaries, configured to periodically check the availability and response correctness of the company\'s public-facing endpoints.',
      },
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
      'A compliance officer, who also separately manages the team\'s AWS Marketplace software subscriptions as a separate procurement responsibility, needs on-demand access to AWS\'s SOC 2 and ISO 27001 audit reports in order to respond to a customer\'s security questionnaire, and separately needs to formally review and accept the HIPAA Business Associate Addendum before the company can begin processing certain healthcare-related workloads on AWS.',
    options: [
      {
        id: 'a',
        text: 'AWS Marketplace, the same procurement portal the officer already uses to manage the team\'s existing third-party software subscriptions.',
      },
      {
        id: 'b',
        text: 'AWS Config, which tracks and evaluates the configuration state of resources rather than providing access to AWS\'s own compliance certification documents.',
      },
      {
        id: 'c',
        text: 'Amazon Inspector, which performs automated vulnerability and network-reachability scanning of workloads rather than providing compliance documentation.',
      },
      {
        id: 'd',
        text: 'AWS Artifact, the self-service portal that provides on-demand access to AWS\'s compliance reports such as SOC 2 and ISO 27001, and that also supports reviewing and formally accepting agreements such as the HIPAA BAA.',
      },
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
      'During a shared-responsibility training session held jointly for new hires on both the security and platform engineering teams, a cloud engineer who just joined the security team asks who is actually responsible for patching the underlying hypervisor and the physical host infrastructure that supports the company\'s EC2 fleet. The company\'s guest-OS patch compliance is separately tracked at 94% through Systems Manager Patch Manager, an internal metric the engineer happened to notice on a dashboard earlier that same day. The training session is being co-run by two different teams as part of a broader onboarding curriculum. Who is actually responsible for the hypervisor and physical host layer underneath EC2?',
    options: [
      {
        id: 'a',
        text: 'AWS is responsible for the hypervisor and physical host layer, as part of what AWS terms "security of the cloud" under the shared responsibility model.',
      },
      {
        id: 'b',
        text: 'The customer is responsible for the hypervisor and physical host layer, as part of what AWS terms "security in the cloud" under the shared responsibility model.',
      },
      {
        id: 'c',
        text: 'Responsibility for every layer of the EC2 stack, including the hypervisor, is split exactly 50/50 between AWS and the customer regardless of which layer is being discussed.',
      },
      {
        id: 'd',
        text: 'The customer\'s third-party financial auditor is responsible for the hypervisor and physical host layer as part of its independent assessment engagement.',
      },
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
      'A company wants every newly created member account to automatically receive a set of preventive guardrails — such as "deny leaving the organization" and "deny disabling GuardDuty" — the instant the account is created, with absolutely zero manual follow-up required from anyone, following an incident in which a newly created account sat completely unprotected by these guardrails for two full days before anyone noticed and manually applied them. The IT helpdesk separately tracks account-provisioning tickets in Jira as part of its own internal workflow, a tracking detail logged for the helpdesk\'s own internal reporting.',
    options: [
      {
        id: 'a',
        text: 'Manually attach the relevant SCPs to each new account right after it is created, with the task tracked and checked off via the corresponding Jira provisioning ticket.',
      },
      {
        id: 'b',
        text: 'Attach the relevant SCPs to the organizational unit that new accounts are automatically placed into at the moment of creation, so the guardrails apply immediately without any separate manual step.',
      },
      {
        id: 'c',
        text: 'Configure an automated Jira reminder that prompts someone to attach the appropriate SCP within 24 hours of a new account being created.',
      },
      {
        id: 'd',
        text: 'Rely on each new account\'s owner to independently configure equivalent local IAM policies that approximate the intent of the missing SCPs.',
      },
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
      'During a security architecture review, one engineer confidently claims that Service Control Policies can grant new permissions to a principal on their own, a second engineer claims SCPs simply don\'t apply at all to an account\'s own root user, and a third engineer brings up the company\'s separate, ongoing AWS Config conformance-pack rollout. Select the TWO statements about SCPs below that are actually correct.',
    options: [
      {
        id: 'a',
        text: 'SCPs can grant permissions to a principal even in cases where no IAM identity-based policy or resource-based policy otherwise allows that action.',
      },
      {
        id: 'b',
        text: 'SCPs set the maximum available permissions ceiling for an account but never grant any permission by themselves — a separate IAM identity-based or resource-based policy must still independently allow the action for it to actually succeed.',
      },
      {
        id: 'c',
        text: 'SCPs affect every principal within the affected account, including that account\'s own root user, with no exception carved out for root.',
      },
      {
        id: 'd',
        text: 'SCPs apply only to IAM users specifically, and never apply to IAM roles under any circumstances.',
      },
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
      'A security team operating within a 120-account AWS Organization wants to designate one centralized account from which they can configure and view GuardDuty, Security Hub, and Detective findings across every single member account, without having to individually assume a separate cross-account IAM role into each of those 120 accounts one at a time whenever they need to check something. The Organization\'s management account separately handles consolidated billing across all member accounts, which addresses cost visibility for the finance team but does nothing to solve this particular security-administration need.',
    options: [
      {
        id: 'a',
        text: 'Consolidated billing, somehow extended in scope to also cover viewing and configuring security dashboards across the Organization.',
      },
      {
        id: 'b',
        text: 'Manually created cross-account IAM roles set up individually in every one of the 120 member accounts, each one assumed separately whenever the security team needs access to that account.',
      },
      {
        id: 'c',
        text: 'Designating a delegated administrator account within AWS Organizations specifically for GuardDuty, Security Hub, and Detective, giving that account native, centralized configuration and visibility across every member account.',
      },
      {
        id: 'd',
        text: 'AWS Budgets, configured with custom account groupings that mirror the Organization\'s existing account structure.',
      },
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
      'A company preparing for an upcoming PCI DSS audit wants to quickly evaluate its environment against a pre-built collection of AWS Config rules that are already mapped to specific PCI DSS requirements, rather than having someone manually research and hand-select each individual Config rule that might be relevant to the standard. The finance team is separately reviewing Cost Explorer data during the same week to forecast next quarter\'s cloud spend, a separate exercise running in parallel that same week.',
    options: [
      {
        id: 'a',
        text: 'AWS Systems Manager Compliance, which surfaces per-resource patch and state-association compliance information rather than a mapped set of rules for a specific regulatory framework.',
      },
      {
        id: 'b',
        text: 'The AWS Well-Architected Tool, applying the Security pillar lens to the workload as a manual, point-in-time self-assessment exercise.',
      },
      {
        id: 'c',
        text: 'AWS Trusted Advisor\'s full set of Business/Enterprise-tier checks, which span general best practices across cost, performance, security, and fault tolerance.',
      },
      {
        id: 'd',
        text: 'An AWS Config conformance pack built specifically for PCI DSS, which bundles the relevant, pre-mapped Config rules together and deploys them as a single unit rather than requiring manual, rule-by-rule selection.',
      },
    ],
    correctAnswers: ['d'],
    explanation:
      'A conformance pack bundles Config rules mapped to a framework like PCI DSS and deploys them as one unit, avoiding manual rule-by-rule selection. Systems Manager Compliance tracks operational patch/association state per resource rather than a security framework, the Well-Architected Tool is a manual self-assessment review rather than an automated, continuously evaluated rule set, and Trusted Advisor\'s checks span general best practices without being mapped to a specific compliance framework like PCI DSS.',
  },
  {
    id: 'msg-009',
    domain: 'Management and Security Governance',
    questionType: 'multi',
    question:
      'A team managing a fully managed RDS database that stores customer PII is clarifying, ahead of a refresher training session on the shared responsibility model, exactly which security-related duties remain theirs versus which ones AWS handles for a managed service like this. The database runs as a Multi-AZ deployment, a resiliency configuration the team adopted purely for high-availability purposes. Select the TWO items below that remain the customer\'s responsibility even though RDS is a fully managed service.',
    options: [
      {
        id: 'a',
        text: 'Physically replacing failed disks and other failed hardware components underlying the managed RDS instance.',
      },
      {
        id: 'b',
        text: 'Patching the underlying database engine\'s operating system and host infrastructure in its entirety, end to end.',
      },
      {
        id: 'c',
        text: 'Configuring the security groups that control network access to the RDS instance, along with the database-level user accounts and permissions defined inside the database engine itself.',
      },
      {
        id: 'd',
        text: 'Deciding whether to enable encryption at rest for the instance, and separately configuring the instance to enforce SSL/TLS for client connections.',
      },
    ],
    correctAnswers: ['c', 'd'],
    explanation:
      'Even for a fully managed service, the customer configures network access controls and database-level users, and chooses to enable encryption and enforce TLS. AWS handles physical hardware maintenance and the bulk of underlying host/engine patching orchestration for a managed service like RDS, even though Multi-AZ changes availability characteristics, not this responsibility split.',
  },
]
