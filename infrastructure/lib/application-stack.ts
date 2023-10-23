import * as cdk from "aws-cdk-lib";
import {Construct} from 'constructs';
import * as ecr from "aws-cdk-lib/aws-ecr"
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import {LogDriver} from 'aws-cdk-lib/aws-ecs'
import {UpdatePolicy} from "aws-cdk-lib/aws-autoscaling";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Public repo allows more storage in the free tier
    const ecrPublicRepository = ecr.Repository.fromRepositoryName(this, "repository", "public.ecr.aws/h7u1f7w9/fx-assist-backend-repository")

    const cluster = new ecs.Cluster(this, 'FxAssistBackendCluster', {});

    // Add EC2 instances as capacity to the cluster. Managed by an auto scaling group which only allow at most 1 active instance.
    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new ec2.InstanceType('t2.micro'),
      desiredCapacity: 1,
      maxCapacity:1,
      minCapacity:0,
      allowAllOutbound: true,
      updatePolicy: UpdatePolicy.rollingUpdate({
        minInstancesInService: 0,
        maxBatchSize: 1,
        minSuccessPercentage: 0,
      })
    })


    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'FxAssistBackendTask', {
      family:'ApplicationStackFxAssistBackendTask',
    });
    const container = taskDefinition.addContainer('Application', {
      containerName: 'Application',
      image: ecs.ContainerImage.fromRegistry('alpine'),
      memoryLimitMiB: 512,
      command: ['tail', '-f', '/dev/null']
    })
    new ecs.Ec2Service(this, 'Service', {cluster, taskDefinition, desiredCount: 1, minHealthyPercent: 0, maxHealthyPercent: 100})
  }
}