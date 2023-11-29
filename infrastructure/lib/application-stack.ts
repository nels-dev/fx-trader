import * as cdk from "aws-cdk-lib";
import {RemovalPolicy} from "aws-cdk-lib";
import {Construct} from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import {LogDriver} from 'aws-cdk-lib/aws-ecs'
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {UpdatePolicy} from "aws-cdk-lib/aws-autoscaling";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // IMPORTANT: make sure CDK does not create an expensive NAT gateway by default
    const vpc = new ec2.Vpc(this, 'BackendClusterVpc', {
      natGateways: 0,
      enableDnsHostnames: true,
      enableDnsSupport: true, 
      maxAzs:2,
      subnetConfiguration:[
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ]
    })
    const cluster = new ecs.Cluster(this, 'FxAssistBackendCluster', {
      clusterName: 'FxAssistBackendCluster',
      vpc: vpc
    });

    // Add EC2 instances as capacity to the cluster. Managed by an auto scaling group which only allow at most 1 active instance.
    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new ec2.InstanceType('t2.micro'),
      desiredCapacity: 1,
      maxCapacity:2,
      minCapacity:0,
      allowAllOutbound: true,
      updatePolicy: UpdatePolicy.rollingUpdate({
        minInstancesInService: 1,
        maxBatchSize: 1,
        minSuccessPercentage: 0,
        waitOnResourceSignals: true
      })
    })

    // Setup load balancer and target group
    const securityGroup = new ec2.SecurityGroup(this, 'applicationSecurityGroup', {
      vpc: cluster.vpc,
      allowAllOutbound: true
    })
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80))

    const alb = new elb.ApplicationLoadBalancer(this, 'loadBalancer', {
      vpc: cluster.vpc,
      internetFacing: true,
      securityGroup: securityGroup,
    })

    new cloudfront.Distribution(this, 'cfDistribution', {
      defaultBehavior:{
        origin: new origins.LoadBalancerV2Origin(alb, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
        }),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT
      }
    })

    const targetGroup = alb.addListener('listener', {port: 80, open: true}).addTargets('ecsTarget', {
      port: 80
    })


    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'FxAssistBackendTask', {
      family:'ApplicationStackFxAssistBackendTask',
    });

    // A placeholder container
    taskDefinition.addContainer('Application', {
      containerName: 'Application',
      // Limitation: defining a public ECR repository from CDK is not supported. The repository is created manually
      // Moreover, a task definition must contain a valid image, so the first image with "latest" tag is uploaded manually
      image: ecs.ContainerImage.fromRegistry('public.ecr.aws/h7u1f7w9/fx-assist-backend-repository:latest'),
      cpu: 512,
      memoryLimitMiB: 500,
      portMappings: [
        {
          hostPort: 80,
          containerPort: 8080
        }
      ],
      environment:{
        "MONGODB_PASSWORD": process.env.MONGO_PASSWORD || '',
        "EMAIL_APIKEY": process.env.EMAIL_APIKEY || ''
      },
      logging: LogDriver.awsLogs({streamPrefix: 'backend', logGroup: new LogGroup(this, 'ApplicationLogGroup', {logGroupName: '/app/FxAssistBackend', retention: RetentionDays.FIVE_DAYS, removalPolicy: RemovalPolicy.DESTROY})})
    })
    const service = new ecs.Ec2Service(this, 'Service', {
      serviceName: 'FxAssistBackendService',
      cluster,
      taskDefinition,
      minHealthyPercent: 0,
      maxHealthyPercent: 200,
    })

    targetGroup.addTarget(service)
  }
}